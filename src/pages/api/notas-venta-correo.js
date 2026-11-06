/**
 * API de correo de Nota de Venta Transportes MX (Brevo).
 * Envia correo al cliente y copia a contacto@transportesmx.org, ambos con el PDF.
 * Control idempotente por destinatario: permite reintentar solo el correo que falló.
 */
const ADMIN_EMAIL = "contacto@transportesmx.org";
export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://transportesmx.org").replace(/\/$/, "");
const SENT_TTL_SECONDS = 60 * 60 * 24 * 30;
const LOCK_TTL_SECONDS = 60 * 5;

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function money(value) {
  const num = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(num)
    ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num)
    : esc(value || "Por confirmar");
}
function dateDisplay(value) {
  if (!value) return "Por confirmar";
  const parts = String(value).split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : esc(value);
}
function buildHtml(nota, recipientRole = "Cliente") {
  const roundTrip = nota.tipoViaje === "redondo" || nota.idaVuelta === "redondo";
  const logo = `${SITE_URL}/logo.jpg`;
  const customer = esc(nota.cliente || "Cliente");
  const folio = esc(nota.folio || "—");
  const route = `${esc(nota.origen || "Origen por confirmar")} → ${esc(nota.destino || "Destino por confirmar")}`;
  const regreso = roundTrip ? `
    <tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #273247">
      <div style="font-size:11px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">REGRESO</div>
      <div style="font-size:15px;color:#f4f6fa;margin-top:6px">${esc(nota.destino || "Destino")} → ${esc(nota.origen || "Origen")}</div>
      <div style="font-size:14px;color:#b9c1d0;margin-top:5px">${dateDisplay(nota.regresoFecha || nota.fechaRegreso)} · ${esc(nota.regresoHora || nota.horaRegreso || "Hora por confirmar")}</div>
    </td></tr>` : "";
  const details = [
    ["FECHA Y HORA", `${dateDisplay(nota.fecha)} · ${esc(nota.hora || "Por confirmar")}`],
    ["TIPO DE VIAJE", roundTrip ? "Ida y vuelta" : "Sencillo"],
    ["VEHÍCULO", esc(nota.unidad || "Por confirmar")],
    ["PASAJEROS", esc(nota.pasajeros || "Por confirmar")],
  ].map(([label, value]) =>
    `<td style="width:50%;padding:14px 16px;border-top:1px solid #273247;vertical-align:top"><div style="font-size:10px;letter-spacing:1.4px;color:#d7b56d;font-weight:700">${label}</div><div style="font-size:14px;color:#f4f6fa;margin-top:7px">${value}</div></td>`
  ).join("");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#080d18;font-family:Arial,Helvetica,sans-serif;color:#f4f6fa">
  <div style="max-width:680px;margin:0 auto;padding:28px 14px 24px">
    <div style="text-align:center;padding:10px 0 24px">
      <img src="${logo}" alt="Transportes MX" width="210" style="display:block;width:210px;max-width:70%;height:auto;margin:0 auto 22px">
      <div style="font-size:12px;letter-spacing:3px;color:#d7b56d;font-weight:700">TRANSPORTES MX</div>
      <div style="font-size:28px;line-height:1.25;font-weight:800;margin-top:10px;color:#fff">NUEVA RESERVA <span style="color:#d7b56d">MANUAL</span></div>
      <div style="display:inline-block;margin-top:14px;padding:8px 17px;border-radius:22px;background:#063c2b;border:1px solid #15804b;color:#45df91;font-weight:700;font-size:13px">✓ RESERVA PAGADA</div>
    </div>
    <div style="border:1px solid #354052;border-radius:16px;overflow:hidden;background:#0c1322">
      <div style="padding:20px;border-bottom:1px solid #273247">
        <div style="font-size:24px;color:#d7b56d">✦</div>
        <div style="font-size:17px;font-weight:700;color:#fff">Nueva Reserva Pagada — ${esc(recipientRole)}</div>
        <div style="font-size:13px;color:#aab4c5;margin-top:5px">Folio ${folio}</div>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
        <tr><td colspan="2" style="padding:18px 20px"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">CLIENTE</div><div style="font-size:18px;font-weight:700;color:#fff;margin-top:6px">${customer}</div></td></tr>
        <tr>
          <td style="width:50%;padding:14px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">EMAIL</div><div style="font-size:14px;color:#f4f6fa;margin-top:6px;word-break:break-word">${esc(nota.email || "—")}</div></td>
          <td style="width:50%;padding:14px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">TELÉFONO</div><div style="font-size:14px;color:#f4f6fa;margin-top:6px">${esc(nota.telefono || "—")}</div></td>
        </tr>
        <tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">RUTA</div><div style="font-size:15px;line-height:1.5;color:#f4f6fa;margin-top:7px">${route}</div></td></tr>
        ${regreso}
        <tr>${details}</tr>
        <tr><td colspan="2" style="padding:16px 20px"><div style="border:1px solid #176b47;border-radius:12px;background:#06291f;padding:16px 18px"><div style="font-size:11px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">TOTAL</div><div style="font-size:30px;line-height:1.3;font-weight:800;color:#36dc8a;margin-top:5px">${money(nota.importe)}</div><div style="font-size:12px;color:#a9c9b9;margin-top:3px">MXN</div></div></td></tr>
        ${nota.observaciones ? `<tr><td colspan="2" style="padding:14px 20px;border-top:1px solid #273247"><div style="font-size:10px;letter-spacing:1.5px;color:#d7b56d;font-weight:700">OBSERVACIONES</div><div style="font-size:14px;color:#e4e8ef;line-height:1.5;margin-top:6px">${esc(nota.observaciones)}</div></td></tr>` : ""}
      </table>
    </div>
    <div style="text-align:center;padding:24px 8px 18px;border-bottom:1px solid #d7b56d">
      <div style="font-size:14px;color:#e4e8ef">¿Necesitas ayuda?</div>
      <a href="mailto:contacto@transportesmx.org" style="display:inline-block;margin-top:7px;color:#d7b56d;text-decoration:none;font-weight:700">contacto@transportesmx.org</a><br>
      <a href="https://transportesmx.org" style="display:inline-block;margin-top:9px;color:#d7b56d;text-decoration:none">https://transportesmx.org</a>
    </div>
    <div style="text-align:center;padding-top:16px;font-size:11px;line-height:1.6;color:#7f8a9d">Grupo Turístico MX S. de R.L. de C.V.<br>Confirmación de Nota de Venta · Transportes MX</div>
  </div></body></html>`;
}

async function redisCommand(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis/Upstash no está configurado en las variables de Vercel.");
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || `Redis respondió HTTP ${response.status}`);
  return data.result;
}
async function acquireLock(lockKey, token) {
  return (await redisCommand(["SET", lockKey, token, "NX", "EX", String(LOCK_TTL_SECONDS)])) === "OK";
}
async function releaseLock(lockKey, token) {
  await redisCommand(["EVAL", "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end", "1", lockKey, token]);
}
async function isSent(sentKey) {
  return Boolean(await redisCommand(["GET", sentKey]));
}
async function markSent(sentKey, messageId) {
  return redisCommand(["SET", sentKey, JSON.stringify({ sent: true, messageId: messageId || null }), "EX", String(SENT_TTL_SECONDS)]);
}
async function sendBrevo({ email, subject, htmlContent, attachments }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { accept: "application/json", "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_SENDER_NAME || "Transportes MX", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject,
      htmlContent,
      attachment: attachments,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Brevo respondió HTTP ${response.status}`);
  return data.messageId || null;
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function sendOnce({ email, recipientLabel, sentKey, lockKey, subject, nota, attachments }) {
  if (await isSent(sentKey)) return { status: "already-sent", email, messageId: null };

  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const locked = await acquireLock(lockKey, token);
  if (!locked) return { status: "in-progress", email, messageId: null };

  try {
    // Re-check after obtaining the lock to avoid race conditions.
    if (await isSent(sentKey)) return { status: "already-sent", email, messageId: null };
    const messageId = await sendBrevo({
      email,
      subject,
      htmlContent: buildHtml(nota, recipientLabel),
      attachments,
    });
    await markSent(sentKey, messageId);
    return { status: "sent", email, messageId };
  } finally {
    await releaseLock(lockKey, token).catch((error) => console.error("[Redis liberar lock nota]", error));
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: "Método no permitido." });
  }

  const body = req.body || {};
  const nota = body.nota || body;
  const pdfRaw = body.pdfNotaBase64 || "";
  if (!nota?.folio || !nota?.cliente || !nota?.email) {
    return res.status(400).json({ success: false, message: "Folio, cliente y correo del cliente son obligatorios." });
  }
  if (!validEmail(nota.email)) {
    return res.status(400).json({ success: false, message: "El correo del cliente no tiene formato válido." });
  }
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    return res.status(500).json({ success: false, message: "Falta BREVO_API_KEY o BREVO_SENDER_EMAIL en Vercel." });
  }
  if (typeof pdfRaw !== "string" || !pdfRaw.trim()) {
    return res.status(400).json({ success: false, message: "No se recibió el PDF adjunto. No se envió ningún correo." });
  }

  const pdf = pdfRaw.replace(/^data:application\/pdf;base64,/i, "").replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(pdf) || pdf.length < 100) {
    return res.status(400).json({ success: false, message: "El PDF base64 recibido está vacío o no es válido." });
  }
  if (pdf.length > 7_500_000) {
    return res.status(413).json({ success: false, message: "El PDF es demasiado grande; comprime las imágenes de la nota." });
  }

  const folioSafe = String(nota.folio).replace(/[^a-zA-Z0-9_-]/g, "") || "sin-folio";
  const customerEmail = String(nota.email).trim().toLowerCase();
  const subject = `Nueva Reserva Manual | Reserva Pagada | Folio ${nota.folio}`;
  const attachments = [{ name: `Nota-de-Venta-${folioSafe}.pdf`, content: pdf }];
  const commonKey = `tmx:nota:${folioSafe}`;

  try {
    // Customer and admin recipients have independent durable sent markers and locks.
    // Thus retries can send the recipient that previously failed without duplicating the successful one.
    const customer = await sendOnce({
      email: customerEmail, recipientLabel: "Cliente",
      sentKey: `${commonKey}:customer:${customerEmail}`,
      lockKey: `${commonKey}:customer:${customerEmail}:lock`,
      subject, nota, attachments,
    });

    const admin = customerEmail === ADMIN_EMAIL
      ? { status: "same-as-customer", email: ADMIN_EMAIL, messageId: customer.messageId || null }
      : await sendOnce({
          email: ADMIN_EMAIL, recipientLabel: "Copia administrativa",
          sentKey: `${commonKey}:admin:${ADMIN_EMAIL}`,
          lockKey: `${commonKey}:admin:${ADMIN_EMAIL}:lock`,
          subject, nota, attachments,
        });

    const results = [customer, admin];
    const customerDone = ["sent", "already-sent"].includes(customer.status);
    const adminDone = ["sent", "already-sent", "same-as-customer"].includes(admin.status);
    const allDone = customerDone && adminDone;

    return res.status(allDone ? 200 : 202).json({
      success: allDone,
      message: allDone
        ? "Correo al cliente y copia a contacto@transportesmx.org completados; cada destinatario recibió el PDF adjunto."
        : "Un envío está en proceso; vuelve a intentar en unos minutos. El correo ya enviado no se duplicará.",
      sentTo: results.filter((item) => item.status === "sent").map((item) => item.email),
      statuses: results.map(({ email, status, messageId }) => ({ email, status, messageId })),
      pdfAttached: true,
    });
  } catch (error) {
    console.error("[Brevo Nota Venta API]", error);
    return res.status(502).json({
      success: false,
      message: "Falló el envío por Brevo o el control Redis. Revisa los logs de Vercel.",
      error: error.message,
    });
  }
}
