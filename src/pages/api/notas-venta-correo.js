/**
 * Correo transaccional para Notas de Venta Transportes MX.
 * Servicio: Brevo Transactional Email API.
 * Requiere BREVO_API_KEY, BREVO_SENDER_EMAIL y (opcional) BREVO_SENDER_NAME.
 */
const ADMIN_EMAIL = 'contacto@transportesmx.org';
export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://transportesmx.org').replace(/\/$/, '');

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}
function money(value) {
  const numeric = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numeric)
    : esc(value || 'Por confirmar');
}
function dateDisplay(value) {
  if (!value) return 'Por confirmar';
  const parts = String(value).split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : esc(value);
}
function icsEscape(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
function toIcsDate(date, time) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return null;
  const safeTime = /^\d{2}:\d{2}$/.test(String(time || '')) ? time : '12:00';
  return `${String(date).replace(/-/g, '')}T${safeTime.replace(':', '')}00`;
}
function buildCalendarAttachment(nota) {
  const start = toIcsDate(nota.fecha, nota.hora);
  if (!start) return null;
  const startDate = new Date(`${nota.fecha}T${/^\d{2}:\d{2}$/.test(String(nota.hora || '')) ? nota.hora : '12:00'}:00`);
  if (Number.isNaN(startDate.getTime())) return null;
  const durationHours = Math.max(1, Math.min(24, Number(nota.duracionHoras || 2)));
  const endDate = new Date(startDate.getTime() + durationHours * 3600000);
  const toLocalIcs = (date) => `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}00`;
  const events = [{
    uid: `${icsEscape(nota.folio)}-ida@transportesmx.org`,
    summary: `Traslado Transportes MX - ${nota.cliente || 'Cliente'}`,
    start: toLocalIcs(startDate), end: toLocalIcs(endDate),
    location: nota.origen || '',
    description: `Folio: ${nota.folio}\nCliente: ${nota.cliente}\nOrigen: ${nota.origen || ''}\nDestino: ${nota.destino || ''}\nPasajeros: ${nota.pasajeros || ''}\nVehículo: ${nota.unidad || ''}\nTeléfono: ${nota.telefono || ''}\nObservaciones: ${nota.observaciones || ''}`,
  }];
  const roundTrip = nota.tipoViaje === 'redondo' || nota.idaVuelta === 'redondo';
  const returnDate = nota.regresoFecha || nota.fechaRegreso;
  const returnTime = nota.regresoHora || nota.horaRegreso;
  if (roundTrip && toIcsDate(returnDate, returnTime)) {
    const returnStart = new Date(`${returnDate}T${/^\d{2}:\d{2}$/.test(String(returnTime || '')) ? returnTime : '12:00'}:00`);
    const returnEnd = new Date(returnStart.getTime() + durationHours * 3600000);
    events.push({
      uid: `${icsEscape(nota.folio)}-regreso@transportesmx.org`,
      summary: `Regreso Transportes MX - ${nota.cliente || 'Cliente'}`,
      start: toLocalIcs(returnStart), end: toLocalIcs(returnEnd),
      location: nota.destino || '',
      description: `Folio: ${nota.folio}\nCliente: ${nota.cliente}\nOrigen: ${nota.destino || ''}\nDestino: ${nota.origen || ''}\nPasajeros: ${nota.pasajeros || ''}\nVehículo: ${nota.unidad || ''}`,
    });
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Transportes MX//Reserva//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  for (const event of events) lines.push('BEGIN:VEVENT', `UID:${event.uid}`, `DTSTAMP:${stamp}`, `DTSTART;TZID=America/Mexico_City:${event.start}`, `DTEND;TZID=America/Mexico_City:${event.end}`, `SUMMARY:${icsEscape(event.summary)}`, `LOCATION:${icsEscape(event.location)}`, `DESCRIPTION:${icsEscape(event.description)}`, 'END:VEVENT');
  lines.push('END:VCALENDAR');
  return Buffer.from(lines.join('\r\n')).toString('base64');
}

function buildHtml(nota) {
  const roundTrip = nota.tipoViaje === 'redondo' || nota.idaVuelta === 'redondo';
  const logo = `${SITE_URL}/logo.jpg`;
  const vehiclePath = String(nota.imagenUnidad || '/sprinter.png').startsWith('/')
    ? String(nota.imagenUnidad || '/sprinter.png') : `/${nota.imagenUnidad}`;
  const vehicle = `${SITE_URL}${vehiclePath}`;
  const customer = esc(nota.cliente || 'Cliente');
  const folio = esc(nota.folio || '—');
  const route = `${esc(nota.origen || 'Origen por confirmar')} → ${esc(nota.destino || 'Destino por confirmar')}`;
  const returnBlock = roundTrip ? `
    <tr><td colspan="3" style="padding:16px 20px;border-top:1px solid #273247">
      <div style="font-size:11px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">REGRESO</div>
      <div style="font-size:15px;color:#f4f6fa;margin-top:6px">${esc(nota.destino || 'Destino')} → ${esc(nota.origen || 'Origen')}</div>
      <div style="font-size:14px;color:#b9c1d0;margin-top:5px">${dateDisplay(nota.regresoFecha || nota.fechaRegreso)} · ${esc(nota.regresoHora || nota.horaRegreso || 'Hora por confirmar')}</div>
    </td></tr>` : '';
  const details = [
    ['FECHA Y HORA', `${dateDisplay(nota.fecha)} · ${esc(nota.hora || 'Por confirmar')}`],
    ['TIPO DE VIAJE', roundTrip ? 'Ida y vuelta' : 'Sencillo'],
    ['VEHÍCULO', esc(nota.unidad || 'Por confirmar')],
    ['PASAJEROS', esc(nota.pasajeros || 'Por confirmar')],
  ];
  const detailsHtml = details.map(([label, value]) => `<td style="width:50%;padding:14px 16px;border-top:1px solid #273247;vertical-align:top"><div style="font-size:10px;letter-spacing:1.4px;color:#d7b56d;font-weight:700">${label}</div><div style="font-size:14px;color:#f4f6fa;margin-top:7px">${value}</div></td>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#080d18;font-family:Arial,Helvetica,sans-serif;color:#f4f6fa">
  <div style="max-width:680px;margin:0 auto;padding:28px 14px 24px">
    <div style="text-align:center;padding:10px 0 24px"><img src="${logo}" alt="Transportes MX" width="210" style="display:block;width:210px;max-width:70%;height:auto;margin:0 auto 22px">
      <div style="font-size:12px;letter-spacing:3px;color:#d7b56d;font-weight:700">TRANSPORTES MX</div>
      <div style="font-size:28px;line-height:1.25;font-weight:800;margin-top:10px;color:#fff">🚗 NUEVA RESERVA <span style="color:#d7b56d">MANUAL</span></div>
    </div>
    <div style="border:1px solid #354052;border-radius:16px;overflow:hidden;background:#0c1322">
      <div style="padding:20px;border-bottom:1px solid #273247;display:flex;align-items:center">
        <div style="font-size:24px;color:#d7b56d;margin-right:14px">🚗</div><div><div style="font-size:17px;font-weight:700;color:#fff">Nueva Reserva Manual</div><div style="font-size:13px;color:#aab4c5;margin-top:5px">Folio ${folio}</div></div>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
        <tr><td colspan="3" style="padding:18px 20px"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">CLIENTE</div><div style="font-size:18px;font-weight:700;color:#fff;margin-top:6px">${customer}</div></td></tr>
        <tr><td style="width:50%;padding:14px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">EMAIL</div><div style="font-size:14px;color:#f4f6fa;margin-top:6px;word-break:break-word">${esc(nota.email || '—')}</div></td><td style="width:50%;padding:14px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">TELÉFONO</div><div style="font-size:14px;color:#f4f6fa;margin-top:6px">${esc(nota.telefono || '—')}</div></td></tr>
        <tr><td colspan="3" style="padding:16px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">RUTA</div><div style="font-size:15px;line-height:1.5;color:#f4f6fa;margin-top:7px">${route}</div></td></tr>
        ${returnBlock}
        <tr>${detailsHtml}</tr>
        <tr><td colspan="3" style="padding:16px 20px"><div style="border:1px solid #176b47;border-radius:12px;background:#06291f;padding:16px 18px"><div style="font-size:11px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">TOTAL</div><div style="font-size:30px;line-height:1.3;font-weight:800;color:#36dc8a;margin-top:5px">${money(nota.importe)}</div><div style="font-size:12px;color:#a9c9b9;margin-top:3px">MXN</div></div></td></tr>
        ${nota.observaciones ? `<tr><td colspan="3" style="padding:14px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">OBSERVACIONES</div><div style="font-size:14px;color:#e4e8ef;line-height:1.5;margin-top:6px">${esc(nota.observaciones)}</div></td></tr>` : ''}
      </table>
    </div>
    <div style="margin-top:18px;padding:16px 20px;border:1px solid #354052;border-radius:12px;background:#101b2d"><div style="font-size:15px;font-weight:700;color:#d7b56d">📅 Agrega tu traslado a tu calendario</div><div style="font-size:13px;line-height:1.5;color:#e4e8ef;margin-top:7px">Adjuntamos un archivo de calendario (.ics) con la fecha, hora, origen, destino y folio de tu servicio. Abre el archivo para agregar la cita a Google Calendar, Apple Calendar u Outlook.</div></div>
    <div style="text-align:center;padding:24px 8px 18px;border-bottom:1px solid #d7b56d"><div style="font-size:14px;color:#e4e8ef">¿Necesitas ayuda?</div><a href="mailto:contacto@transportesmx.org" style="display:inline-block;margin-top:7px;color:#d7b56d;text-decoration:none;font-weight:700">contacto@transportesmx.org</a><br><a href="https://transportesmx.org" style="display:inline-block;margin-top:9px;color:#d7b56d;text-decoration:none">https://transportesmx.org</a></div>
    <div style="text-align:center;padding-top:16px;font-size:11px;line-height:1.6;color:#7f8a9d">Grupo Turístico MX S. de R.L. de C.V.<br>Confirmación de Nota de Venta · Transportes MX</div>
  </div></body></html>`;
}


/**
 * Reserva un folio de manera atómica en Supabase antes de contactar a Brevo.
 * La restricción PRIMARY KEY en folio bloquea solicitudes simultáneas/repetidas.
 * Requiere SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY.
 */
async function reservarEnvioPorFolio(folio, clienteEmail) {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Falta SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/notas_venta_email_envios`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      folio: String(folio).trim(),
      cliente_email: String(clienteEmail).trim().toLowerCase(),
      status: 'processing',
    }),
  });

  // Postgres unique constraint (folio PRIMARY KEY): el folio ya fue reservado.
  if (response.status === 409) return false;
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Supabase no pudo reservar el folio (${response.status}): ${detail}`);
  }
  return true;
}

async function actualizarRegistroEnvio(folio, values) {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(
    `${supabaseUrl}/rest/v1/notas_venta_email_envios?folio=eq.${encodeURIComponent(String(folio).trim())}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(values),
    }
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('[Supabase registro correo nota]', response.status, detail);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }
  const nota = req.body?.nota || req.body;
  const pdfNotaBase64 = req.body?.pdfNotaBase64 || '';
  if (!nota?.folio || !nota?.cliente || !nota?.email) {
    return res.status(400).json({ success: false, message: 'Folio, cliente y correo del cliente son obligatorios.' });
  }
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    return res.status(500).json({ success: false, message: 'Falta configurar BREVO_API_KEY o BREVO_SENDER_EMAIL en Vercel.' });
  }
  if (pdfNotaBase64 && (typeof pdfNotaBase64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfNotaBase64))) {
    return res.status(400).json({ success: false, message: 'El PDF adjunto no tiene un formato base64 válido.' });
  }
  if (pdfNotaBase64.length > 7_000_000) {
    return res.status(413).json({ success: false, message: 'El PDF adjunto es demasiado grande. Reduce el tamaño de las imágenes de la nota.' });
  }

  const sender = { name: process.env.BREVO_SENDER_NAME || 'Transportes MX', email: process.env.BREVO_SENDER_EMAIL };
  const htmlContent = buildHtml(nota);
  const attachments = pdfNotaBase64 ? [{
    name: `Nota-de-Venta-${String(nota.folio).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`,
    content: pdfNotaBase64,
  }] : [];
  const calendarBase64 = buildCalendarAttachment(nota);
  if (calendarBase64) attachments.push({
    name: `Cita-Transportes-MX-${String(nota.folio).replace(/[^a-zA-Z0-9_-]/g, '')}.ics`,
    content: calendarBase64,
  });
  const subject = `🚗 Nueva Reserva Manual | Folio ${nota.folio}`;
  async function sendTo(email) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ sender, to: [{ email }], subject, htmlContent, attachment: attachments }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Brevo respondió ${response.status}`);
    return data.messageId || null;
  }
  let folioReservado = false;
  let adminId = null;
  let customerId = null;
  const customerEmail = nota.email.trim();

  try {
    // Punto de control persistente: si otro request ya procesó/está procesando el folio,
    // no se vuelve a invocar Brevo.
    folioReservado = await reservarEnvioPorFolio(nota.folio, customerEmail);
    if (!folioReservado) {
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        message: `El folio ${nota.folio} ya tiene un envío registrado. Se bloqueó el correo duplicado.`,
        sentTo: [],
      });
    }

    adminId = await sendTo(ADMIN_EMAIL);
    // Si el correo del cliente es igual al correo administrativo, no enviar dos veces
    // al mismo buzón.
    if (customerEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      customerId = await sendTo(customerEmail);
    } else {
      customerId = adminId;
    }

    await actualizarRegistroEnvio(nota.folio, {
      status: 'sent',
      admin_message_id: adminId,
      customer_message_id: customerId,
      sent_at: new Date().toISOString(),
      error: null,
    });

    return res.status(200).json({
      success: true,
      messageId: customerId || adminId,
      sentTo: customerEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        ? [ADMIN_EMAIL]
        : [ADMIN_EMAIL, customerEmail],
    });
  } catch (error) {
    // No se libera la reserva: Brevo pudo aceptar un mensaje aunque la conexión
    // haya fallado al devolver la respuesta. Reintentar automáticamente podría duplicarlo.
    if (folioReservado) {
      await actualizarRegistroEnvio(nota.folio, {
        status: (adminId || customerId) ? 'partial_error' : 'error',
        admin_message_id: adminId,
        customer_message_id: customerId,
        error: String(error?.message || error).slice(0, 2000),
      });
    }
    console.error('[Brevo Notas Venta]', error);
    return res.status(502).json({
      success: false,
      message: 'Brevo no pudo confirmar el envío completo. El folio quedó protegido contra reenvíos duplicados.',
      error: error.message,
      folio: nota.folio,
    });
  }
}
