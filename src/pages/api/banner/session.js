import crypto from "crypto";
function isValid(token, secret) {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) return false;
  try { const data = JSON.parse(Buffer.from(payload,"base64url").toString()); return data.exp > Date.now() && data.email === String(process.env.BANNER_ADMIN_EMAIL || "").trim().toLowerCase(); } catch (_) { return false; }
}
export default function handler(req,res) {
  res.setHeader("Cache-Control","no-store");
  if (req.method !== "GET") return res.status(405).json({error:"Método no permitido."});
  const cookies = Object.fromEntries(String(req.headers.cookie || "").split(";").map(x => x.trim()).filter(Boolean).map(x => { const i=x.indexOf("="); return [x.slice(0,i),x.slice(i+1)]; }));
  return res.status(200).json({ authenticated: isValid(cookies.tmx_banner_session, process.env.BANNER_SESSION_SECRET) });
}
