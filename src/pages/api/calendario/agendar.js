import { crearEventoCalendario } from '@/lib/google-calendar';

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
    const eventId = await crearEventoCalendario(reserva);
    return res.status(200).json({ eventId });
  } catch (error) {
    console.error('Error creando evento:', error);
    return res.status(500).json({ message: error.message });
  }
}
