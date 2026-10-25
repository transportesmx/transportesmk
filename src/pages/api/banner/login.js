
import {
  validarCredenciales,
  firmarSesion
} from "../../../lib/banner-auth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Método no permitido."
    });
  }

  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  const password = String(req.body?.password || "");

  if (!validarCredenciales(email, password)) {
    return res.status(401).json({
      error: "Correo o contraseña incorrectos, o configuración incompleta."
    });
  }

  try {
    const payload = Buffer.from(
      JSON.stringify({
        email,
        exp: Date.now() + 8 * 60 * 60 * 1000
      })
    ).toString("base64url");

    const signature = firmarSesion(payload);
    const token = `${payload}.${signature}`;

    res.setHeader(
      "Set-Cookie",
      `tmx_banner_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`
    );

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(503).json({
      error: "No se pudo generar la sesión. Revisa la configuración del servidor."
    });
  }
}
