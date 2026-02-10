/**
 * Envío de emails transaccionales con Resend
 * Envía confirmación con PDF adjunto al cliente y al dueño.
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'TransportesMX <reservas@transportesmx.org>';
const OWNER_EMAIL = 'sitiotransportesmx@gmail.com';

/**
 * Genera el HTML del email de confirmación
 */
function htmlConfirmacion(reserva) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <tr>
          <td style="background:#0a0a1a;padding:32px 24px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">TransportesMX</h1>
            <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">Confirmación de Reserva</p>
          </td>
        </tr>

        <!-- Checkmark -->
        <tr>
          <td style="padding:32px 24px 16px;text-align:center;">
            <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:#ecfdf5;text-align:center;line-height:48px;font-size:24px;">✓</div>
            <h2 style="margin:16px 0 4px;font-size:22px;color:#111;">¡Reserva confirmada!</h2>
            <p style="margin:0;color:#6b7280;font-size:14px;">Reserva #${reserva.id || 'N/A'}</p>
          </td>
        </tr>

        <!-- Detalles -->
        <tr>
          <td style="padding:0 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Ruta</p>
                  <p style="margin:0;font-size:14px;color:#374151;">${reserva.origen}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">→</p>
                  <p style="margin:0;font-size:14px;color:#374151;">${reserva.destino}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 16px;">
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
                </td>
              </tr>
              <tr>
                <td style="padding:16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="vertical-align:top;">
                        <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Fecha</p>
                        <p style="margin:0;font-size:14px;color:#374151;">${reserva.fechaIda} · ${reserva.horaIda}</p>
                      </td>
                      <td width="50%" style="vertical-align:top;">
                        <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Vehículo</p>
                        <p style="margin:0;font-size:14px;color:#374151;">${reserva.vehiculoNombre}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${reserva.tipoViaje === 'redondo' && reserva.fechaRegreso ? `
              <tr>
                <td style="padding:0 16px;">
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
                </td>
              </tr>
              <tr>
                <td style="padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Regreso</p>
                  <p style="margin:0;font-size:14px;color:#374151;">${reserva.fechaRegreso} · ${reserva.horaRegreso}</p>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:0 16px;">
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
                </td>
              </tr>
              <tr>
                <td style="padding:16px;">
                  <table width="100%"><tr>
                    <td><p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Total pagado</p></td>
                    <td style="text-align:right;"><p style="margin:0;font-size:20px;font-weight:700;color:#111;">$${Number(reserva.precioTotal).toLocaleString('es-MX')} MXN</p></td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 24px 24px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Se adjunta tu hoja de servicio en PDF.<br>
              Cualquier duda contáctanos por WhatsApp: <a href="https://wa.me/524151393219" style="color:#3b82f6;text-decoration:none;">+52 415 139 3219</a>
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">TransportesMX · transportesmx.org</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * HTML para el email al dueño (más info de operación)
 */
function htmlNotificacionDueno(reserva) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:monospace;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:8px;padding:24px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 16px;color:#111;">🚗 Nueva Reserva Pagada</h2>
    <table style="width:100%;font-size:14px;color:#374151;line-height:1.8;">
      <tr><td><strong>Reserva:</strong></td><td>#${reserva.id || 'N/A'}</td></tr>
      <tr><td><strong>Cliente:</strong></td><td>${reserva.clienteNombre}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${reserva.clienteEmail}</td></tr>
      <tr><td><strong>Teléfono:</strong></td><td>${reserva.clienteTelefono}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e7eb;"></td></tr>
      <tr><td><strong>Origen:</strong></td><td>${reserva.origen}</td></tr>
      <tr><td><strong>Destino:</strong></td><td>${reserva.destino}</td></tr>
      <tr><td><strong>Fecha ida:</strong></td><td>${reserva.fechaIda} · ${reserva.horaIda}</td></tr>
      <tr><td><strong>Tipo:</strong></td><td>${reserva.tipoViaje === 'redondo' ? 'Ida y vuelta' : 'Sencillo'}</td></tr>
      ${reserva.tipoViaje === 'redondo' && reserva.fechaRegreso ? `<tr><td><strong>Regreso:</strong></td><td>${reserva.fechaRegreso} · ${reserva.horaRegreso}</td></tr>` : ''}
      <tr><td><strong>Vehículo:</strong></td><td>${reserva.vehiculoNombre}</td></tr>
      <tr><td><strong>Pasajeros:</strong></td><td>${reserva.numPasajeros}</td></tr>
      <tr><td><strong>Distancia:</strong></td><td>${reserva.distancia || 'N/A'}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e7eb;"></td></tr>
      <tr><td><strong>💰 Total:</strong></td><td style="font-size:18px;font-weight:bold;color:#059669;">$${Number(reserva.precioTotal).toLocaleString('es-MX')} MXN</td></tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Envía confirmación al cliente + notificación al dueño, ambos con PDF adjunto
 */
export async function enviarEmailConfirmacion(reserva, pdfBuffer) {
  if (!resend) {
    console.log('[Email] Resend no configurado — omitiendo envío');
    return null;
  }

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: `TransportesMX-Reserva-${reserva.id || 'servicio'}.pdf`,
      content: pdfBuffer, // Buffer o base64
    });
  }

  try {
    // 1. Email al CLIENTE
    const clienteResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [reserva.clienteEmail],
      subject: `✅ Reserva confirmada #${reserva.id?.slice(0, 8) || 'TransportesMX'}`,
      html: htmlConfirmacion(reserva),
      attachments,
    });
    console.log('[Email] ✅ Confirmación enviada al cliente:', clienteResult.data?.id);

    // 2. Email al DUEÑO
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
