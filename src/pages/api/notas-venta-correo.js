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
  const raw = String(value ?? '').trim();
  if (!raw) return 'Por confirmar';

  // Preserve text statuses (e.g. "Pagado") instead of parsing them as $0.00.
  const hasNumericAmount = /\\d/.test(raw);
  const numericText = raw.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  if (!hasNumericAmount || !numericText || !/^-?\\d+(?:\\.\\d+)?$/.test(numericText)) {
    return esc(raw);
  }

  const numeric = Number(numericText);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numeric)
    : esc(raw);
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
  // This archive has the current logo.jpg. Blend modes remove its white JPG canvas
  // in supporting email clients; transparent white/black logo variants are ideal later.
  const logo = `${SITE_URL}/logo.jpg`;
  const customer = esc(nota.cliente || 'Cliente');
  const folio = esc(nota.folio || '—');
  const email = esc(nota.email || '—');
  const phone = esc(nota.telefono || '—');
  const origin = esc(nota.origen || 'Origen por confirmar');
  const destination = esc(nota.destino || 'Destino por confirmar');
  const route = `${origin} <span class="route-arrow">→</span> ${destination}`;
  const amount = money(nota.importe);
  const amountIsText = !/\\d/.test(String(nota.importe ?? '').trim());
  const totalLabel = amountIsText ? 'ESTADO DE PAGO' : 'TOTAL';

  const returnBlock = roundTrip ? `
    <tr><td colspan="2" class="section-cell return-cell">
      <div class="field-label">↩ REGRESO</div>
      <div class="field-value">${destination} <span class="route-arrow">→</span> ${origin}</div>
      <div class="field-subvalue">${dateDisplay(nota.regresoFecha || nota.fechaRegreso)} · ${esc(nota.regresoHora || nota.horaRegreso || 'Hora por confirmar')}</div>
    </td></tr>` : '';

  const detailRows = [
    ['FECHA Y HORA', `${dateDisplay(nota.fecha)} · ${esc(nota.hora || 'Por confirmar')}`],
    ['TIPO DE VIAJE', roundTrip ? 'Ida y vuelta' : esc(nota.tipoViajeTexto || nota.tipoServicio || 'Sencillo')],
    ['VEHÍCULO', esc(nota.unidad || nota.vehiculo || 'Por confirmar')],
    ['PASAJEROS', esc(nota.pasajeros || nota.pax || 'Por confirmar')],
  ];
  const detailsHtml = detailRows.map(([label, value]) => `
    <td class="detail-cell">
      <div class="field-label">${label}</div>
      <div class="field-value">${value}</div>
    </td>`).join('');

  const distance = nota.distancia ? `<span>📏 Distancia: ${esc(nota.distancia)}</span>` : '';
  const duration = nota.duracion || nota.duracionTexto || nota.tiempoEstimado
    ? `<span>⏱ Duración: ${esc(nota.duracion || nota.duracionTexto || nota.tiempoEstimado)}</span>` : '';
  const metrics = distance || duration ? `
    <div class="metrics">${[distance, duration].filter(Boolean).join('<span class="metric-dot"> · </span>')}</div>` : '';
  const observations = nota.observaciones ? `
    <tr><td colspan="2" class="section-cell observations">
      <div class="field-label">OBSERVACIONES</div>
      <div class="field-value">${esc(nota.observaciones)}</div>
    </td></tr>` : '';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, .email-bg { background:#f2f5f9 !important; color:#182235 !important; }
  .shell { background:#ffffff !important; }
  .booking-card { background:#ffffff !important; border-color:#d8dee8 !important; }
  .heading-main { color:#111827 !important; }
  .field-value { color:#202938 !important; }
  .field-subvalue, .metrics { color:#687386 !important; }
  .field-label { color:#9a762b !important; }
  .section-cell, .detail-cell, .booking-head { border-color:#e1e6ee !important; }
  .total-box { background:#e9f8f0 !important; border-color:#16a36a !important; }
  .total-value { color:#07884f !important; }
  .help-panel { background:#f7f8fb !important; border-color:#d8dee8 !important; }
  .logo-img { mix-blend-mode:multiply; }
  @media (prefers-color-scheme: dark) {
    body, .email-bg { background:#080d18 !important; color:#f4f6fa !important; }
    .shell { background:#080d18 !important; }
    .booking-card { background:#0c1322 !important; border-color:#354052 !important; }
    .heading-main { color:#ffffff !important; }
    .field-value { color:#f4f6fa !important; }
    .field-subvalue, .metrics { color:#b9c1d0 !important; }
    .field-label { color:#d7b56d !important; }
    .section-cell, .detail-cell, .booking-head { border-color:#273247 !important; }
    .total-box { background:#06291f !important; border-color:#176b47 !important; }
    .total-value { color:#36dc8a !important; }
    .help-panel { background:#101b2d !important; border-color:#354052 !important; }
    .logo-img { filter:invert(1); mix-blend-mode:screen; }
  }
  @media only screen and (max-width:600px) {
    .outer-pad { padding:18px 8px !important; }
    .detail-cell { display:block !important; width:auto !important; padding:12px 18px !important; border-top:1px solid #e1e6ee !important; }
    .customer-contact-cell { display:block !important; width:auto !important; }
    .heading-main { font-size:23px !important; }
    .total-value { font-size:28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f2f5f9;color:#182235">
<div class="email-bg" style="background:#f2f5f9;padding:0;margin:0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f2f5f9">
    <tr><td align="center" class="outer-pad" style="padding:28px 14px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="shell" style="max-width:680px;border-collapse:collapse;background:#fff">
        <tr><td align="center" style="padding:16px 12px 24px">
          <img class="logo-img" src="${logo}" alt="Transportes MX" width="190" style="display:block;width:190px;max-width:70%;height:auto;margin:0 auto 18px;mix-blend-mode:multiply">
          <div style="font-size:12px;letter-spacing:3px;color:#b18a3d;font-weight:700">TRANSPORTES MX</div>
          <div class="heading-main" style="font-size:28px;line-height:1.25;font-weight:800;margin-top:10px;color:#111827">🚗 NUEVA RESERVA <span style="color:#b18a3d">MANUAL</span></div>
          <div style="display:inline-block;margin-top:14px;padding:8px 18px;border-radius:22px;background:#e5f8ef;border:1px solid #0b9b61;color:#07884f;font-size:14px;font-weight:700">✓ RESERVA PAGADA</div>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="booking-card" style="border:1px solid #d8dee8;border-radius:16px;overflow:hidden;background:#fff;border-collapse:separate">
            <tr><td colspan="2" class="booking-head" style="padding:20px;border-bottom:1px solid #e1e6ee">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                <td width="36" valign="middle" style="font-size:25px;color:#b18a3d">✦</td>
                <td><div style="font-size:18px;font-weight:700;color:#111827">Nueva Reserva Pagada</div><div style="font-size:14px;color:#687386;margin-top:5px">Folio ${folio}</div></td>
              </tr></table>
            </td></tr>
            <tr><td colspan="2" class="section-cell" style="padding:18px 20px;border-bottom:1px solid #e1e6ee">
              <div class="field-label" style="font-size:11px;letter-spacing:1.5px;color:#9a762b;font-weight:700">CLIENTE</div>
              <div class="field-value" style="font-size:22px;font-weight:700;color:#202938;margin-top:7px">${customer}</div>
            </td></tr>
            <tr>
              <td width="50%" class="section-cell customer-contact-cell" style="padding:14px 20px;border-bottom:1px solid #e1e6ee;vertical-align:top">
                <div class="field-label" style="font-size:11px;letter-spacing:1.5px;color:#9a762b;font-weight:700">✉ EMAIL</div>
                <div class="field-value" style="font-size:15px;color:#202938;margin-top:6px;word-break:break-word">${email}</div>
              </td>
              <td width="50%" class="section-cell customer-contact-cell" style="padding:14px 20px;border-bottom:1px solid #e1e6ee;vertical-align:top">
                <div class="field-label" style="font-size:11px;letter-spacing:1.5px;color:#9a762b;font-weight:700">☎ TELÉFONO</div>
                <div class="field-value" style="font-size:15px;color:#202938;margin-top:6px;word-break:break-word">${phone}</div>
              </td>
            </tr>
            <tr><td colspan="2" class="section-cell" style="padding:16px 20px;border-bottom:1px solid #e1e6ee">
              <div class="field-label" style="font-size:11px;letter-spacing:1.5px;color:#9a762b;font-weight:700">📍 RUTA</div>
              <div class="field-value" style="font-size:16px;line-height:1.55;color:#202938;margin-top:7px;word-break:break-word">${route}</div>
            </td></tr>
            ${returnBlock}
            <tr>${detailsHtml}</tr>
            <tr><td colspan="2" style="padding:16px 20px">
              <div class="total-box" style="border:1px solid #16a36a;border-radius:12px;background:#e9f8f0;padding:16px 18px">
                <div class="field-label" style="font-size:11px;letter-spacing:1.5px;color:#9a762b;font-weight:700">${totalLabel}</div>
                <div class="total-value" style="font-size:32px;line-height:1.3;font-weight:800;color:#07884f;margin-top:5px">${amount}</div>
                ${amountIsText ? '' : '<div class="field-subvalue" style="font-size:12px;color:#687386;margin-top:3px">MXN</div>'}
              </div>
            </td></tr>
            ${observations}
          </table>
          ${metrics}
        </td></tr>
        <tr><td style="padding-top:18px">
          <div class="help-panel" style="padding:16px 20px;border:1px solid #d8dee8;border-radius:12px;background:#f7f8fb">
            <div style="font-size:15px;font-weight:700;color:#b18a3d">📅 Agrega tu traslado a tu calendario</div>
            <div class="field-value" style="font-size:13px;line-height:1.5;color:#202938;margin-top:7px">Adjuntamos un archivo de calendario (.ics) con la fecha, hora, origen, destino y folio del servicio. Abre el archivo para agregar la cita a Google Calendar, Apple Calendar u Outlook.</div>
          </div>
        </td></tr>
        <tr><td align="center" style="padding:24px 8px 18px;border-bottom:1px solid #b18a3d">
          <div class="field-value" style="font-size:14px;color:#202938">¿Necesitas ayuda?</div>
          <a href="mailto:contacto@transportesmx.org" style="display:inline-block;margin-top:7px;color:#b18a3d;text-decoration:none;font-weight:700">contacto@transportesmx.org</a><br>
          <a href="https://transportesmx.org" style="display:inline-block;margin-top:9px;color:#b18a3d;text-decoration:none">https://transportesmx.org</a>
        </td></tr>
        <tr><td align="center" style="padding-top:16px;font-size:11px;line-height:1.6;color:#7f8a9d">Grupo Turístico MX S. de R.L. de C.V.<br>Confirmación de Nota de Venta · Transportes MX</td></tr>
      </table>
    </td></tr>
  </table>
</div>
</body></html>`;
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
