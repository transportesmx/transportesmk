/**
 * Envío de emails transaccionales con Resend
 * Envía confirmación con PDF adjunto al cliente y al dueño.
 * Soporta español (es) e inglés (en).
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'TransportesMX <reservas@transportesmx.org>';
const OWNER_EMAIL = 'contacto@transportesmx.org';
const LOGO_URL = 'https://transportesmx.org/assets/logo.png';

const emailLabels = {
  es: {
    tagline: 'Tu traslado de confianza',
    confirmed: '¡Reserva Confirmada!',
    reservaNum: 'Reserva',
    origin: 'Origen',
    destination: 'Destino',
    dateTime: 'Fecha y hora',
    vehicle: 'Vehículo',
    passengers: 'Pasajeros',
    tripType: 'Tipo',
    roundTrip: 'Ida y vuelta',
    oneWay: 'Sencillo',
    returnLabel: 'Regreso',
    totalPaid: 'Total pagado',
    pdfNote: '📎 Se adjunta tu hoja de servicio en PDF.',
    contactNote: 'Cualquier duda contáctanos por WhatsApp:',
    footerCompany: 'TransportesMX · Grupo Turístico MX',
    footerLocation: 'San Miguel de Allende, GTO',
    subjectConfirm: '✅ Reserva confirmada',
    subjectOwner: '🚗 Nueva reserva',
    ownerTitle: '🚗 Nueva Reserva Pagada',
    ownerPanel: 'Panel de reservas',
    ownerClient: 'Cliente',
    ownerEmail: 'Email',
    ownerPhone: 'Teléfono',
    ownerRoute: 'Ruta',
    ownerDate: 'Fecha',
    ownerVehicle: 'Vehículo',
    ownerPax: 'PAX',
    ownerTotal: 'Total',
    ownerDistance: 'Distancia',
    ownerFooter: 'TransportesMX · Panel de administración',
  },
  en: {
    tagline: 'Your trusted transfer service',
    confirmed: 'Booking Confirmed!',
    reservaNum: 'Booking',
    origin: 'Pickup',
    destination: 'Destination',
    dateTime: 'Date & time',
    vehicle: 'Vehicle',
    passengers: 'Passengers',
    tripType: 'Type',
    roundTrip: 'Round trip',
    oneWay: 'One way',
    returnLabel: 'Return',
    totalPaid: 'Total paid',
    pdfNote: '📎 Your service sheet is attached as a PDF.',
    contactNote: 'Any questions? Contact us via WhatsApp:',
    footerCompany: 'TransportesMX · Grupo Turístico MX',
    footerLocation: 'San Miguel de Allende, GTO',
    subjectConfirm: '✅ Booking confirmed',
    subjectOwner: '🚗 New booking',
    ownerTitle: '🚗 New Paid Booking',
    ownerPanel: 'Bookings panel',
    ownerClient: 'Client',
    ownerEmail: 'Email',
    ownerPhone: 'Phone',
    ownerRoute: 'Route',
    ownerDate: 'Date',
    ownerVehicle: 'Vehicle',
    ownerPax: 'PAX',
    ownerTotal: 'Total',
    ownerDistance: 'Distance',
    ownerFooter: 'TransportesMX · Admin panel',
  },
};

/**
 * HTML del email de confirmación al cliente
 */
function htmlConfirmacion(reserva, lang = 'es') {
  const t = emailLabels[lang] || emailLabels.es;
  const precioFormateado = `$${Number(reserva.precioTotal).toLocaleString('es-MX')} MXN`;
  const esRedondo = reserva.tipoViaje === 'redondo' && reserva.fechaRegreso;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.confirmed} - TransportesMX</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f15;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f15;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1a1a24;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

        <!-- Header con logo -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a1628 0%,#162240 50%,#0a1628 100%);padding:36px 32px;text-align:center;">
            <img src="${LOGO_URL}" alt="TransportesMX" width="160" height="auto" style="display:inline-block;max-width:160px;height:auto;margin-bottom:8px;" />
            <p style="margin:0;color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:0.5px;">${t.tagline}</p>
          </td>
        </tr>

        <!-- Badge de confirmación -->
        <tr>
          <td style="padding:32px 32px 8px;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:28px;color:#fff;">✓</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 32px 4px;text-align:center;">
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${t.confirmed}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 32px 24px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.45);font-size:14px;">${t.reservaNum} #${(reserva.id || 'N/A').toString().slice(0, 8)}</p>
          </td>
        </tr>

        <!-- Card de ruta -->
        <tr>
          <td style="padding:0 24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px 20px 12px;">
                  <table width="100%"><tr>
                    <td width="24" valign="top" style="padding-top:2px;">
                      <div style="width:10px;height:10px;border-radius:50%;background:#3b82f6;"></div>
                    </td>
                    <td>
                      <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">${t.origin}</p>
                      <p style="margin:0;font-size:15px;color:#ffffff;font-weight:500;">${reserva.origen}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px;">
                  <table width="100%"><tr>
                    <td width="24" valign="top" style="padding-left:4px;">
                      <div style="width:2px;height:20px;background:rgba(59,130,246,0.3);margin-left:3px;"></div>
                    </td>
                    <td></td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px 20px;">
                  <table width="100%"><tr>
                    <td width="24" valign="top" style="padding-top:2px;">
                      <div style="width:10px;height:10px;border-radius:50%;background:#10b981;"></div>
                    </td>
                    <td>
                      <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">${t.destination}</p>
                      <p style="margin:0;font-size:15px;color:#ffffff;font-weight:500;">${reserva.destino}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Detalles del servicio -->
        <tr>
          <td style="padding:0 24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
              <tr>
                <td width="50%" style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0 0 3px;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">📅 ${t.dateTime}</p>
                  <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">${reserva.fechaIda} · ${reserva.horaIda}</p>
                </td>
                <td width="50%" style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);border-left:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0 0 3px;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">🚘 ${t.vehicle}</p>
                  <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">${reserva.vehiculoNombre}</p>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding:16px 20px;">
                  <p style="margin:0 0 3px;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">👥 ${t.passengers}</p>
                  <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">${reserva.numPasajeros} PAX</p>
                </td>
                <td width="50%" style="padding:16px 20px;border-left:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0 0 3px;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">🛣️ ${t.tripType}</p>
                  <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">${reserva.tipoViaje === 'redondo' ? t.roundTrip : t.oneWay}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${esRedondo ? `
        <!-- Regreso -->
        <tr>
          <td style="padding:0 24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:12px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 3px;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">🔄 ${t.returnLabel}</p>
                  <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">${reserva.fechaRegreso} · ${reserva.horaRegreso}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- Total -->
        <tr>
          <td style="padding:0 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.15));border:1px solid rgba(16,185,129,0.2);border-radius:12px;">
              <tr>
                <td style="padding:20px;">
                  <table width="100%"><tr>
                    <td>
                      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;">${t.totalPaid}</p>
                    </td>
                    <td style="text-align:right;">
                      <p style="margin:0;font-size:24px;font-weight:700;color:#10b981;">${precioFormateado}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Nota PDF -->
        <tr>
          <td style="padding:0 24px 20px;text-align:center;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;">
              ${t.pdfNote}<br>
              ${t.contactNote}
              <a href="https://wa.me/524151393219" style="color:#3b82f6;text-decoration:none;font-weight:500;">+52 415 139 3219</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:rgba(0,0,0,0.3);padding:20px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);">${t.footerCompany}</p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">
              <a href="https://transportesmx.org" style="color:rgba(255,255,255,0.35);text-decoration:none;">transportesmx.org</a>
              &nbsp;·&nbsp;${t.footerLocation}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * HTML para el email al dueño — siempre en español
 */
function htmlNotificacionDueno(reserva) {
  const t = emailLabels.es;
  const precioFormateado = `$${Number(reserva.precioTotal).toLocaleString('es-MX')} MXN`;
  const esRedondo = reserva.tipoViaje === 'redondo' && reserva.fechaRegreso;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f0f15;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f15;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1a1a24;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#0d2137 100%);padding:28px 24px;text-align:center;">
            <img src="${LOGO_URL}" alt="TransportesMX" width="140" height="auto" style="display:inline-block;max-width:140px;height:auto;margin-bottom:4px;" />
            <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">${t.ownerPanel}</p>
          </td>
        </tr>

        <!-- Título -->
        <tr>
          <td style="padding:28px 24px 8px;">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${t.ownerTitle}</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">${t.reservaNum} #${(reserva.id || 'N/A').toString().slice(0, 8)}</p>
          </td>
        </tr>

        <!-- Datos -->
        <tr>
          <td style="padding:16px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;">${t.ownerClient}</p>
                  <p style="margin:0;font-size:15px;color:#fff;font-weight:600;">${reserva.clienteNombre}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <table width="100%"><tr>
                    <td width="50%">
                      <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;">📧 ${t.ownerEmail}</p>
                      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${reserva.clienteEmail}</p>
                    </td>
                    <td width="50%">
                      <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;">📞 ${t.ownerPhone}</p>
                      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${reserva.clienteTelefono}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;">📍 ${t.ownerRoute}</p>
                  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${reserva.origen} → ${reserva.destino}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <table width="100%"><tr>
                    <td width="33%">
                      <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;">📅 ${t.ownerDate}</p>
                      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${reserva.fechaIda} · ${reserva.horaIda}</p>
                    </td>
                    <td width="33%">
                      <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;">🚘 ${t.ownerVehicle}</p>
                      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${reserva.vehiculoNombre}</p>
                    </td>
                    <td width="33%">
                      <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;">👥 ${t.ownerPax}</p>
                      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${reserva.numPasajeros}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
              ${esRedondo ? `
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;">🔄 Regreso</p>
                  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${reserva.fechaRegreso} · ${reserva.horaRegreso}</p>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%"><tr>
                    <td><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;">💰 ${t.ownerTotal}</p></td>
                    <td style="text-align:right;"><p style="margin:0;font-size:22px;font-weight:700;color:#10b981;">${precioFormateado}</p></td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${reserva.distancia ? `
        <tr>
          <td style="padding:0 24px 16px;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">📏 ${t.ownerDistance}: ${reserva.distancia} ${reserva.duracion ? `· ⏱️ ${reserva.duracion}` : ''}</p>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="background-color:rgba(0,0,0,0.3);padding:16px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">${t.ownerFooter}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Envía confirmación al cliente + notificación al dueño, ambos con PDF adjunto
 * @param {Object} reserva - datos de la reserva
 * @param {Buffer} pdfBuffer - buffer del PDF
 * @param {string} lang - 'es' o 'en'
 */
export async function enviarEmailConfirmacion(reserva, pdfBuffer, lang = 'es') {
  if (!resend) {
    console.log('[Email] Resend no configurado — omitiendo envío');
    return null;
  }

  const t = emailLabels[lang] || emailLabels.es;

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: `TransportesMX-${lang === 'en' ? 'Booking' : 'Reserva'}-${reserva.id || 'servicio'}.pdf`,
      content: pdfBuffer,
    });
  }

  try {
    // 1. Email al CLIENTE — en el idioma del cliente
    const clienteResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [reserva.clienteEmail],
      subject: `${t.subjectConfirm} #${reserva.id?.slice(0, 8) || 'TransportesMX'}`,
      html: htmlConfirmacion(reserva, lang),
      attachments,
    });
    console.log(`[Email] ✅ Confirmación enviada al cliente [${lang}]:`, clienteResult.data?.id);

    // 2. Email al DUEÑO — siempre en español
    const duenioResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [OWNER_EMAIL],
      subject: `🚗 Nueva reserva: ${reserva.clienteNombre} — $${Number(reserva.precioTotal).toLocaleString('es-MX')}`,
      html: htmlNotificacionDueno(reserva),
      attachments,
    });
    console.log('[Email] ✅ Notificación enviada al dueño:', duenioResult.data?.id);

    return { clienteId: clienteResult.data?.id, duenioId: duenioResult.data?.id };
  } catch (error) {
    console.error('[Email] ❌ Error:', error.message);
    return null;
  }
}
