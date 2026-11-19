
import { getServiceSupabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { reserva } = req.body;

  if (!reserva) {
    return res.status(400).json({
      message: 'Faltan datos de la reserva',
    });
  }

  try {
    // ==========================================
    // 1. CALCULAR Y VALIDAR DESCUENTO EN SERVIDOR
    // ==========================================

    const precioOriginal = Number(reserva.precioTotal);

    if (!Number.isFinite(precioOriginal) || precioOriginal <= 0) {
      return res.status(400).json({
        message: 'El precio de la reserva no es válido',
      });
    }

    const codigoDescuento = String(
      reserva.codigoDescuento || ''
    )
      .trim()
      .toUpperCase();

    // Código promocional válido
    const porcentajeDescuento =
      codigoDescuento === 'TRANSFERMX10' ? 10 : 0;

    // Calcular descuento
    const importeDescuento = porcentajeDescuento
      ? Math.round(precioOriginal * porcentajeDescuento) / 100
      : 0;

    // Total final
    const precioFinal = Math.max(
      0,
      precioOriginal - importeDescuento
    );

    console.log('[Descuento]', {
      codigo: codigoDescuento,
      precioOriginal,
      porcentajeDescuento,
      importeDescuento,
      precioFinal,
    });

    // ==========================================
    // 2. GUARDAR RESERVA EN SUPABASE
    // ==========================================

    let reservaId = null;
    const supabase = getServiceSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('reservas')
        .insert({
          estado: 'pendiente',
          cliente_nombre: reserva.clienteNombre,
          cliente_email: reserva.clienteEmail,
          cliente_telefono: reserva.clienteTelefono,
          origen: reserva.origen,
          destino: reserva.destino,
          fecha_ida: reserva.fechaIda,
          hora_ida: reserva.horaIda,
          tipo_viaje: reserva.tipoViaje,
          fecha_regreso:
            reserva.tipoViaje === 'redondo'
              ? reserva.fechaRegreso
              : null,
          hora_regreso:
            reserva.tipoViaje === 'redondo'
              ? reserva.horaRegreso
              : null,
          num_pasajeros: reserva.numPasajeros,
          distancia: reserva.distancia,
          duracion: reserva.duracion,
          vehiculo_id: reserva.vehiculoId,
          vehiculo_nombre: reserva.vehiculoNombre,

          // Conservamos el precio original en esta columna
          // para no asumir cambios en el esquema de Supabase.
          precio_total: precioOriginal,
        })
        .select()
        .single();

      if (error) {
        console.error(
          '[Supabase] Error guardando reserva:',
          error
        );
      } else {
        reservaId = data.id;

        console.log(
          '[Supabase] Reserva guardada:',
          reservaId
        );
      }
    }

    // ==========================================
    // 3. MODO DEMO SI STRIPE NO ESTÁ CONFIGURADO
    // ==========================================

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('[API] Stripe no configurado — modo demo');

      return res.status(200).json({
        sessionId: `demo_${Date.now()}`,
        reservaId,
        mode: 'demo',
      });
    }

    // ==========================================
    // 4. IMAGEN DEL VEHÍCULO
    // ==========================================

    const imagenesVehiculos = {
      sedan:
        'https://transportesmx.org/assets/autos-stripe/sedan.png',
      suv:
        'https://transportesmx.org/assets/autos-stripe/suburban.png',
      minivan:
        'https://transportesmx.org/assets/autos-stripe/van.png',
      hiace:
        'https://transportesmx.org/assets/autos-stripe/hiace.png',
      sprinter:
        'https://transportesmx.org/assets/autos-stripe/sprinter.png',
    };

    const imagenVehiculo =
      imagenesVehiculos[reserva.vehiculoId] ||
      'https://transportesmx.org/assets/logonegro.png';

    // ==========================================
    // 5. CONECTAR CON STRIPE
    // ==========================================

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Monto final en centavos
    const montoStripe = Math.round(precioFinal * 100);

    // Descripción del descuento
    const descripcionDescuento = porcentajeDescuento
      ? ` | Código ${codigoDescuento}: ${porcentajeDescuento}% de descuento`
      : '';

    // ==========================================
    // 6. CREAR SESIÓN STRIPE CHECKOUT
    // ==========================================

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'oxxo'],

      line_items: [
        {
          price_data: {
            currency: 'mxn',

            product_data: {
              name: `Traslado ${reserva.vehiculoNombre}`,

              description:
                `${reserva.origen} → ${reserva.destino} | ` +
                `${reserva.fechaIda} ${reserva.horaIda}` +
                descripcionDescuento,

              images: [imagenVehiculo],
            },

            // AHORA STRIPE RECIBE EL PRECIO DESCONTADO
            unit_amount: montoStripe,
          },

          quantity: 1,
        },
      ],

      mode: 'payment',

      success_url:
        `${req.headers.origin}/reservar/exito?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${req.headers.origin}/reservar?canceled=true`,

      customer_email: reserva.clienteEmail,

      metadata: {
        reservaId: reservaId || '',
        clienteNombre: reserva.clienteNombre,
        clienteTelefono: reserva.clienteTelefono,
        origen: reserva.origen,
        destino: reserva.destino,
        fechaIda: reserva.fechaIda,
        horaIda: reserva.horaIda,
        vehiculoNombre: reserva.vehiculoNombre,
        vehiculoId: reserva.vehiculoId || '',
        tipoViaje: reserva.tipoViaje,
        numPasajeros: String(reserva.numPasajeros),
        distancia: reserva.distancia || '',
        duracion: reserva.duracion || '',
        fechaRegreso: reserva.fechaRegreso || '',
        horaRegreso: reserva.horaRegreso || '',

        // Información de precios
        precioOriginal: String(precioOriginal),
        codigoDescuento: porcentajeDescuento
          ? codigoDescuento
          : '',
        porcentajeDescuento: String(
          porcentajeDescuento
        ),
        importeDescuento: String(
          importeDescuento
        ),
        precioFinal: String(precioFinal),

        // Conservamos este campo por compatibilidad
        precioTotal: String(precioFinal),

        numMaletas: String(reserva.numMaletas || 0),
        aerolinea: reserva.aerolinea || '',
        numVuelo: reserva.numVuelo || '',
        lang: reserva.lang || 'es',
      },
    });

    // ==========================================
    // 7. GUARDAR ID DE SESIÓN STRIPE
    // ==========================================

    if (supabase && reservaId) {
      await supabase
        .from('reservas')
        .update({
          stripe_session_id: session.id,
        })
        .eq('id', reservaId);
    }

    console.log('[Stripe] Sesión creada:', session.id);

    console.log('[Stripe] Resumen del pago:', {
      precioOriginal,
      importeDescuento,
      precioFinal,
      montoStripe,
    });

    // ==========================================
    // 8. DEVOLVER SESIÓN
    // ==========================================

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
      reservaId,
    });

  } catch (error) {
    console.error(
      'Error creando sesión de pago:',
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
}
