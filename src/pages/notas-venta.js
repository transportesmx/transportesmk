import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN1 = "amstrekgrt@gmail.com";
const ADMIN2 = "and-i89@hotmail.com";
const ZONA = "America/Mexico_City";

const INICIAL = {
  cliente: "",
  telefono: "",
  email: "",
  servicio: "",
  fecha: "",
  hora: "",
  origen: "",
  destino: "",
  unidad: "",
  pasajeros: "",
  importe: "",
  observaciones: "",
  aerolinea: "",
  maletas: "",
  idaVuelta: "",
  duracion: "",
  regresoFecha: "",
  regresoHora: "",
};

const CAMPOS = [
  ["unidad", "🚐 Vehículo", "text"],
  ["cliente", "👤 Nombre del cliente", "text"],
  ["fecha", "📅 Fecha del servicio", "date"],
  ["hora", "🕒 Hora del servicio", "time"],
  ["origen", "📍 Recoger en", "text"],
  ["aerolinea", "✈️ Aerolínea", "text"],
  ["pasajeros", "👥 Número de pasajeros", "number"],
  ["maletas", "🧳 Número de maletas", "number"],
  ["telefono", "☎️ Número de teléfono", "tel"],
  ["destino", "📍 Destino", "text"],
  ["idaVuelta", "🔄 Ida y vuelta", "text"],
  ["duracion", "⏱️ Duración", "text"],
  ["regresoFecha", "↩️ Fecha de regreso", "date"],
  ["regresoHora", "🕒 Hora de regreso", "time"],
  ["email", "✉️ Correo electrónico", "email"],
];

function formatoFecha(valor) {
  if (!valor) return "";
  const fecha = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return valor;
  const texto = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "long", year: "numeric", timeZone: ZONA,
  }).format(fecha);
  return texto.replace(/\b([a-záéíóúñ])/i, (letra) => letra.toLocaleUpperCase("es-MX"));
}

function formatoHora(valor) {
  if (!valor) return "";
  const [hora, minuto] = valor.split(":").map(Number);
  if (!Number.isFinite(hora) || !Number.isFinite(minuto)) return valor;
  return `${hora % 12 || 12}:${String(minuto).padStart(2, "0")} ${hora >= 12 ? "P.M." : "A.M."}`;
}

function moneda(valor) {
  if (valor === "" || valor === null || valor === undefined) return "";
  const texto = String(valor).trim();
  if (!texto) return "";
  const numero = Number(texto);
  if (!Number.isFinite(numero)) return texto;
  return `$${numero.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

function fechaHoraActual() {
  const ahora = new Date();
  const partesFecha = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "long", year: "numeric", timeZone: ZONA,
  }).formatToParts(ahora);
  const dia = partesFecha.find((parte) => parte.type === "day")?.value || "";
  const mesCrudo = partesFecha.find((parte) => parte.type === "month")?.value || "";
  const mes = mesCrudo ? mesCrudo.charAt(0).toLocaleUpperCase("es-MX") + mesCrudo.slice(1) : "";
  const anio = partesFecha.find((parte) => parte.type === "year")?.value || "";
  const partesHora = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: ZONA,
  }).formatToParts(ahora);
  const hora = partesHora.find((parte) => parte.type === "hour")?.value || "";
  const minuto = partesHora.find((parte) => parte.type === "minute")?.value || "";
  const periodo = (partesHora.find((parte) => parte.type === "dayPeriod")?.value || "AM").toUpperCase();
  return {
    fecha: `${dia} de ${mes} de ${anio}`,
    hora: `${hora}:${minuto} ${periodo === "PM" ? "P.M." : "A.M."}`,
  };
}

function valorFechaHora(datos) {
  return [formatoFecha(datos.fecha), formatoHora(datos.hora)].filter(Boolean).join(" · ");
}

function valorRegreso(datos) {
  return [formatoFecha(datos.regresoFecha), formatoHora(datos.regresoHora)].filter(Boolean).join(" · ");
}

function htmlFila(etiqueta, valor, clase = "") {
  return `<div class="dato ${clase}"><span class="icono">${escapar(etiqueta.split(" ")[0])}</span><strong class="etiqueta">${escapar(etiqueta.replace(/^\S+\s*/, ""))}</strong><span class="valor">${escapar(valor || "")}</span></div>`;
}

function abrirImpresion(datos, folio) {
  const ventana = window.open("", "_blank", "width=1000,height=900");
  if (!ventana) return false;
  const generado = fechaHoraActual();
  const folioTexto = folio || "Pendiente de guardar";
  const origen = window.location.origin;
  const filas = [
    ["🚐 Vehículo:", datos.unidad],
    ["👤 Nombre del cliente:", datos.cliente],
    ["📅 Fecha y hora:", valorFechaHora(datos)],
    ["📍 Recoger en:", datos.origen],
    ["✈️ Aerolínea:", datos.aerolinea || "N/A"],
    ["👥 Número de pasajeros:", datos.pasajeros],
    ["🧳 Número de maletas:", datos.maletas],
    ["☎️ Número de teléfono:", datos.telefono],
    ["📍 Destino:", datos.destino],
    ["🔄 Ida y vuelta:", datos.idaVuelta],
    ["⏱️ Duración:", datos.duracion],
  ].map(([etiqueta, valor]) => htmlFila(etiqueta, valor)).join("");
  const regreso = [formatoFecha(datos.regresoFecha), formatoHora(datos.regresoHora)].filter(Boolean).join(" · ");
  const importeTexto = String(datos.importe ?? "").trim();
  const importeNumero = Number(importeTexto);
  const total = !importeTexto ? "" : Number.isFinite(importeNumero) ? `$${importeNumero.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MXN` : importeTexto;

  ventana.document.open();
  ventana.document.write(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title></title>
<style>
*{box-sizing:border-box}
@page{size:Letter portrait;margin:0}
html,body{margin:0;padding:0;background:#fff;color:#050505;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-size:11pt;line-height:1.25}
.hoja{width:100%;max-width:194mm;min-height:279.4mm;margin:0 auto;padding:10mm 12mm;display:flex;flex-direction:column}
.encabezado{display:grid;grid-template-columns:minmax(0,1fr) 48mm;gap:5mm;align-items:start}
.marca{display:block;min-width:0}
.logo{display:block;width:60mm;height:28.5mm;object-fit:contain;margin:0 0 1.5mm 0}
.empresa{font-size:9pt;line-height:1.42;font-weight:800;overflow-wrap:anywhere;padding-top:1mm}
.empresa strong{display:block;font-size:10pt;margin-bottom:1mm;font-weight:900}
.empresa .normal{font-weight:400}.empresa a{display:inline;color:#06c;text-decoration:underline;overflow-wrap:anywhere}.empresa a:visited{color:#06c}
.folioCol{display:flex;flex-direction:column;align-items:stretch;gap:2mm}
.folio{background:#f00000;color:#fff;font-size:12pt;font-weight:900;padding:3mm 3.5mm;min-height:11mm;overflow-wrap:anywhere}
.sprinter{width:100%;height:34mm;object-fit:contain;object-position:center}
.separador{display:block!important;width:100%;height:0!important;border:0;border-top:1.5mm solid #000!important;background:transparent!important;margin:3mm 0 3mm;flex:none;visibility:visible!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cliente{margin-top:1mm;display:grid;grid-template-columns:1fr;gap:0.7mm;padding:0 0 3mm}
.clienteItem{font-size:11pt;overflow-wrap:anywhere;min-height:5mm}
.clienteItem strong{font-weight:900}
.total{display:flex;align-items:center;gap:2mm;margin:1mm 0 4mm;background:#00b050;color:#fff;width:max-content;max-width:100%;min-height:9mm;padding:2mm 3mm;font-size:12pt;font-weight:900;overflow-wrap:anywhere}
.barra{background:#050505!important;color:#fff!important;padding:2mm 3mm;font-size:11pt;font-weight:900;margin:0 0 1.5mm;min-height:8mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.antesBarra{height:3mm;flex:none}.datos{display:flex;flex-direction:column;gap:0.7mm;margin-top:9mm}
.dato{display:flex;align-items:flex-start;gap:2mm;min-height:5.3mm;margin:0;padding:0;break-inside:avoid;page-break-inside:avoid;font-size:11pt;line-height:1.18;overflow-wrap:anywhere}
.icono{width:6mm;flex:none;font-size:11pt}
.etiqueta{font-weight:900;flex:none}
.valor{min-width:0;white-space:pre-wrap;overflow-wrap:anywhere}
.regreso{display:flex;align-items:flex-start;gap:2mm;margin-top:15mm;min-height:9mm;font-size:11pt;break-inside:avoid}
.observaciones{border:0.5mm solid #111;border-radius:8mm;min-height:19mm;margin-top:auto;margin-bottom:4mm;padding:3mm 5mm;font-size:10pt;line-height:1.35;overflow-wrap:anywhere;break-inside:avoid}
.observaciones strong{display:block;font-weight:900;margin-bottom:1.5mm}
.pie{border-top:1mm solid #111;margin-top:0;padding-top:3mm;text-align:center;font-size:8pt;line-height:1.4;color:#555;overflow-wrap:anywhere}
.pie a{color:#555;text-decoration:none}
.acciones{display:flex;justify-content:center;gap:3mm;margin:7mm 0 2mm}
button{font-size:11pt;padding:3mm 5mm;border:1px solid #777;border-radius:2mm;background:#f4f4f4;cursor:pointer}
@media print{.acciones{display:none!important}.hoja{width:100%;max-width:none;min-height:279.4mm;height:279.4mm;padding:10mm 12mm}.separador{display:block!important;height:0!important;border-top:1.5mm solid #000!important;background:transparent!important;visibility:visible!important;break-inside:avoid;page-break-inside:avoid}.barra{background:#000!important;color:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.dato,.regreso,.total,.observaciones{break-inside:avoid;page-break-inside:avoid}a{color:#06c;text-decoration:underline}}
</style></head><body><main class="hoja">
<header class="encabezado"><div class="marca"><img class="logo" src="${origen}/logo.jpg" alt="Transportes MX"><div class="empresa"><strong>Grupo Turístico MX S. de R.L. de C.V.</strong><span>RFC: GTM2604271F2</span><br><span>San Miguel de Allende Guanajuato</span><br><span>+52 415 139 3219</span><br><a class="normal contacto-link" href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a><br><a class="normal web-link" href="https://transportesmx.org">https://transportesmx.org</a></div></div><div class="folioCol"><div class="folio">F- ${escapar(folioTexto)}</div><img class="sprinter" src="${origen}/sprinter.png" alt="Vehículo Sprinter"></div></header>
<div class="separador"></div>
<section class="cliente"><div class="clienteItem"><strong>Cliente:</strong> ${escapar(datos.cliente || "")}</div><div class="clienteItem"><strong>Teléfono:</strong> ${escapar(datos.telefono || "")}</div><div class="clienteItem"><strong>Correo:</strong> ${escapar(datos.email || "")}</div></section>
<div class="total">Total: ${escapar(total)}</div>
<div class="antesBarra" aria-hidden="true"></div><div class="barra">Descripción del traslado:</div><section class="datos">${filas}</section>
<div class="regreso"><span class="icono">↩️</span><strong>Regreso:</strong><span class="valor">${escapar(regreso)}</span></div>
<div class="observaciones"><strong>Observaciones:</strong><span>${escapar(datos.observaciones || "")}</span></div>
<footer class="pie">San Miguel de Allende, Guanajuato · Documento Generado: ${escapar(generado.fecha)} · Hora: ${escapar(generado.hora)}<br>Grupo Turístico MX S. de R.L. de C.V.</footer>
<div class="acciones"><button onclick="window.print()">Imprimir / Guardar PDF</button><button onclick="window.close()">Cerrar</button></div>
</main></body></html>`);
  ventana.document.close();
  return true;
}

export default function NotasVenta() {
  const [sesion, setSesion] = useState(null);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [datos, setDatos] = useState({ ...INICIAL });
  const [folio, setFolio] = useState("");
  const [notas, setNotas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const emailUsuario = sesion?.user?.email?.toLowerCase();
  const admin1 = emailUsuario === ADMIN1;
  const autorizado = admin1 || emailUsuario === ADMIN2;

  useEffect(() => {
    if (!supabase) {
      setMensaje("No está configurada la conexión con Supabase.");
      setCargando(false);
      return undefined;
    }
    let activo = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!activo) return;
      if (error) setMensaje("No se pudo comprobar la sesión.");
      setSesion(data?.session ?? null);
      setCargando(false);
    }).catch(() => {
      if (activo) {
        setMensaje("No se pudo comprobar la sesión.");
        setCargando(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => setSesion(nuevaSesion));
    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sesion && autorizado) cargarNotas();
    // cargarNotas se invoca al cambiar la sesión/permiso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion, autorizado]);

  async function cargarNotas() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("notas_venta")
      .select("id, folio, datos, creado_en, actualizado_en")
      .order("creado_en", { ascending: false });
    if (error) {
      setMensaje("No se pudieron cargar las notas. Revisa los permisos de Supabase.");
      return;
    }
    setNotas(data || []);
  }

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setMensaje("");
    if (!supabase) {
      setMensaje("No está configurada la conexión con Supabase.");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: contrasena });
    if (error) {
      setMensaje("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
      return;
    }
    setSesion(data.session);
    setContrasena("");
  }

  async function cerrarSesion() {
    if (supabase) await supabase.auth.signOut();
    setSesion(null);
    setNotas([]);
    nuevaNota();
  }

  function cambiar(campo, valor) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function nuevaNota() {
    setDatos({ ...INICIAL });
    setFolio("");
    setEditando(null);
    setMensaje("");
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (!supabase || !autorizado || guardando) return;
    if (!datos.cliente.trim()) {
      setMensaje("Captura el nombre del cliente antes de guardar.");
      return;
    }
    setGuardando(true);
    setMensaje("");
    try {
      const payload = {
        ...datos,
        // Mantener vacío el importe si no se capturó; no guardarlo como cero.
        // El importe admite cantidades o texto como “Pagado”; mantenerlo como texto evita perder ese valor.
      };
      if (editando?.id) {
        const { error } = await supabase.rpc("editar_nota_venta", {
          p_id: editando.id,
          p_datos: payload,
        });
        if (error) throw error;
        setMensaje(`La nota ${editando.folio} se actualizó correctamente.`);
        setDatos(payload);
        setFolio(editando.folio);
        await cargarNotas();
      } else {
        const { data, error } = await supabase.rpc("crear_nota_venta", { p_datos: payload });
        if (error) throw error;
        const nueva = Array.isArray(data) ? data[0] : data;
        if (!nueva?.folio || !nueva?.nota_id) {
          setMensaje("Supabase no devolvió el folio o identificador. Revisa el historial antes de volver a guardar.");
          await cargarNotas();
          return;
        }
        setFolio(nueva.folio);
        setEditando({ id: nueva.nota_id, folio: nueva.folio });
        setDatos(payload);
        setMensaje(`Nota guardada con folio ${nueva.folio}. Puedes imprimirla o seguir editándola.`);
        await cargarNotas();
      }
    } catch (error) {
      setMensaje("No se pudo guardar la nota: " + (error?.message || "Error desconocido."));
    } finally {
      setGuardando(false);
    }
  }

  function editar(nota) {
    setEditando({ id: nota.id, folio: nota.folio });
    setDatos({ ...INICIAL, ...(nota.datos || {}) });
    setFolio(nota.folio);
    setMensaje(`Editando la nota ${nota.folio}.`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(nota) {
    if (!admin1) {
      setMensaje("Solo el Administrador 1 puede eliminar notas.");
      return;
    }
    if (!window.confirm(`¿Eliminar la nota ${nota.folio}? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.rpc("eliminar_nota_venta", { p_id: nota.id });
    if (error) {
      setMensaje("No se pudo eliminar: " + error.message);
      return;
    }
    setMensaje(`La nota ${nota.folio} fue eliminada.`);
    if (editando?.id === nota.id) nuevaNota();
    await cargarNotas();
  }

  function imprimir(nota = null) {
    const d = nota?.datos ? { ...INICIAL, ...nota.datos } : datos;
    const f = nota?.folio || folio;
    if (!d.cliente.trim()) {
      setMensaje("Captura el nombre del cliente antes de imprimir.");
      return;
    }
    if (!abrirImpresion(d, f)) {
      setMensaje("El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este sitio.");
    }
  }

  const notasFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();
    return notas.filter((nota) => `${nota.folio || ""} ${nota.datos?.cliente || ""}`.toLowerCase().includes(termino));
  }, [notas, busqueda]);

  const fechaActual = fechaHoraActual();
  const folioVisible = folio || "Se asigna al guardar";

  if (cargando) return <main className="min-h-screen bg-slate-950 p-8 text-white">Cargando sistema de notas de venta…</main>;

  if (!sesion) return (
    <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-10">
      <form onSubmit={iniciarSesion} className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <img src="/logo.jpg" alt="Transportes MX" className="mb-5 h-16 w-40 rounded bg-white p-2 object-contain" />
        <h1 className="text-2xl font-bold">Sistema de notas de venta</h1>
        <p className="mt-2 text-sm text-slate-300">Inicia sesión con tu cuenta autorizada.</p>
        <label className="mt-6 block text-sm">Correo electrónico
          <input type="email" required autoComplete="username" value={correo} onChange={(e) => setCorreo(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-white p-3 text-slate-900" />
        </label>
        <label className="mt-4 block text-sm">Contraseña
          <input type="password" required autoComplete="current-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-white p-3 text-slate-900" />
        </label>
        <button className="mt-5 w-full rounded-lg bg-emerald-600 p-3 font-bold text-white hover:bg-emerald-700">Entrar</button>
        {mensaje && <p role="alert" className="mt-4 rounded bg-red-950 p-3 text-sm text-red-200">{mensaje}</p>}
      </form>
    </main>
  );

  if (!autorizado) return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
      <p className="mt-3">Esta cuenta no tiene permisos para las notas de venta.</p>
      <button onClick={cerrarSesion} className="mt-5 rounded border border-slate-600 p-3">Cerrar sesión</button>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Transportes MX" className="h-16 w-28 rounded bg-white p-2 object-contain" />
            <div><h1 className="text-2xl font-bold sm:text-3xl">Transportes MX</h1><p className="text-slate-300">Sistema de notas de venta</p></div>
          </div>
          <div className="flex items-center gap-3"><span className="text-sm text-slate-300">{admin1 ? "Administrador 1" : "Administrador 2"}</span><button onClick={cerrarSesion} className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800">Cerrar sesión</button></div>
        </header>

        {mensaje && <p role="status" className="my-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm">{mensaje}</p>}

        <div className="grid items-start gap-5 py-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-semibold">{editando ? `Editar nota ${editando.folio}` : "Nueva nota de venta"}</h2><p className="mt-1 text-sm text-slate-400">Folio: <span className="font-bold text-red-400">{folioVisible}</span></p></div>
              <button type="button" onClick={nuevaNota} className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800">Nueva nota</button>
            </div>
            <form onSubmit={guardar} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {CAMPOS.map(([campo, etiqueta, tipo]) => (
                  <label key={campo} className="block text-sm"><span className="font-medium text-slate-200">{etiqueta}</span><input type={tipo} min={tipo === "number" ? "0" : undefined} required={campo === "cliente"} value={datos[campo] ?? ""} onChange={(e) => cambiar(campo, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500" /></label>
                ))}
                <label className="block text-sm"><span className="font-medium text-slate-200">💰 Total / estado de pago</span><input type="text" inputMode="decimal" value={datos.importe} onChange={(e) => cambiar("importe", e.target.value)} placeholder="Ej. 3500 o Pagado" className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500" /></label>
              </div>
              <label className="block text-sm"><span className="font-medium text-slate-200">Observaciones</span><textarea value={datos.observaciones} onChange={(e) => cambiar("observaciones", e.target.value)} rows={2} placeholder="Escribe las observaciones del servicio" className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900" /></label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={guardando} className="rounded-lg bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50">{guardando ? "Guardando…" : editando ? "Guardar cambios" : "Guardar nota"}</button>
                <button type="button" onClick={() => imprimir()} className="rounded-lg border border-slate-500 px-4 py-3 hover:bg-slate-800">Imprimir / PDF</button>
                {editando && <button type="button" onClick={nuevaNota} className="rounded-lg border border-slate-500 px-4 py-3 hover:bg-slate-800">Cancelar edición</button>}
              </div>
            </form>

            <div className="mt-7 border-t border-slate-700 pt-5">
              <h3 className="mb-3 text-lg font-semibold">Historial de notas</h3>
              <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por folio, cliente o servicio…" className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white" />
              {notasFiltradas.length === 0 ? <p className="text-sm text-slate-400">No hay registros que coincidan con la búsqueda.</p> : (
                <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {notasFiltradas.map((nota) => (
                    <article key={nota.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold text-red-400">{nota.folio}</p><p className="break-words">{nota.datos?.cliente || "Sin cliente"}</p><p className="break-words text-sm text-slate-400">{nota.datos?.servicio || ""}</p>{nota.datos?.importe !== "" && nota.datos?.importe !== null && nota.datos?.importe !== undefined && <p className="mt-1 font-semibold text-emerald-400">{moneda(nota.datos.importe)}</p>}</div>
                        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => imprimir(nota)} className="rounded border border-slate-600 px-3 py-2 text-sm">PDF</button><button type="button" onClick={() => editar(nota)} className="rounded border border-slate-600 px-3 py-2 text-sm">Editar</button>{admin1 && <button type="button" onClick={() => eliminar(nota)} className="rounded border border-red-800 px-3 py-2 text-sm text-red-300">Eliminar</button>}</div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-slate-200 p-2 text-black sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2 px-1"><h2 className="font-semibold text-slate-800">Vista previa de impresión</h2><button type="button" onClick={() => imprimir()} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white">Imprimir / PDF</button></div>
            <article className="mx-auto max-w-[560px] bg-white px-8 py-5 text-black shadow-xl sm:px-10 sm:py-7">
              <div className="grid grid-cols-[minmax(0,1fr)_112px] items-start gap-3">
                <div className="min-w-0">
                  <img src="/logo.jpg" alt="Transportes MX" className="mb-1 h-12 w-32 object-contain object-left" />
                  <div className="min-w-0 text-[10px] font-extrabold leading-4"><strong className="block">Grupo Turístico MX S. de R.L. de C.V.</strong><span>RFC: GTM2604271F2</span><br /><span>San Miguel de Allende Guanajuato</span><br /><span>+52 415 139 3219</span><br /><a className="font-normal text-blue-600 underline" href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a><br /><a className="font-normal text-blue-600 underline" href="https://transportesmx.org">https://transportesmx.org</a></div>
                </div>
                <div className="min-w-0"><div className="bg-red-600 px-2 py-1 text-xs font-extrabold text-white">F- {folio || "Pendiente"}</div><img src="/sprinter.png" alt="Sprinter" className="mt-2 h-20 w-full object-contain" /></div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm"><p><strong>Cliente:</strong> {datos.cliente}</p><p><strong>Teléfono:</strong> {datos.telefono}</p><p><strong>Correo:</strong> {datos.email}</p></div>
              <div className="my-3 h-1.5 w-full bg-black" />
              <div className="mt-2 inline-block max-w-full bg-green-600 px-3 py-1 text-sm font-extrabold text-white">Total: {moneda(datos.importe)}</div>
              <div className="mt-2 h-[3mm]" aria-hidden="true" /><div className="bg-black px-2 py-1.5 text-sm font-extrabold text-white">Descripción del traslado:</div>
              <div className="mt-[9mm] space-y-1.5 text-sm">
                {[["🚐", "Vehículo:", datos.unidad], ["👤", "Nombre del cliente:", datos.cliente], ["📅", "Fecha y hora:", valorFechaHora(datos)], ["📍", "Recoger en:", datos.origen], ["✈️", "Aerolínea:", datos.aerolinea || "N/A"], ["👥", "Número de pasajeros:", datos.pasajeros], ["🧳", "Número de maletas:", datos.maletas], ["☎️", "Número de teléfono:", datos.telefono], ["📍", "Destino:", datos.destino], ["🔄", "Ida y vuelta:", datos.idaVuelta], ["⏱️", "Duración:", datos.duracion]].map(([icono, etiqueta, valor]) => <p key={etiqueta} className="flex flex-wrap items-start gap-x-1"><span>{icono}</span><strong>{etiqueta}</strong><span className="break-words">{valor || ""}</span></p>)}
              </div>
              <div className="mt-[15mm] flex items-start gap-1 text-sm"><span>↩️</span><strong>Regreso:</strong><span>{valorRegreso(datos)}</span></div>
              <div className="mt-5 min-h-16 rounded-[24px] border-2 border-black px-4 py-3 text-xs"><strong className="mb-1 block">Observaciones:</strong><span>{datos.observaciones || ""}</span></div>
              <footer className="mt-4 border-t-2 border-black pt-3 text-center text-[9px] leading-4 text-slate-600"><p>San Miguel de Allende, Guanajuato · Documento Generado: {fechaActual.fecha} · Hora: {fechaActual.hora}</p><p>Grupo Turístico MX S. de R.L. de C.V.</p></footer>
            </article>
            <p className="mx-auto mt-3 max-w-[760px] text-xs text-slate-600">La vista previa sigue la distribución del documento impreso. Para generar el PDF, pulsa “Imprimir / PDF”.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
