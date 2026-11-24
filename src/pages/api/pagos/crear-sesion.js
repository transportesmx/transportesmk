
import { getServiceSupabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { reserva } = req.body || {};

  if (!reserva) {
    return res.status(400).json({
      message: 'Faltan datos de la reserva',
    });
  }

  try {
    // 1. Validar el importe recibido
    const precioOriginal = Number(reserva.precioTotal);

    if (
      !Number.isFinite(precioOriginal) ||
      precioOriginal <= 0
    ) {
      return res.status(400).json({
        message: 'El importe de la reserva no es válido.',
      });
    }

    // 2. Validar código de descuento en el servidor
    const codigoDescuento = String(
      reserva.codigoDescuento || ''
    ).trim().toUpperCase();

    const cupones = {
      TRANSFERMX10: 10,
    };

    if (codigoDescuento && !cupones[codigoDescuento]) {
      return res.status(400).json({
        message: 'El código de descuento no es válido.',
      });
    }

    const porcentajeDescuento =
      cupones[codigoDescuento] || 0;

    const precioOriginalCentavos = Math.round(
      precioOriginal * 100
    );

    const descuentoCentavos = Math.round(
      precioOriginalCentavos *
      porcentajeDescuento / 100
    );

    const precioFinalCentavos =
      precioOriginalCentavos - descuentoCentavos;

    const precioFinal = precioFinalCentavos / 100;

    // 3. CONSERVAR OBSERVACIONES DEL CLIENTE
    const observaciones = String(
      reserva.observaciones || ''
    ).trim();

    // 4. Guardar reserva en Supabase
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
          precio_total: precioFinal,
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

    // 5. Si Stripe no está configurado, modo demo
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log(
        '[API] Stripe no configurado — modo demo'
      );

      return res.status(200).json({
        sessionId: `demo_${Date.now()}`,
        reservaId,
        mode: 'demo',
        precioOriginal,
        descuento: descuentoCentavos / 100,
        precioFinal,
        observaciones,
      });
    }

    // 6. Seleccionar imagen del vehículo
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

    // 7. Crear sesión Stripe Checkout
    const Stripe = (await import('stripe')).default;

    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

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
                `${reserva.fechaIda} ${reserva.horaIda}`,
              images: [imagenVehiculo],
            },
            unit_amount: precioFinalCentavos,
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
        reservaId: String(reservaId || ''),
        clienteNombre: String(reserva.clienteNombre || ''),
        clienteTelefono: String(reserva.clienteTelefono || ''),
        origen: String(reserva.origen || ''),
        destino: String(reserva.destino || ''),
        fechaIda: String(reserva.fechaIda || ''),
        horaIda: String(reserva.horaIda || ''),
        vehiculoNombre: String(reserva.vehiculoNombre || ''),
        vehiculoId: String(reserva.vehiculoId || ''),
        tipoViaje: String(reserva.tipoViaje || ''),
        numPasajeros: String(reserva.numPasajeros || ''),
        distancia: String(reserva.distancia || ''),
        duracion: String(reserva.duracion || ''),
        fechaRegreso: String(reserva.fechaRegreso || ''),
        horaRegreso: String(reserva.horaRegreso || ''),
        precioTotalOriginal: precioOriginal.toFixed(2),
        precioTotal: precioFinal.toFixed(2),
        codigoDescuento,
        porcentajeDescuento: String(porcentajeDescuento),
        importeDescuento: (
          descuentoCentavos / 100
        ).toFixed(2),
        numMaletas: String(reserva.numMaletas || 0),
        aerolinea: String(reserva.aerolinea || ''),
        numVuelo: String(reserva.numVuelo || ''),

        // CORRECCIÓN: enviar observaciones a Stripe
        // Stripe permite máximo 500 caracteres por valor metadata
        observaciones: observaciones.slice(0, 500),

        lang: String(reserva.lang || 'es'),
      },
    });

    // 8. Actualizar reserva con ID de Stripe
    if (supabase && reservaId) {
      const { error } = await supabase
        .from('reservas')
        .update({
          stripe_session_id: session.id,
        })
        .eq('id', reservaId);

      if (error) {
        console.error(
          '[Supabase] Error actualizando sesión:',
          error
        );
      }
    }

    console.log(
      '[Stripe] Sesión creada:',
      session.id
    );

    console.log(
      '[Stripe] Observaciones transmitidas:',
      observaciones ? 'Sí' : 'Vacías'
    );

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
      reservaId,
      precioOriginal,
      descuento: descuentoCentavos / 100,
      precioFinal,
    });

  } catch (error) {
    console.error(
      'Error creando sesión de pago:',
      error
    );

    return res.status(500).json({
      message: 'No se pudo crear la sesión de pago.',
    });
  }
}
