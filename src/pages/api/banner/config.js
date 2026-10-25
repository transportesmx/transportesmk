import crypto from "crypto";
function validSession(req) {
  const secret=process.env.BANNER_SESSION_SECRET;
  const raw=String(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("tmx_banner_session="));
  if (!secret || !raw) return false;
  const token=raw.slice("tmx_banner_session=".length).split(";");
  const parts=token[0].split(".");
  if(parts.length!==2) return false;
  const [payload,sig]=parts, expected=crypto.createHmac("sha256",secret).update(payload).digest("base64url");
  const a=Buffer.from(sig), b=Buffer.from(expected);
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)) return false;
  try { const data=JSON.parse(Buffer.from(payload,"base64url").toString()); return data.exp>Date.now() && data.email===String(process.env.BANNER_ADMIN_EMAIL||"").trim().toLowerCase(); } catch (_) { return false; }
}
async function kv(command, key, value) {
  const base=process.env.KV_REST_API_URL, token=process.env.KV_REST_API_TOKEN;
  if(!base || !token) return null;
  const args=value===undefined?[command,key]:[command,key,value];
  const response=await fetch(`${base.replace(/\/$/,"")}/${args.map(x=>encodeURIComponent(x)).join("/")}`, {headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok) throw new Error("No se pudo consultar el almacenamiento KV.");
  return response.json();
}
export default async function handler(req,res) {
  res.setHeader("Cache-Control","no-store");
  try {
    if(req.method==="GET") {
      const result=await kv("GET","tmx-banner-config");
      const config=result?.result ? JSON.parse(result.result) : null;
      return res.status(200).json({config});
    }
    if(req.method==="PUT") {
      if(!validSession(req)) return res.status(401).json({error:"Inicia sesión para guardar."});
      const config=req.body?.config;
      if(!config || typeof config!=="object" || typeof config.name!=="string" || !["dark","light"].includes(config.theme)) return res.status(400).json({error:"Configuración no válida."});
      const clean={
        name: config.name.slice(0,60),
        theme: config.theme,
        fontSize: Math.max(20,Math.min(100,Number(config.fontSize)||52)),
        vehicleScale: Math.max(60,Math.min(140,Number(config.vehicleScale)||100)),
        speed: Math.max(5,Math.min(20,Number(config.speed)||12)),
        fontFamily: ["Arial, Helvetica, sans-serif","Helvetica, Arial, sans-serif","Georgia, serif","'Trebuchet MS', sans-serif","Verdana, sans-serif"].includes(config.fontFamily) ? config.fontFamily : "Arial, Helvetica, sans-serif"
      };
      const saved=await kv("SET","tmx-banner-config",JSON.stringify(clean));
      if(saved===null) return res.status(503).json({error:"KV no está configurado."});
      return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:"Método no permitido."});
  } catch(e) { return res.status(500).json({error:"Error al guardar configuración."}); }
}
