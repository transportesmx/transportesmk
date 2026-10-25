import { validarSesionBanner } from "../../../lib/banner-auth";

async function kv(command, key, value) {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!base || !token) return null;

  const args =
    value === undefined
      ? [command, key]
      : [command, key, value];

  const response = await fetch(
    `${base.replace(/\/$/, "")}/${args
      .map((item) => encodeURIComponent(item))
      .join("/")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo consultar el almacenamiento KV.");
  }

  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const result = await kv("GET", "tmx-banner-config");

      let config = null;

      if (result?.result) {
        try {
          config = JSON.parse(result.result);
        } catch {
          config = null;
        }
      }

      return res.status(200).json({ config });
    }

    if (req.method === "PUT") {
      const authenticated = await validarSesionBanner(req);

      if (!authenticated) {
        return res.status(401).json({
          error: "La sesión venció. Inicia sesión nuevamente.",
        });
      }

      const config = req.body?.config;

      if (
        !config ||
        typeof config !== "object" ||
        typeof config.name !== "string" ||
        !["dark", "light"].includes(config.theme)
      ) {
        return res.status(400).json({
          error: "Configuración no válida.",
        });
      }

      const clean = {
        name: config.name.slice(0, 60),
        theme: config.theme,
        fontSize: Math.max(
          20,
          Math.min(100, Number(config.fontSize) || 52)
        ),
        vehicleScale: Math.max(
          60,
          Math.min(140, Number(config.vehicleScale) || 100)
        ),
        speed: Math.max(
          5,
          Math.min(20, Number(config.speed) || 12)
        ),
        fontFamily: [
          "Arial, Helvetica, sans-serif",
          "Helvetica, Arial, sans-serif",
          "Georgia, serif",
          "'Trebuchet MS', sans-serif",
          "Verdana, sans-serif",
        ].includes(config.fontFamily)
          ? config.fontFamily
          : "Arial, Helvetica, sans-serif",
      };

      const saved = await kv(
        "SET",
        "tmx-banner-config",
        JSON.stringify(clean)
      );

      if (saved === null) {
        return res.status(503).json({
          error:
            "KV no está configurado. No se pudo sincronizar el guardado.",
        });
      }

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PUT");

    return res.status(405).json({
      error: "Método no permitido.",
    });
  } catch (error) {
    console.error("Error en la configuración del banner:", error.message);

    return res.status(500).json({
      error: "Error al procesar la configuración del banner.",
    });
  }
}
