export default function handler(req,res) {
  res.setHeader("Cache-Control","no-store");
  if (req.method !== "POST") return res.status(405).json({error:"Método no permitido."});
  res.setHeader("Set-Cookie","tmx_banner_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return res.status(200).json({ok:true});
}
