import { autenticarBanner } from "../../../lib/banner-auth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Método no permitido.",
    });
  }

  try {
    const email = String(req.body?.email || "");
    const password = String(req.body?.password || "");

    const session = await autenticarBanner(email, password);

    if (!session) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos.",
      });
    }

    const secure =
      process.env.NODE_ENV === "production" ? "; Secure" : "";

    res.setHeader(
      "Set-Cookie",
      `tmx_banner_session=${encodeURIComponent(
        session.token
      )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.min(
        session.expiresIn,
        3600
      )}${secure}`
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error de acceso al banner:", error.message);

    return res.status(503).json({
      error: "No se pudo verificar el acceso. Revisa la configuración de Supabase.",
    });
  }
}
