import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN1 = "amstrekgrt@gmail.com";
const ADMIN2 = "and-i89@hotmail.com";
const initial = {
  cliente: "", telefono: "", correo: "", vehiculo: "", nombreCliente: "",
  fecha: "", hora: "", recoger: "", aerolinea: "", pasajeros: "",
  maletas: "", telefonoServicio: "", destino: "", idaVuelta: "",
  duracion: "", regresoFecha: "", regresoHora: "", observaciones: ""
};

const fields = [
  ["cliente", "Cliente", "text"], ["telefono", "Teléfono", "tel"],
  ["correo", "Correo", "email"], ["vehiculo", "🚗 Vehículo", "text"],
  ["nombreCliente", "👤 Nombre del cliente", "text"], ["fecha", "📆 Fecha", "date"],
  ["hora", "🕒 Hora", "time"], ["recoger", "📍 Recoger en", "text"],
  ["aerolinea", "✈️ Aerolínea", "text"], ["pasajeros", "👥 Número de pasajeros", "number"],
  ["maletas", "🧳 Número de maletas", "number"], ["telefonoServicio", "📞 Número de teléfono", "tel"],
  ["destino", "📍 Destino", "text"], ["idaVuelta", "🔄 Ida y vuelta", "text"],
  ["duracion", "⏰ Duración", "text"]
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Mexico_City" }).format(d);
}
function currentStamp() {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    hour12: true, timeZone: "America/Mexico_City"
  }).format(new Date());
}

export default function HojaServicio() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(initial);
  const [stamp, setStamp] = useState("");
  const [message, setMessage] = useState("");

  const authorized = [ADMIN1, ADMIN2].includes(session?.user?.email?.toLowerCase());
  useEffect(() => {
    if (!supabase) { setLoading(false); setMessage("No está configurada la conexión con Supabase."); return; }
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data?.session || null); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const regreso = useMemo(() => {
    const date = formatDate(data.regresoFecha);
    const time = data.regresoHora ? new Date(`2000-01-01T${data.regresoHora}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";
    if (!date && !time) return "";
    return `↩️ Regreso: ${date}${date && time ? " / " : ""}${time}`;
  }, [data.regresoFecha, data.regresoHora]);

  async function login(e) {
    e.preventDefault(); setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setMessage("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
    else { setSession(data.session); setPassword(""); }
  }
  async function logout() { await supabase.auth.signOut(); setSession(null); }

  function update(key, value) { setData(old => ({ ...old, [key]: value })); }
  function printSheet() {
    setStamp(currentStamp());
    // Delay lets the footer stamp render before opening print.
    setTimeout(() => window.print(), 100);
  }

  if (loading) return <main className="min-h-screen bg-black p-8 text-white">Cargando...</main>;
  if (!session) return <main className="min-h-screen bg-black p-5 text-white"><form onSubmit={login} className="mx-auto mt-12 max-w-md rounded-xl border border-gray-700 bg-gray-950 p-6"><h1 className="text-2xl font-bold text-yellow-400">Transportes MX</h1><p className="my-2">Hoja de Servicio</p><label className="block py-2">Correo<input className="mt-1 w-full rounded border border-gray-600 bg-black p-3" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="block py-2">Contraseña<input className="mt-1 w-full rounded border border-gray-600 bg-black p-3" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="mt-3 w-full rounded bg-yellow-500 p-3 font-bold text-black">Entrar</button>{message&&<p className="mt-3 text-red-300">{message}</p>}</form></main>;
  if (!authorized) return <main className="min-h-screen bg-black p-8 text-white"><h1 className="text-2xl">Acceso no autorizado</h1><button onClick={logout} className="mt-4 rounded border p-2">Cerrar sesión</button></main>;

  return <main className="min-h-screen bg-black p-4 text-white sm:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 no-print"><div><h1 className="text-2xl font-bold text-yellow-400">Hoja de Servicio oficial</h1><p className="text-sm text-gray-300">La vista previa se actualiza al capturar los datos.</p></div><div className="flex gap-2"><button onClick={printSheet} className="rounded bg-yellow-500 px-4 py-2 font-bold text-black">Imprimir / Guardar PDF</button><button onClick={logout} className="rounded border border-gray-600 px-3 py-2">Cerrar sesión</button></div></div>
      {message && <p className="no-print mb-3 rounded bg-gray-900 p-3">{message}</p>}
      <div className="grid items-start gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <section className="no-print rounded-xl border border-gray-700 bg-gray-950 p-4">
          <h2 className="mb-3 text-lg font-semibold">Datos editables</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {fields.map(([key,label,type]) => <label key={key} className="block text-sm">{label}<input type={type} min={type==="number"?"0":undefined} value={data[key]} onChange={e=>update(key,e.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-black p-2.5 text-white"/></label>)}
          </div>
          <div className="mt-4 border-t border-gray-700 pt-4"><h3 className="mb-2 font-semibold">Regreso</h3><div className="grid grid-cols-2 gap-3"><label className="text-sm">📅 Fecha<input type="date" value={data.regresoFecha} onChange={e=>update("regresoFecha",e.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-black p-2 text-white"/></label><label className="text-sm">🕒 Hora<input type="time" value={data.regresoHora} onChange={e=>update("regresoHora",e.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-black p-2 text-white"/></label></div></div>
          <label className="mt-4 block text-sm">Observaciones<textarea rows={3} value={data.observaciones} onChange={e=>update("observaciones",e.target.value)} className="mt-1 w-full rounded border border-gray-600 bg-black p-3 text-white"/></label>
          <button onClick={()=>{setData(initial);setStamp("");setMessage("Formulario limpio.");}} className="mt-3 rounded border border-gray-600 px-4 py-2">Limpiar formulario</button>
        </section>

        <section className="preview-wrap overflow-x-auto rounded-xl bg-gray-200 p-2 sm:p-4">
          <article className="service-sheet mx-auto bg-white text-black">
            <header className="company">
              <img src="/hoja-servicio/logo.jpg" alt="Logotipo TMX" className="logo"/>
              <div className="company-data"><strong>Grupo Turistico MX S. de R.L de C. V</strong><span>RFC: GTM2604271F2</span><span>San Miguel de Allende Guanajuato</span><span>contacto@transportesmx.org</span><span>Sitio web: https://transportesmx.org</span></div>
            </header>
            <div className="sprinter-band"><img src="/hoja-servicio/sprinter.png" alt="Mercedes-Benz Sprinter negra"/></div>
            <div className="client-lines">
              <p><b>Cliente:</b> {data.cliente}</p><p><b>Teléfono:</b> {data.telefono}</p><p><b>Correo:</b> {data.correo}</p>
            </div>
            <div className="fields-preview">
              <p>🚗 Vehículo: <span>{data.vehiculo}</span></p>
              <p>👤 Nombre del cliente: <span>{data.nombreCliente}</span></p>
              <p>📆 Fecha y hora: <span>{formatDate(data.fecha)}{data.hora ? ` / ${new Date(`2000-01-01T${data.hora}`).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})}` : ""}</span></p>
              <p>📍 Recoger en: <span>{data.recoger}</span></p>
              <p>✈️ Aerolínea: <span>{data.aerolinea || "N/A"}</span></p>
              <p>👥 Número de pasajeros: <span>{data.pasajeros}</span></p>
              <p>🧳 Número de maletas: <span>{data.maletas}</span></p>
              <p>📞 Número de teléfono: <span>{data.telefonoServicio}</span></p>
              <p>📍 Destino: <span>{data.destino}</span></p>
              <p>🔄 Ida y vuelta: <span>{data.idaVuelta}</span></p>
              <p>⏰ Duración: <span>{data.duracion}</span></p>
            </div>
            <div className="regreso">{regreso || "↩️ Regreso:"}</div>
            <div className="observaciones"><span>Observaciones:</span><p>{data.observaciones}</p></div>
            <footer className="sheet-footer"><div className="footer-rule"/><p>San Miguel de Allende, Guanajuato / Documento generado: {stamp || currentStamp()}</p><p>Grupo Turístico MX S. de R.L. de C.V.</p></footer>
          </article>
        </section>
      </div>
    </div>
    <style jsx global>{`
      .service-sheet{width:210mm;min-height:297mm;box-sizing:border-box;padding:10mm 13mm 8mm;display:flex;flex-direction:column;font-family:Arial,sans-serif;font-size:10pt;box-shadow:0 2px 12px #0002}
      .company{display:flex;align-items:center;gap:8mm;min-height:26mm;border-bottom:2px solid #111;padding-bottom:3mm}
      .logo{width:48mm;max-height:24mm;object-fit:contain}.company-data{display:flex;flex-direction:column;gap:1mm;font-size:8pt;color:#4c4c4c}.company-data strong{font-size:9pt;color:#222}
      .sprinter-band{height:43mm;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #bbb;overflow:hidden}.sprinter-band img{max-width:100%;max-height:41mm;object-fit:contain}
      .client-lines{display:grid;grid-template-columns:1fr 1fr;column-gap:8mm;margin-top:4mm;font-size:9pt}.client-lines p{margin:0 0 2mm}.client-lines p:first-child{grid-column:1/-1}
      .fields-preview{margin-top:3mm;display:grid;grid-template-columns:1fr 1fr;column-gap:9mm;row-gap:2mm;font-size:9pt}.fields-preview p{margin:0;min-height:5mm;overflow-wrap:anywhere}.fields-preview span{font-weight:400}
      .regreso{margin-top:14mm;font-weight:bold;font-size:10pt;min-height:6mm}.observaciones{margin-top:auto;min-height:20mm;border:1.3px solid #333;border-radius:999px;padding:4mm 7mm;overflow-wrap:anywhere;font-size:9pt}.observaciones span{font-weight:bold}.observaciones p{margin:1mm 0 0;white-space:pre-wrap}
      .sheet-footer{margin-top:5mm;text-align:center;color:#777;font-size:7pt;line-height:1.4}.footer-rule{height:1.2mm;background:#111;margin-bottom:3mm}.sheet-footer p{margin:0}
      @media(max-width:850px){.service-sheet{width:210mm;min-height:297mm}.preview-wrap{overflow-x:auto}}
      @page{size:Letter;margin:0}
      @media print{
        html,body{background:#fff!important;margin:0!important;padding:0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        body *{visibility:hidden}
        .preview-wrap,.preview-wrap *{visibility:visible}
        .preview-wrap{position:absolute;left:0;top:0;width:100%;padding:0!important;margin:0!important;background:#fff!important;overflow:visible!important}
        .service-sheet{width:215.9mm!important;height:279.4mm!important;min-height:0!important;padding:7mm 10mm 5mm!important;box-shadow:none!important;overflow:hidden}
        .company{min-height:22mm}.logo{max-height:20mm}.sprinter-band{height:35mm}.sprinter-band img{max-height:33mm}
        .client-lines{margin-top:3mm}.fields-preview{margin-top:2mm;row-gap:1.3mm}.regreso{margin-top:10mm}.observaciones{min-height:17mm}
        .sheet-footer{margin-top:4mm}
        .no-print{display:none!important}
      }
    `}</style>
  </main>;
}
