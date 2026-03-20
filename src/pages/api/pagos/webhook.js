import { procesarPostPago } from './verificar-sesion';

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
        console.log('[Webhook] Pago completado:', session.id);

        const result = await procesarPostPago(session);

        if (result.already_processed) {
          console.log('[Webhook] Ya procesado por verificar-sesion, omitiendo');
        } else {
          console.log('[Webhook] Post-pago procesado:', { pdf: result.pdf, email: result.email, calendar: result.calendar });
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
