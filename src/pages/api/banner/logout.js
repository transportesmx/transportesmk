export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Método no permitido.",
    });
  }

  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `tmx_banner_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );

  return res.status(200).json({ ok: true });
}
