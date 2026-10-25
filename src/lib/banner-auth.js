
import crypto from "crypto";

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");

  if (aa.length !== bb.length) {
    return false;
  }

  return crypto.timingSafeEqual(aa, bb);
}

function sign(payload, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Método no permitido."
    });
  }

  const {
    BANNER_ADMIN_EMAIL,
    BANNER_ADMIN_PASSWORD,
    BANNER_SESSION_SECRET
  } = process.env;

  if (
    !BANNER_ADMIN_EMAIL ||
    !BANNER_ADMIN_PASSWORD ||
    !BANNER_SESSION_SECRET ||
    BANNER_SESSION_SECRET.length < 32
  ) {
    return res.status(503).json({
      error: "La autenticación del banner no está configurada correctamente."
    });
  }

  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  const password = String(req.body?.password || "");

  const validEmail = safeEqual(
    email,
    BANNER_ADMIN_EMAIL.trim().toLowerCase()
  );

  const validPassword = safeEqual(
    password,
    BANNER_ADMIN_PASSWORD
  );

  if (!validEmail || !validPassword) {
    return res.status(401).json({
      error: "Correo o contraseña incorrectos."
    });
  }

  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + 8 * 60 * 60 * 1000
    })
  ).toString("base64url");

  const signature = sign(payload, BANNER_SESSION_SECRET);
  const token = `${payload}.${signature}`;

  res.setHeader(
    "Set-Cookie",
    `tmx_banner_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`
  );

  return res.status(200).json({
    ok: true
  });
}
