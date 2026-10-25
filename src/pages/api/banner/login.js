import crypto from "crypto";

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const { BANNER_ADMIN_EMAIL, BANNER_ADMIN_PASSWORD, BANNER_SESSION_SECRET } = process.env;
  if (!BANNER_ADMIN_EMAIL || !BANNER_ADMIN_PASSWORD || !BANNER_SESSION_SECRET || BANNER_SESSION_SECRET.length < 32) {
    return res.status(503).json({ error: "Faltan variables de entorno de autenticación en Vercel." });
  }
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!safeEqual(email, BANNER_ADMIN_EMAIL.trim().toLowerCase()) || !safeEqual(password, BANNER_ADMIN_PASSWORD)) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const token = `${payload}.${sign(payload, BANNER_SESSION_SECRET)}`;
  res.setHeader("Set-Cookie", `tmx_banner_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
  return res.status(200).json({ ok: true });
}
