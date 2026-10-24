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
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "long", year: "numeric", timeZone: ZONA,
  }).format(fecha);
}

function formatoHora(valor) {
  if (!valor) return "";
  const [hora, minuto] = valor.split(":").map(Number);
  if (!Number.isFinite(hora) || !Number.isFinite(minuto)) return valor;
  return `${hora % 12 || 12}:${String(minuto).padStart(2, "0")} ${hora >= 12 ? "p. m." : "a. m."}`;
}

function moneda(valor) {
  if (valor === "" || valor === null || valor === undefined) return "";
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "";
  return numero.toLocaleString("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

function fechaHoraActual() {
  const ahora = new Date();
  return {
    fecha: new Intl.DateTimeFormat("es-MX", {
      day: "2-digit", month: "long", year: "numeric", timeZone: ZONA,
    }).format(ahora),
    hora: new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit", minute: "2-digit", hour12: true, timeZone: ZONA,
    }).format(ahora),
  };
}

function valorFechaHora(datos) {
  return [formatoFecha(datos.fecha), formatoHora(datos.hora)].filter(Boolean).join(" · ");
}

function valorRegreso(datos) {
  return [formatoFecha(datos.regresoFecha), formatoHora(datos.regresoHora)].filter(Boolean).join(" · ");
}

function htmlFila(etiqueta, valor, clase = "") {
  return `<div class="dato ${clase}"><div class="etiqueta">${escapar(etiqueta)}</div><div class="valor">${escapar(valor || "")}</div></div>`;
}

function abrirImpresion(datos, folio) {
  const ventana = window.open("", "_blank", "width=1000,height=900");
  if (!ventana) return false;
  const generado = fechaHoraActual();
  const folioTexto = folio || "Pendiente de guardar";
  const origen = window.location.origin;
  const filas = [
    ["🚐 Vehículo", datos.unidad],
    ["👤 Nombre del cliente", datos.cliente],
    ["📅 Fecha y hora", valorFechaHora(datos)],
    ["📍 Recoger en", datos.origen],
    ["✈️ Aerolínea", datos.aerolinea],
    ["👥 Número de pasajeros", datos.pasajeros],
    ["🧳 Número de maletas", datos.maletas],
    ["☎️ Número de teléfono", datos.telefono],
    ["📍 Destino", datos.destino],
    ["🔄 Ida y vuelta", datos.idaVuelta],
    ["⏱️ Duración", datos.duracion],
    ["↩️ Regreso", valorRegreso(datos)],
    ["✉️ Correo electrónico", datos.email],
  ].map(([etiqueta, valor]) => htmlFila(etiqueta, valor)).join("");
  const total = datos.importe !== "" && datos.importe !== null && datos.importe !== undefined
    ? moneda(datos.importe)
    : "";

  ventana.document.open();
  ventana.document.write(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Documento ${escapar(folioTexto)}</title>
<style>
  *{box-sizing:border-box}
  @page{size:A4 portrait;margin:10mm}
  html,body{margin:0;padding:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-size:10.5pt;line-height:1.25}
  .hoja{width:100%;max-width:190mm;margin:0 auto}
  .encabezado{display:grid;grid-template-columns:1fr auto;gap:7mm;align-items:start;border-bottom:1.3mm solid #111;padding-bottom:5mm}
  .marca{display:flex;align-items:center;gap:5mm;min-width:0}
  .logo{width:32mm;height:23mm;object-fit:contain;flex:none}
  .empresa{font-size:9pt;line-height:1.38;overflow-wrap:anywhere}
  .empresa strong{font-size:12pt;display:block;margin-bottom:1mm}
  .enlace{color:#444;text-decoration:none}
  .folioBox{text-align:right;min-width:43mm;padding-top:1mm}
  .folio{display:inline-block;background:#c82027;color:#fff;font-size:13pt;font-weight:800;padding:3mm 4mm;border-radius:1mm;overflow-wrap:anywhere}
  .fechaDoc{font-size:9pt;margin-top:3mm}
  .tituloRow{display:flex;align-items:center;justify-content:space-between;gap:5mm;margin:5mm 0 3mm}
  h1{font-size:17pt;line-height:1.1;margin:0;font-weight:800}
  .sprinter{width:42mm;height:20mm;object-fit:contain;flex:none}
  .cliente{display:grid;grid-template-columns:1fr 1fr;gap:2mm 7mm;border-bottom:.3mm solid #888;padding:0 0 4mm;margin-bottom:4mm}
  .clienteItem{font-size:10pt;overflow-wrap:anywhere;min-height:5mm}
  .clienteItem strong{font-weight:700}
  .datos{display:grid;grid-template-columns:1fr 1fr;gap:2mm 3mm}
  .dato{display:grid;grid-template-columns:43% 57%;min-height:10.5mm;border:0;border-bottom:.25mm solid #aaa;break-inside:avoid;page-break-inside:avoid}
  .etiqueta{background:#e7e7e7;padding:2.1mm 2mm;font-weight:700;display:flex;align-items:center;font-size:9pt;line-height:1.18;overflow-wrap:anywhere}
  .valor{background:#fff;padding:2.1mm 2mm;min-width:0;min-height:10mm;font-size:9.5pt;line-height:1.2;white-space:pre-wrap;overflow-wrap:anywhere}
  .full{grid-column:1/-1}
  .barra{background:#191919;color:#fff;padding:2.6mm 3mm;font-size:11pt;font-weight:800;margin:4mm 0 0}
  .descripcion{border:.3mm solid #222;min-height:21mm;padding:3mm;font-size:10pt;white-space:pre-wrap;overflow-wrap:anywhere}
  .total{display:block;border:0;border-top:.3mm solid #888;margin-top:3mm;padding:3mm 0 0;min-height:10mm;font-size:14pt;font-weight:800;break-inside:avoid}
  .observaciones{margin-top:3mm;border:.4mm solid #222;border-radius:7mm;min-height:19mm;padding:3mm 5mm;font-size:10pt;break-inside:avoid}
  .observaciones strong{display:block;margin-bottom:1.5mm}
  .pie{border-top:.3mm solid #222;margin-top:4mm;padding-top:2.5mm;text-align:center;font-size:8pt;line-height:1.4;color:#444;overflow-wrap:anywhere}
  .acciones{display:flex;justify-content:center;gap:3mm;margin:7mm 0 2mm}
  button{font-size:11pt;padding:3mm 5mm;border:1px solid #777;border-radius:2mm;background:#f4f4f4;cursor:pointer}
  @media print{.acciones{display:none!important}.hoja{max-width:none}.dato,.total,.observaciones{break-inside:avoid;page-break-inside:avoid}a{color:#444!important;text-decoration:none!important}}
</style></head><body><main class="hoja">
<header class="encabezado"><div class="marca"><img class="logo" src="${origen}/logo.jpg" alt="Transportes MX"><div class="empresa">
<strong>Grupo Turístico MX S. de R.L. de C.V.</strong>RFC: GTM2604271F2<br>San Miguel de Allende, Guanajuato<br>+52 415 139 3219<br><a class="enlace" href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a><br><a class="enlace" href="https://transportesmx.org">https://transportesmx.org</a>
</div></div><div class="folioBox"><div class="folio">Folio: ${escapar(folioTexto)}</div><div class="fechaDoc">Fecha: ${escapar(generado.fecha)}</div></div></header>
<div class="tituloRow"><img class="sprinter" src="${origen}/sprinter.png" alt="Vehículo Sprinter"></div>
<section class="cliente"><div class="clienteItem"><strong>Cliente:</strong> ${escapar(datos.cliente || "")}</div><div class="clienteItem"><strong>Teléfono:</strong> ${escapar(datos.telefono || "")}</div><div class="clienteItem"><strong>Correo:</strong> ${escapar(datos.email || "")}</div><div class="clienteItem"><strong>Fecha del servicio:</strong> ${escapar(valorFechaHora(datos))}</div></section>
<section class="datos">${filas}</section>
<div class="barra">Descripción del servicio</div><div class="descripcion">${escapar(datos.servicio || "")}</div>
<div class="total">Total${total ? ` ${escapar(total)} MXN` : ""}</div>
<div class="observaciones"><strong>Observaciones:</strong><div>${escapar(datos.observaciones || "")}</div></div>
<footer class="pie">San Miguel de Allende, Guanajuato · Documento generado: ${escapar(generado.fecha)} · Hora: ${escapar(generado.hora)}<br>Grupo Turístico MX S. de R.L. de C.V. · <a class="enlace" href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a> · <a class="enlace" href="https://transportesmx.org">transportesmx.org</a></footer>
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
        importe: datos.importe === "" ? "" : Number(datos.importe),
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
    return notas.filter((nota) => `${nota.folio || ""} ${nota.datos?.cliente || ""} ${nota.datos?.servicio || ""}`.toLowerCase().includes(termino));
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
                <label className="block text-sm"><span className="font-medium text-slate-200">💰 Total (MXN)</span><input type="number" min="0" step="0.01" value={datos.importe} onChange={(e) => cambiar("importe", e.target.value)} placeholder="Dejar vacío si aún no hay importe" className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500" /></label>
              </div>
              <label className="block text-sm"><span className="font-medium text-slate-200">📝 Descripción del servicio</span><textarea value={datos.servicio} onChange={(e) => cambiar("servicio", e.target.value)} rows={3} placeholder="Describe el servicio contratado" className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900" /></label>
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
            <article className="mx-auto max-w-[760px] bg-white p-5 shadow-xl sm:p-7">
              <header className="grid grid-cols-[1fr_auto] items-start gap-3 border-b-4 border-black pb-4">
                <div className="flex items-center gap-3"><img src="/logo.jpg" alt="Logo Transportes MX" className="h-20 w-28 object-contain" /><div className="text-[11px] leading-5"><strong className="block text-sm">Grupo Turístico MX S. de R.L. de C.V.</strong><span>RFC: GTM2604271F2</span><br /><span>San Miguel de Allende, Guanajuato</span><br /><span>+52 415 139 3219</span><br /><a className="text-slate-600 no-underline" href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a><br /><a className="text-slate-600 no-underline" href="https://transportesmx.org">https://transportesmx.org</a></div></div>
                <div className="max-w-[180px] text-right"><p className="inline-block break-words rounded bg-red-600 px-3 py-2 text-lg font-extrabold text-white">Folio: {folio || "Pendiente de guardar"}</p><p className="mt-2 text-xs">Fecha: {fechaActual.fecha}</p></div>
              </header>
              <div className="my-4 flex items-center justify-end gap-3"><img src="/sprinter.png" alt="Sprinter" className="h-20 w-44 object-contain" /></div>
              <div className="mb-4 grid grid-cols-2 gap-x-5 gap-y-2 border-b border-slate-400 pb-4 text-sm"><p className="break-words"><strong>Cliente:</strong> {datos.cliente}</p><p className="break-words"><strong>Teléfono:</strong> {datos.telefono}</p><p className="break-words"><strong>Correo:</strong> {datos.email}</p><p><strong>Fecha del servicio:</strong> {valorFechaHora(datos)}</p></div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[["🚐 Vehículo", datos.unidad], ["👤 Nombre del cliente", datos.cliente], ["📅 Fecha y hora", valorFechaHora(datos)], ["📍 Recoger en", datos.origen], ["✈️ Aerolínea", datos.aerolinea], ["👥 Número de pasajeros", datos.pasajeros], ["🧳 Número de maletas", datos.maletas], ["☎️ Número de teléfono", datos.telefono], ["📍 Destino", datos.destino], ["🔄 Ida y vuelta", datos.idaVuelta], ["⏱️ Duración", datos.duracion], ["↩️ Regreso", valorRegreso(datos)], ["✉️ Correo electrónico", datos.email]].map(([etiqueta, valor]) => <div key={etiqueta} className="grid min-h-[44px] grid-cols-[43%_57%] border-b border-slate-300"><strong className="flex items-center bg-slate-200 p-2 text-xs leading-tight">{etiqueta}</strong><span className="break-words p-2 text-xs">{valor || ""}</span></div>)}
              </div>
              <div className="mt-4"><div className="bg-neutral-900 p-2 font-bold text-white">Descripción del servicio</div><div className="min-h-[72px] whitespace-pre-wrap break-words p-3 text-sm">{datos.servicio}</div></div>
              <div className="mt-3 border-t border-slate-400 py-3 text-lg font-extrabold">Total{moneda(datos.importe) ? ` ${moneda(datos.importe)} MXN` : ""}</div>
              <div className="mt-4 min-h-[68px] rounded-[22px] border-2 border-slate-700 p-3 text-sm"><strong>Observaciones:</strong><p className="mt-2 whitespace-pre-wrap break-words">{datos.observaciones}</p></div>
              <footer className="mt-4 border-t border-black pt-3 text-center text-[10px] leading-4 text-slate-600"><p>San Miguel de Allende, Guanajuato · Documento generado: {fechaActual.fecha} · Hora: {fechaActual.hora}</p><p>Grupo Turístico MX S. de R.L. de C.V. · contacto@transportesmx.org · transportesmx.org</p></footer>
            </article>
            <p className="mx-auto mt-3 max-w-[760px] text-xs text-slate-600">Esta vista previa usa el mismo orden de contenido que el documento de impresión. Para generar el PDF, pulsa “Imprimir / PDF”.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
