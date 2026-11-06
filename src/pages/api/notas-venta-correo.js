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
  const logoWhite = `${SITE_URL}/logo-email-white.png`;
  const logoBlack = `${SITE_URL}/logo-email-black.png`;
  const customer = esc(nota.cliente || 'Cliente');
  const folio = esc(nota.folio || '—');
  const email = esc(nota.email || '—');
  const phone = esc(nota.telefono || '—');
  const origin = esc(nota.origen || 'Origen por confirmar');
  const destination = esc(nota.destino || 'Destino por confirmar');
  const route = `${origin} <span class="route-arrow">→</span> ${destination}`;

  // Si el campo importe contiene texto (p. ej. "Pagado"), mostrarlo literalmente.
  // Solo formatear como moneda cuando realmente sea un importe numérico.
  const rawAmount = String(nota.importe ?? '').trim();
  const cleanedAmount = rawAmount.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  const isNumericAmount = rawAmount !== '' && /^-?\d+(?:\.\d+)?$/.test(cleanedAmount);
  const totalValue = isNumericAmount
    ? money(cleanedAmount)
    : esc(rawAmount || 'Por confirmar');
  const totalLabel = isNumericAmount ? 'TOTAL' : 'ESTADO DE PAGO';

  const returnBlock = roundTrip ? `
    <tr>
      <td class="section-cell return-section" colspan="4">
        <div class="field-label">🔄 REGRESO</div>
        <div class="return-route">${destination} <span class="route-arrow">→</span> ${origin}</div>
        <div class="muted return-date">${dateDisplay(nota.regresoFecha || nota.fechaRegreso)} · ${esc(nota.regresoHora || nota.horaRegreso || 'Hora por confirmar')}</div>
      </td>
    </tr>` : '';

  const detailItems = [
    ['📅 FECHA Y HORA', `${dateDisplay(nota.fecha)} · ${esc(nota.hora || 'Por confirmar')}`],
    ['🧭 TIPO DE VIAJE', roundTrip ? 'Ida y vuelta' : esc(nota.tipoViaje || 'Sencillo')],
    ['🚘 VEHÍCULO', esc(nota.unidad || 'Por confirmar')],
    ['👥 PASAJEROS', esc(nota.pasajeros || 'Por confirmar')],
  ];
  const detailsHtml = detailItems.map(([label, value]) => `
    <td class="detail-cell" width="25%" valign="top">
      <div class="field-label">${label}</div>
      <div class="detail-value">${value}</div>
    </td>`).join('');

  const distanceValue = nota.distancia || nota.distanciaKm || nota.km || '';
  const distance = distanceValue ? `<span>📏 Distancia: ${esc(distanceValue)}${String(distanceValue).toLowerCase().includes('km') ? '' : ' km'}</span>` : '';
  const durationValue = nota.duracion || nota.duracionTexto || nota.tiempo || '';
  const duration = durationValue ? `<span>⏱️ ${esc(durationValue)}</span>` : '';
  const routeStats = distance || duration ? `
    <tr><td class="route-stats">
      ${distance}${distance && duration ? '<span class="stats-separator"> · </span>' : ''}${duration}
    </td></tr>` : '';

  const observations = nota.observaciones ? `
    <tr><td class="section-cell observations">
      <div class="field-label">📝 OBSERVACIONES</div>
      <div class="observations-value">${esc(nota.observaciones)}</div>
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
  body, .page-bg { background-color:#080b12 !important; }
  .email-shell { width:100%; max-width:720px; margin:0 auto; }
  .outer-card { background:#171923 !important; border:1px solid #2c303b !important; border-radius:22px; overflow:hidden; }
  .brand-header { background:#15304e !important; background-image:linear-gradient(135deg,#1c3a5d,#10253e) !important; }
  .header-subtitle { color:#a6b2c3 !important; }
  .main-content { background:#191a24 !important; }
  .title { color:#f8fafc !important; }
  .folio, .muted, .route-stats { color:#9296a2 !important; }
  .info-card { background:#22232d !important; border:1px solid #343640 !important; }
  .divider, .section-cell, .detail-cell { border-color:#343640 !important; }
  .field-value, .detail-value, .route-text, .return-route, .observations-value { color:#e2e4e9 !important; }
  .field-label { color:#d7b56d !important; }
  .total-card { background:#06291f !important; border:1px solid #176b47 !important; }
  .total-value { color:#16c78b !important; }
  .footer { background:#11121a !important; color:#777d8b !important; }
  .route-arrow { color:#d7b56d !important; font-weight:bold; }
  .brand-logo-light { display:block !important; }
  .brand-logo-dark { display:none !important; }
  .section-cell { padding:18px 22px; border-top:1px solid #343640; }
  .field-label { font-size:11px; line-height:1.4; letter-spacing:1.5px; font-weight:700; }
  .field-value { font-size:20px; line-height:1.4; font-weight:700; margin-top:6px; }
  .detail-cell { padding:16px 12px; border-top:1px solid #343640; }
  .detail-value { font-size:15px; line-height:1.45; margin-top:7px; overflow-wrap:anywhere; }
  .route-text { font-size:17px; line-height:1.55; margin-top:8px; overflow-wrap:anywhere; }
  .return-route { font-size:16px; line-height:1.5; margin-top:7px; overflow-wrap:anywhere; }
  .return-date { font-size:14px; margin-top:6px; }
  .route-stats { padding:18px 22px; font-size:14px; line-height:1.5; font-weight:600; }
  .total-card { border-radius:14px; padding:18px 20px; }
  .total-value { font-size:34px; line-height:1.25; font-weight:800; margin-top:6px; overflow-wrap:anywhere; }
  .observations-value { font-size:14px; line-height:1.55; margin-top:7px; white-space:pre-line; }
  @media only screen and (max-width:600px) {
    .page-pad { padding:12px 8px !important; }
    .outer-card { border-radius:16px !important; }
    .brand-logo { width:170px !important; max-width:65% !important; }
    .headline { font-size:23px !important; line-height:1.25 !important; }
    .section-cell { padding:15px 16px !important; }
    .detail-cell { display:block !important; width:auto !important; padding:13px 16px !important; }
    .detail-value { font-size:15px !important; }
    .field-value { font-size:18px !important; }
    .total-value { font-size:29px !important; }
    .route-stats { padding:15px 16px !important; }
  }
  @media (prefers-color-scheme: dark) {
    body, .page-bg { background-color:#f1f4f8 !important; }
    .outer-card { background:#ffffff !important; border-color:#dce2eb !important; }
    .brand-header { background:#dce9f8 !important; background-image:linear-gradient(135deg,#c7d9f2,#e8f0fb) !important; }
    .header-subtitle { color:#52647b !important; }
    .main-content { background:#ffffff !important; }
    .title, .card-title { color:#101827 !important; }
    .paid-badge { background:#e6f8ef !important; border-color:#9bd8bb !important; color:#079b69 !important; }
    .manual-accent { color:#b58b37 !important; }
    .folio, .muted, .route-stats { color:#7a8494 !important; }
    .info-card { background:#f8fafc !important; border-color:#dce2eb !important; }
    .divider, .section-cell, .detail-cell { border-color:#e2e7ef !important; }
    .field-value, .detail-value, .route-text, .return-route, .observations-value { color:#263244 !important; }
    .field-label { color:#b58b37 !important; }
    .total-card { background:#e8f8f0 !important; border-color:#9bd8bb !important; }
    .total-value { color:#079b69 !important; }
    .footer { background:#f8fafc !important; color:#8993a2 !important; }
    .route-arrow { color:#b58b37 !important; }
    .brand-logo-light { display:none !important; }
    .brand-logo-dark { display:block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f1f4f8;color:#263244">
<div class="page-bg" style="width:100%;background:#f1f4f8;padding:22px 0">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
<tr><td align="center" class="page-pad" style="padding:18px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" class="email-shell" style="width:100%;max-width:720px">
<tr><td class="outer-card" style="background:#fff;border:1px solid #dce2eb;border-radius:22px;overflow:hidden">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
<tr><td class="brand-header" align="center" style="background:#dce9f8;background-image:linear-gradient(135deg,#c7d9f2,#e8f0fb);padding:34px 20px 28px">
<img class="brand-logo brand-logo-light" src="${logoWhite}" alt="TMX · Transportes MX" width="190" style="display:block;width:190px;max-width:70%;height:auto;margin:0 auto 15px;border:0;background:transparent">
<img class="brand-logo brand-logo-dark" src="${logoBlack}" alt="TMX · Transportes MX" width="190" style="display:none;width:190px;max-width:70%;height:auto;margin:0 auto 15px;border:0;background:transparent">
<div class="header-subtitle" style="font-size:17px;font-weight:700;color:#52647b">Panel de reservas</div>
</td></tr>
<tr><td class="main-content" style="background:#fff;padding:28px 22px 0">
<div class="headline title" style="font-size:30px;line-height:1.25;font-weight:800;color:#101827">🚗 NUEVA RESERVA <span class="manual-accent" style="color:#b58b37">MANUAL</span></div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px"><tr><td class="paid-badge" style="background:#e6f8ef;border:1px solid #9bd8bb;border-radius:30px;padding:8px 16px;color:#079b69;font-size:14px;font-weight:800">✓ RESERVA PAGADA</td></tr></table>
</td></tr>
<tr><td class="main-content" style="background:#fff;padding:22px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" class="info-card" style="background:#f8fafc;border:1px solid #dce2eb;border-radius:16px;overflow:hidden">
<tr><td class="section-cell card-heading" style="padding:20px 22px;border-top:0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" style="font-size:24px;color:#b58b37;padding-right:14px">✦</td><td valign="middle"><div class="card-title" style="font-size:18px;font-weight:800;color:#263244">Nueva Reserva Pagada</div><div class="folio" style="font-size:14px;color:#7a8494;margin-top:5px">Folio ${folio}</div></td></tr></table>
</td></tr>
<tr><td class="section-cell" style="padding:20px 22px;border-top:0">
<div class="field-label">CLIENTE</div><div class="field-value" style="font-size:20px;font-weight:800;color:#263244;margin-top:6px">${customer}</div>
</td></tr>
<tr><td class="section-cell divider" style="padding:18px 22px;border-top:1px solid #e2e7ef">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="58%" valign="top" style="padding:0 12px 0 0"><div class="field-label">📧 EMAIL</div><div class="detail-value" style="font-size:15px;line-height:1.5;margin-top:6px;overflow-wrap:anywhere"><a href="mailto:${email}" class="field-value-link" style="color:#2879d8;text-decoration:underline">${email}</a></div></td>
<td width="42%" valign="top" style="padding:0"><div class="field-label">📞 TELÉFONO</div><div class="detail-value" style="font-size:15px;line-height:1.5;margin-top:6px;overflow-wrap:anywhere">${phone}</div></td>
</tr></table>
</td></tr>
<tr><td class="section-cell divider" style="padding:18px 22px;border-top:1px solid #e2e7ef">
<div class="field-label">📍 RUTA</div><div class="route-text" style="font-size:17px;line-height:1.55;color:#263244;margin-top:8px">${route}</div>
</td></tr>
${returnBlock}
<tr>${detailsHtml}</tr>
<tr><td class="section-cell" style="padding:18px 22px;border-top:1px solid #e2e7ef">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tr><td class="total-card" style="background:#e8f8f0;border:1px solid #9bd8bb;border-radius:14px;padding:18px 20px">
<div class="field-label">${totalLabel}</div><div class="total-value" style="font-size:34px;line-height:1.25;font-weight:800;color:#079b69;margin-top:6px">${totalValue}</div>
${isNumericAmount ? '<div class="muted" style="font-size:12px;color:#7b8798;margin-top:3px">MXN</div>' : ''}
</td></tr></table>
</td></tr>
${observations}
</table>
</td></tr>
${routeStats}
<tr><td class="footer" align="center" style="padding:18px 12px;background:#f8fafc;color:#8993a2;font-size:14px;font-weight:600">TransportesMX · Panel de administración</td></tr>
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
