import { getServiceSupabase } from '@/lib/supabase';
import { crearEventoCalendario } from '@/lib/google-calendar';

export const config = {
  api: { bodyParser: false },
};

/**
 * Lee el body raw de la request
 */
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('[Webhook] No configurado — ignorando');
    return res.status(200).json({ received: true, mode: 'demo' });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const buf = await readRawBody(req);
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};
        console.log('✅ Pago completado:', session.id);
        console.log('   Reserva ID:', metadata.reservaId);

        const supabase = getServiceSupabase();

        // 1. Actualizar reserva en Supabase
        if (supabase && metadata.reservaId) {
          const { error } = await supabase.from('reservas').update({
            estado: 'pagada',
            estado_pago: 'pagado',
            stripe_payment_intent: session.payment_intent,
          }).eq('id', metadata.reservaId);

          if (error) {
            console.error('[Supabase] Error actualizando reserva:', error);
          } else {
            console.log('[Supabase] ✅ Reserva actualizada a pagada');
          }
        }

        // 2. Crear evento en Google Calendar
        try {
          const eventId = await crearEventoCalendario({
            clienteNombre: metadata.clienteNombre,
            clienteEmail: session.customer_email,
            clienteTelefono: metadata.clienteTelefono,
            origen: metadata.origen,
            destino: metadata.destino,
            fechaIda: metadata.fechaIda,
            horaIda: metadata.horaIda,
            vehiculoNombre: metadata.vehiculoNombre,
            numPasajeros: metadata.numPasajeros,
            precioTotal: session.amount_total / 100,
            distancia: metadata.distancia,
            duracion: metadata.duracion,
            tipoViaje: metadata.tipoViaje,
          });

          if (eventId && supabase && metadata.reservaId) {
            await supabase.from('reservas').update({
              google_calendar_event_id: eventId,
              estado: 'confirmada',
            }).eq('id', metadata.reservaId);
            console.log('[Calendar] ✅ Evento creado y reserva confirmada');
          }
        } catch (calError) {
          console.error('[Calendar] Error creando evento:', calError.message);
        }

        // 3. TODO: Enviar email de confirmación con Resend
        // ...

        break;
      }
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error webhook:', error.message);
    return res.status(400).json({ error: error.message });
  }
}
