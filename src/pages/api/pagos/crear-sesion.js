import { getServiceSupabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { reserva } = req.body;

  if (!reserva) {
    return res.status(400).json({ message: 'Faltan datos de la reserva' });
  }

  try {
    // 1. Guardar la reserva en Supabase (estado: pendiente)
    let reservaId = null;
    const supabase = getServiceSupabase();

    if (supabase) {
      const { data, error } = await supabase.from('reservas').insert({
        estado: 'pendiente',
        cliente_nombre: reserva.clienteNombre,
        cliente_email: reserva.clienteEmail,
        cliente_telefono: reserva.clienteTelefono,
        origen: reserva.origen,
        destino: reserva.destino,
        fecha_ida: reserva.fechaIda,
        hora_ida: reserva.horaIda,
        tipo_viaje: reserva.tipoViaje,
        fecha_regreso: reserva.tipoViaje === 'redondo' ? reserva.fechaRegreso : null,
        hora_regreso: reserva.tipoViaje === 'redondo' ? reserva.horaRegreso : null,
        num_pasajeros: reserva.numPasajeros,
        distancia: reserva.distancia,
        duracion: reserva.duracion,
        vehiculo_id: reserva.vehiculoId,
        vehiculo_nombre: reserva.vehiculoNombre,
        precio_total: reserva.precioTotal,
      }).select().single();

      if (error) {
        console.error('[Supabase] Error guardando reserva:', error);
      } else {
        reservaId = data.id;
        console.log('[Supabase] Reserva guardada:', reservaId);
      }
    }

    // 2. Si no hay Stripe configurado → modo demo
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('[API] Stripe no configurado — modo demo');
      return res.status(200).json({
        sessionId: `demo_${Date.now()}`,
        reservaId,
        mode: 'demo',
      });
    }

    // 3. Crear sesión de Stripe Checkout
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'oxxo'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Traslado ${reserva.vehiculoNombre}`,
              description: `${reserva.origen} → ${reserva.destino} | ${reserva.fechaIda} ${reserva.horaIda}`,
              images: ['https://transportesmx.org/assets/logo.png'],
            },
            unit_amount: Math.round(reserva.precioTotal * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/reservar/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/reservar?canceled=true`,
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
        precioTotal: String(reserva.precioTotal),
        numMaletas: String(reserva.numMaletas || 0),
        aerolinea: reserva.aerolinea || '',
        numVuelo: reserva.numVuelo || '',
        lang: reserva.lang || 'es',
      },
    });

    // 4. Actualizar reserva con el session ID de Stripe
    if (supabase && reservaId) {
      await supabase.from('reservas').update({
        stripe_session_id: session.id,
      }).eq('id', reservaId);
    }

    console.log('[Stripe] Sesión creada:', session.id);
    return res.status(200).json({ url: session.url, sessionId: session.id, reservaId });
  } catch (error) {
    console.error('Error creando sesión de pago:', error);
    return res.status(500).json({ message: error.message });
  }
}
