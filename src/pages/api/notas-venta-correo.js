// Next.js Pages Router API: src/pages/api/notas-venta-correo.js
// Envia una copia independiente a cada destinatario para no exponer direcciones
// entre ellos. La copia administrativa siempre se intenta enviar primero.
const ADMIN_EMAIL = "contacto@transportesmx.org";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
  },
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function text(value, fallback = "—") {
  const clean = String(value ?? "").trim();
  return clean ? escapeHtml(clean) : fallback;
}

function fechaHora(nota) {
  const fecha = [nota.fecha, nota.hora].filter(Boolean).join(" · ");
  return fecha || "—";
}

function darkEmailHtml(nota) {
  const viaje = nota.tipoViaje === "redondo" || nota.idaVuelta === "redondo"
    ? "Ida y vuelta"
    : nota.tipoViaje === "sencillo" || nota.idaVuelta === "sencillo"
      ? "Sencillo"
      : "—";

  const fields = [
    ["Cliente", text(nota.cliente)],
    ["Teléfono", text(nota.telefono)],
    ["Correo del cliente", text(nota.email)],
    ["Fecha y hora", text(fechaHora(nota))],
    ["Tipo de viaje", viaje],
    ["Vehículo", text(nota.unidad)],
    ["Pasajeros", text(nota.pasajeros)],
    ["Maletas", text(nota.maletas)],
    ["Origen", text(nota.origen)],
    ["Destino", text(nota.destino)],
    ["Aerolínea", text(nota.aerolinea)],
    ["Duración", text(nota.duracion)],
    ["Regreso", text([nota.regresoFecha, nota.regresoHora].filter(Boolean).join(" · "))],
    ["Total / estado de pago", text(nota.importe)],
  ];

  const rows = fields.map(([label, value]) => `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid #303744;color:#c4a15a;font:600 13px Arial,sans-serif;width:34%;vertical-align:top;">${label}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #303744;color:#f4f6fa;font:14px/1.5 Arial,sans-serif;overflow-wrap:anywhere;word-break:break-word;">${value}</td>
    </tr>`).join("");

  const observaciones = String(nota.observaciones ?? "").trim();

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Nueva reserva ${escapeHtml(nota.folio || "")}</title>
<style>
  :root { color-scheme: dark only; supported-color-schemes: dark; }
  html,body { margin:0!important;padding:0!important;background:#090d14!important;color:#f4f6fa!important; }
  body,table,td,p,a { font-family:Arial,Helvetica,sans-serif; }
  a { color:#d6b66d!important; }
  @media only screen and (max-width:600px) {
    .email-wrap { width:100%!important; }
    .email-pad { padding:18px 14px!important; }
    .email-title { font-size:22px!important; }
    .detail-cell { display:block!important;width:auto!important; }
  }
</style>
</head>
<body bgcolor="#090d14" style="margin:0;padding:0;background-color:#090d14;color:#f4f6fa;color-scheme:dark;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#090d14" style="width:100%;background:#090d14;">
    <tr><td align="center" style="padding:26px 10px;">
      <table role="presentation" class="email-wrap" width="640" cellspacing="0" cellpadding="0" border="0" bgcolor="#111827" style="width:100%;max-width:640px;background:#111827;border:1px solid #303744;border-radius:16px;overflow:hidden;">
        <tr>
          <td class="email-pad" bgcolor="#080c13" style="padding:26px 30px;background:#080c13;border-bottom:1px solid #b9944b;">
            <div style="font:700 12px/1.4 Arial,sans-serif;letter-spacing:3px;color:#d6b66d;">TRANSPORTES MX</div>
            <div class="email-title" style="margin-top:10px;font:700 28px/1.2 Arial,sans-serif;color:#ffffff;">Nueva reserva</div>
            <div style="margin-top:7px;font:14px Arial,sans-serif;color:#aeb8c7;">Folio ${escapeHtml(nota.folio || "Pendiente")}</div>
          </td>
        </tr>
        <tr><td class="email-pad" style="padding:24px 30px 8px;">
          <div style="font:700 12px Arial,sans-serif;letter-spacing:1.5px;color:#d6b66d;">RESUMEN DEL SERVICIO</div>
          <div style="margin-top:8px;font:700 21px/1.3 Arial,sans-serif;color:#ffffff;overflow-wrap:anywhere;">${text(nota.cliente, "Nueva reserva")}</div>
        </td></tr>
        <tr><td class="email-pad" style="padding:12px 20px 22px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;background:#182131;border:1px solid #303744;border-radius:10px;">
            ${rows}
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;width:100%;background:#202b3a;border:1px solid #b9944b;border-radius:10px;">
            <tr><td style="padding:16px 18px;">
              <div style="font:600 12px Arial,sans-serif;letter-spacing:1px;color:#c4a15a;">OBSERVACIONES</div>
              <div style="margin-top:8px;font:14px/1.6 Arial,sans-serif;color:#f4f6fa;white-space:pre-wrap;overflow-wrap:anywhere;">${observaciones ? escapeHtml(observaciones) : "Sin observaciones"}</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td bgcolor="#080c13" style="padding:20px 24px;background:#080c13;border-top:1px solid #303744;text-align:center;">
          <div style="font:700 12px Arial,sans-serif;letter-spacing:1px;color:#d6b66d;">GRUPO TURÍSTICO MX S. DE R.L. DE C.V.</div>
          <div style="margin-top:8px;font:12px/1.6 Arial,sans-serif;color:#aeb8c7;">San Miguel de Allende, Guanajuato</div>
          <div style="font:12px/1.6 Arial,sans-serif;"><a href="mailto:contacto@transportesmx.org" style="color:#d6b66d;text-decoration:underline;">contacto@transportesmx.org</a> · <a href="https://transportesmx.org" style="color:#d6b66d;text-decoration:underline;">transportesmx.org</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function uniqueRecipients(nota) {
  const candidates = [
    { email: ADMIN_EMAIL, role: "administrador", required: true },
    { email: String(nota.email || "").trim(), role: "cliente", required: false },
    { email: String(nota.email2 || "").trim(), role: "correo_adicional", required: false },
  ];
  const seen = new Set();
  const recipients = [];
  const skipped = [];

  for (const item of candidates) {
    if (!item.email) continue;
    const normalized = item.email.toLowerCase();
    if (!EMAIL_RE.test(item.email)) {
      skipped.push({ role: item.role, reason: "correo_invalido" });
      continue;
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    recipients.push(item);
  }
  return { recipients, skipped };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Método no permitido." });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || ADMIN_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Transportes MX";

  if (!apiKey) {
    return res.status(500).json({ success: false, error: "Falta configurar BREVO_API_KEY." });
  }
  if (!EMAIL_RE.test(senderEmail)) {
    return res.status(500).json({ success: false, error: "BREVO_SENDER_EMAIL no es válido." });
  }

  const nota = req.body?.nota;
  if (!nota || typeof nota !== "object" || !String(nota.folio || "").trim()) {
    return res.status(400).json({ success: false, error: "Faltan los datos de la nota o el folio." });
  }

  const { recipients, skipped } = uniqueRecipients(nota);
  const adminIncluded = recipients.some((item) => item.email.toLowerCase() === ADMIN_EMAIL);
  if (!adminIncluded) {
    return res.status(500).json({ success: false, error: "No se pudo preparar el destinatario administrativo obligatorio." });
  }

  const attachments = [];
  const pdf = String(req.body?.pdfNotaBase64 || "").trim();
  if (pdf) {
    // Limitar tamaño y validar que el contenido tenga forma de base64.
    if (pdf.length > 11_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdf)) {
      return res.status(400).json({ success: false, error: "El PDF adjunto no es válido o excede el tamaño permitido." });
    }
    attachments.push({
      name: `Nota-de-Venta-${String(nota.folio).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`,
      content: pdf,
    });
  }

  const htmlContent = darkEmailHtml(nota);
  const results = [];

  // Un envío separado por destinatario: no se muestran las direcciones entre sí.
  for (const recipient of recipients) {
    try {
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: recipient.email }],
          subject: `Transportes MX | Nueva reserva ${nota.folio}`,
          htmlContent,
          ...(attachments.length ? { attachment: attachments } : {}),
        }),
      });

      const responseBody = await brevoResponse.json().catch(() => ({}));
      results.push({
        role: recipient.role,
        email: recipient.email,
        success: brevoResponse.ok,
        messageId: responseBody.messageId || null,
        error: brevoResponse.ok ? null : (responseBody.message || responseBody.code || "Brevo rechazó el envío."),
      });
    } catch (error) {
      results.push({
        role: recipient.role,
        email: recipient.email,
        success: false,
        error: error?.message || "Error de conexión con Brevo.",
      });
    }
  }

  const adminResult = results.find((item) => item.role === "administrador");
  const allSucceeded = results.every((item) => item.success);
  const adminSucceeded = Boolean(adminResult?.success);

  return res.status(allSucceeded ? 200 : 502).json({
    success: allSucceeded && adminSucceeded,
    adminSent: adminSucceeded,
    results,
    skipped,
    message: allSucceeded
      ? "Correo enviado a todos los destinatarios válidos."
      : "Uno o más destinatarios no recibieron el correo. Revisa results.",
  });
}
