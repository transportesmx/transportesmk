import { getServiceSupabase } from '@/lib/supabase';
import { crearEventoCalendario } from '@/lib/google-calendar';
import { enviarEmailConfirmacion } from '@/lib/email';

/**
 * Genera el PDF en el servidor (Buffer) para adjuntar al email
 */
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

/**
 * Procesa las acciones post-pago (email, PDF, calendario)
 * Se llama desde la página de éxito Y desde el webhook (doble seguridad)
 */
async function procesarPostPago(session) {
  const meta = session.metadata || {};
  const lang = meta.lang || 'es';
  const supabase = getServiceSupabase();

  // Verificar que no se haya procesado ya
  if (supabase && meta.reservaId) {
    const { data: reserva } = await supabase
      .from('reservas')
      .select('estado')
      .eq('id', meta.reservaId)
      .single();

    if (reserva?.estado === 'confirmada' || reserva?.estado === 'pagada') {
      if (reserva.estado === 'confirmada') {
        console.log('[Verificar] Reserva ya confirmada, omitiendo');
        return { already_processed: true };
      }
    }
  }

  console.log('[Verificar] Procesando post-pago para sesión:', session.id, '| Idioma:', lang);

  // 1. Actualizar reserva en Supabase a "pagada"
  if (supabase && meta.reservaId) {
    try {
      await supabase.from('reservas').update({
        estado: 'pagada',
      }).eq('id', meta.reservaId);
      console.log('[Supabase] Reserva actualizada a pagada');
    } catch (err) {
      console.error('[Supabase] Error:', err.message);
    }
  }

  // Datos unificados
  const reservaData = {
    id: meta.reservaId || session.id.slice(-8),
    clienteNombre: meta.clienteNombre || '',
    clienteEmail: session.customer_email || session.customer_details?.email || '',
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

  // 2. Generar PDF en el idioma correspondiente
  const pdfBuffer = await generarPDFBuffer(reservaData, lang);
  console.log('[PDF]', pdfBuffer ? `Generado (${pdfBuffer.length} bytes) [${lang}]` : 'No se pudo generar');

  // 3. Enviar emails en el idioma correspondiente
  let emailResult = null;
  try {
    emailResult = await enviarEmailConfirmacion(reservaData, pdfBuffer, lang);
  } catch (emailErr) {
    console.error('[Email] Error:', emailErr.message);
  }

  // 4. Crear evento en Google Calendar en el idioma correspondiente
  let calendarEventId = null;
  try {
    calendarEventId = await crearEventoCalendario(reservaData, lang);
    if (calendarEventId && supabase && meta.reservaId) {
      await supabase.from('reservas').update({
        estado: 'confirmada',
      }).eq('id', meta.reservaId);
      console.log('[Calendar] Evento creado y reserva confirmada');
    }
  } catch (calError) {
    console.error('[Calendar] Error:', calError.message);
  }

  return {
    processed: true,
    pdf: !!pdfBuffer,
    email: !!emailResult,
    calendar: !!calendarEventId,
    reservaData,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId es requerido' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({ status: 'demo', message: 'Stripe no configurado' });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details'],
    });

    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        status: 'pending',
        payment_status: session.payment_status,
        message: 'El pago aún no se ha completado',
      });
    }

    const result = await procesarPostPago(session);

    return res.status(200).json({
      status: 'success',
      payment_status: session.payment_status,
      ...result,
    });
  } catch (error) {
    console.error('[Verificar] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

// Exportar para uso en webhook
export { procesarPostPago };
