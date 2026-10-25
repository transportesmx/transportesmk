
import crypto from "crypto";

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");

  if (aa.length !== bb.length) return false;

  return crypto.timingSafeEqual(aa, bb);
}

export function validarCredenciales(email, password) {
  const correoAdmin = process.env.BANNER_ADMIN_EMAIL;
  const passwordAdmin = process.env.BANNER_ADMIN_PASSWORD;

  if (!correoAdmin || !passwordAdmin) {
    return false;
  }

  const correoIngresado = String(email || "")
    .trim()
    .toLowerCase();

  const correoConfigurado = correoAdmin
    .trim()
    .toLowerCase();

  const correoValido = safeEqual(
    correoIngresado,
    correoConfigurado
  );

  const passwordValido = safeEqual(
    String(password || ""),
    passwordAdmin
  );

  return correoValido && passwordValido;
}

export function firmarSesion(payload) {
  const secret = process.env.BANNER_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("La clave de sesión debe tener al menos 32 caracteres.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}
