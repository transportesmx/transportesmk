import { getServiceSupabase } from '@/lib/supabase';
import { crearEventoCalendario } from '@/lib/google-calendar';
import { enviarEmailConfirmacion } from '@/lib/email';

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function generarPDFBuffer(reservaData, lang = 'es') {
  try {
    const { generarHojaServicio } = await import('@/lib/pdf-generator');
    const doc = generarHojaServicio(reservaData, lang);
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('[PDF] Error generando PDF:', err.message);
    return null;
  }
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
        const meta = session.metadata || {};
        const lang = meta.lang || 'es';
        console.log('[Webhook] Pago completado:', session.id, '| Idioma:', lang);

        const supabase = getServiceSupabase();

        // Verificar si ya fue procesado por verificar-sesion
        if (supabase && meta.reservaId) {
          const { data: reserva } = await supabase
            .from('reservas')
            .select('estado')
            .eq('id', meta.reservaId)
            .single();

          if (reserva?.estado === 'confirmada') {
            console.log('[Webhook] Ya procesado por verificar-sesion, omitiendo');
            break;
          }
        }

        // Procesar post-pago
        if (supabase && meta.reservaId) {
          try {
            await supabase.from('reservas').update({ estado: 'pagada' }).eq('id', meta.reservaId);
            console.log('[Supabase] Reserva actualizada a pagada');
          } catch (err) {
            console.error('[Supabase] Error:', err.message);
          }
        }

        const reservaData = {
          id: meta.reservaId || session.id.slice(-8),
          clienteNombre: meta.clienteNombre || '',
          clienteEmail: session.customer_email || '',
          clienteTelefono: meta.clienteTelefono || '',
          origen: meta.origen || '',
          destino: meta.destino || '',
          fechaIda: meta.fechaIda || '',
          horaIda: meta.horaIda || '',
          vehiculoNombre: meta.vehiculoNombre || '',
          vehiculoId: meta.vehiculoId || '',
          numPasajeros: meta.numPasajeros || '',
          precioTotal: session.amount_total / 100,
          distancia: meta.distancia || '',
          duracion: meta.duracion || '',
          tipoViaje: meta.tipoViaje || 'sencillo',
          fechaRegreso: meta.fechaRegreso || '',
          horaRegreso: meta.horaRegreso || '',
          numMaletas: meta.numMaletas || '',
          aerolinea: meta.aerolinea || '',
          numVuelo: meta.numVuelo || '',
          metodoPago: session.payment_method_types?.[0] || 'tarjeta',
          estadoPago: 'pagado',
        };

        const pdfBuffer = await generarPDFBuffer(reservaData, lang);
        console.log('[PDF]', pdfBuffer ? `Generado (${pdfBuffer.length} bytes) [${lang}]` : 'No se pudo generar');

        try {
          await enviarEmailConfirmacion(reservaData, pdfBuffer, lang);
        } catch (emailErr) {
          console.error('[Email] Error:', emailErr.message);
        }

        try {
          const eventId = await crearEventoCalendario(reservaData, lang);
          if (eventId && supabase && meta.reservaId) {
            await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', meta.reservaId);
            console.log('[Calendar] Evento creado y reserva confirmada');
          }
        } catch (calError) {
          console.error('[Calendar] Error:', calError.message);
        }

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
