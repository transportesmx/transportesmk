
import crypto from "crypto";

function isValid(token, secret) {
  if (!token || !secret || secret.length < 32) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    const configuredEmail = String(
      process.env.BANNER_ADMIN_EMAIL || ""
    ).trim().toLowerCase();

    return (
      Boolean(configuredEmail) &&
      data.exp > Date.now() &&
      data.email === configuredEmail
    );
  } catch {
    return false;
  }
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Método no permitido."
    });
  }

  const cookies = Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");

        return [
          item.slice(0, index),
          item.slice(index + 1)
        ];
      })
  );

  const authenticated = isValid(
    cookies.tmx_banner_session,
    process.env.BANNER_SESSION_SECRET
  );

  return res.status(200).json({
    authenticated
  });
}
