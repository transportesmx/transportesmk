import { validarSesionBanner } from "../../../lib/banner-auth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Método no permitido.",
    });
  }

  try {
    const authenticated = await validarSesionBanner(req);

    return res.status(200).json({ authenticated });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
}
