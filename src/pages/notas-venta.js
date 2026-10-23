import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN1 = "amstrekgrt@gmail.com";
const ADMIN2 = "and-i89@hotmail.com";

const inicial = {
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

const campos = [
  ["unidad", "🚗 Vehículo", "text"],
  ["cliente", "👤 Nombre del cliente", "text"],
  ["fecha", "📆 Fecha del servicio", "date"],
  ["hora", "⏰ Hora del servicio", "time"],
  ["origen", "📍 Recoger en", "text"],
  ["aerolinea", "✈️ Aerolínea", "text"],
  ["pasajeros", "👥 Número de pasajeros", "number"],
  ["maletas", "🧳 Número de maletas", "number"],
  ["telefono", "📞 Número de teléfono", "tel"],
  ["destino", "📍 Destino", "text"],
  ["idaVuelta", "🔄 Ida y vuelta", "text"],
  ["duracion", "⏱️ Duración", "text"],
  ["regresoFecha", "↩️ Fecha de regreso", "date"],
  ["regresoHora", "🕒 Hora de regreso", "time"],
  ["email", "✉️ Correo electrónico", "email"],
  ["servicio", "📝 Descripción del traslado", "text"],
];

function moneda(valor) {
  return Number(valor || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function fechaLarga(valor) {
  if (!valor) return "";

  const fecha = new Date(`${valor}T12:00:00`);

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  }).format(fecha);
}

function horaBonita(valor) {
  if (!valor) return "";

  const [h, m] = valor.split(":").map(Number);

  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${
    h >= 12 ? "PM" : "AM"
  }`;
}

function seguro(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

export default function NotasVenta() {
  const [sesion, setSesion] = useState(null);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [datos, setDatos] = useState(inicial);
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
      return;
    }

    let activo = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!activo) return;

      if (error) {
        setMensaje("No se pudo comprobar la sesión.");
      }

      setSesion(data?.session ?? null);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_evento, nuevaSesion) => setSesion(nuevaSesion)
    );

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sesion && autorizado) cargarNotas();
  }, [sesion, autorizado]);

  async function cargarNotas() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("notas_venta")
      .select("id, folio, datos, creado_en, actualizado_en")
      .order("creado_en", { ascending: false });

    if (error) {
      setMensaje(
        "No se pudieron cargar las notas. Revisa los permisos de Supabase."
      );
      return;
    }

    setNotas(data || []);
  }

  async function iniciarSesion(e) {
    e.preventDefault();
    setMensaje("");

    if (!supabase) {
      setMensaje("No está configurada la conexión con Supabase.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });

    if (error) {
      setMensaje(
        "No se pudo iniciar sesión. Revisa el correo y la contraseña."
      );
      return;
    }

    setSesion(data.session);
    setContrasena("");
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    setSesion(null);
    setNotas([]);
    nuevaNota();
  }

  function cambiar(campo, valor) {
    setDatos((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function nuevaNota() {
    setDatos({ ...inicial });
    setFolio("");
    setEditando(null);
    setMensaje("");
  }

  async function guardar(e) {
    e.preventDefault();

    if (!supabase || !autorizado || guardando) return;

    setGuardando(true);
    setMensaje("");

    try {
      const importeCapturado = String(datos.importe ?? "").trim();
      const payload = {
        ...datos,
        // Mantener el importe vacío si no se capturó una cantidad.
        importe: importeCapturado === "" ? "" : Number(importeCapturado),
      };

      if (editando) {
        const { error } = await supabase.rpc("editar_nota_venta", {
          p_id: editando.id,
          p_datos: payload,
        });

        if (error) throw error;

        setMensaje(
          `La nota ${editando.folio} se actualizó correctamente.`
        );

        nuevaNota();
        await cargarNotas();
      } else {
        const { data, error } = await supabase.rpc("crear_nota_venta", {
          p_datos: payload,
        });

        if (error) throw error;

        const nueva = Array.isArray(data) ? data[0] : data;

        if (!nueva?.folio) {
          setMensaje(
            "La nota se guardó, pero no se recibió el folio. Revisa Supabase antes de crear otra."
          );

          await cargarNotas();
          return;
        }

        setFolio(nueva.folio);

        setMensaje(
          `Nota guardada correctamente con folio ${nueva.folio}.`
        );

        await cargarNotas();
        // Mantener visible la nota recién guardada y permitir editarla sin crear otro folio.
        setDatos(payload);
        setEditando({ id: nueva.nota_id || nueva.id, folio: nueva.folio, datos: payload });
      }
    } catch (error) {
      setMensaje(
        "No se pudo guardar la nota: " +
          (error?.message || "Error desconocido.")
      );
    } finally {
      setGuardando(false);
    }
  }

  function editar(nota) {
    setEditando(nota);
    setDatos({ ...inicial, ...nota.datos });
    setFolio(nota.folio);
    setMensaje(`Editando la nota ${nota.folio}.`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function eliminar(nota) {
    if (!admin1) {
      setMensaje("Solo el Administrador 1 puede eliminar notas.");
      return;
    }

    if (
      !window.confirm(
        `¿Eliminar la nota ${nota.folio}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    const { error } = await supabase.rpc("eliminar_nota_venta", {
      p_id: nota.id,
    });

    if (error) {
      setMensaje("No se pudo eliminar: " + error.message);
    } else {
      setMensaje(`La nota ${nota.folio} fue eliminada.`);

      if (editando?.id === nota.id) {
        nuevaNota();
      }

      await cargarNotas();
    }
  }
  function imprimir(nota = null) {
    const d = nota?.datos || datos;
    const f = nota?.folio || folio || "Pendiente de guardar";

    if (!nota && !d.cliente.trim()) {
      setMensaje("Captura el nombre del cliente antes de imprimir.");
      return;
    }

    const ventana = window.open("", "_blank", "width=900,height=950");

    if (!ventana) {
      setMensaje("Permite las ventanas emergentes para imprimir la hoja.");
      return;
    }

    const seguro = (valor) =>
      String(valor ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]);

    const fmtFecha = (v) => (v ? fechaLarga(v) : "");
    const fmtHora = (v) => (v ? horaBonita(v) : "");
    const valor = (v) => seguro(v || "");
    const total = String(d.importe ?? "").trim();

    const fechaGeneracion = new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "America/Mexico_City",
    }).format(new Date());

    const horaGeneracion = new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Mexico_City",
    }).format(new Date());

    const fila = (label, v, extra = "") =>
      `<div class="dato"><div class="etiqueta">${label}</div><div class="valor ${extra}">${valor(v)}</div></div>`;

    ventana.document.open();

    ventana.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nota de venta ${seguro(f)}</title>

<style>
*{box-sizing:border-box}
@page{size:Letter;margin:8mm}
html,body{margin:0;padding:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}
body{font-size:9pt}
.hoja{width:100%;max-width:194mm;margin:0 auto;min-height:0}
.top{display:grid;grid-template-columns:1fr auto;align-items:start;gap:8px;border-bottom:2px solid #111;padding:0 0 7px}
.empresa{display:flex;gap:10px;align-items:center;min-width:0}
.logo{width:76px;height:55px;object-fit:contain}
.empresa-texto{font-size:8pt;line-height:1.35}
.empresa-texto strong{font-size:11pt;display:block;margin-bottom:2px}
.folio{font-size:14pt;font-weight:800;color:#c82027;white-space:nowrap}
.contacto{color:#111;text-decoration:none}
.cabecera-servicio{display:flex;justify-content:space-between;align-items:center;margin:7px 0 5px;gap:8px}
.cabecera-servicio h1{font-size:13pt;margin:0;font-weight:800}
.sprinter{width:115px;height:42px;object-fit:contain}
.datos{display:grid;grid-template-columns:1fr 1fr;gap:4px 7px}
.dato{display:grid;grid-template-columns:42% 58%;min-height:25px;border:1px solid #202020;break-inside:avoid}
.etiqueta{background:#e8e8e8;padding:5px 6px;font-weight:700;display:flex;align-items:center;line-height:1.15}
.valor{background:#fff;padding:5px 6px;min-width:0;overflow-wrap:anywhere;min-height:24px}
.full{grid-column:1/-1}
.seccion{font-size:10pt;font-weight:800;background:#202020;color:#fff;padding:5px 7px;margin:7px 0 4px}
.descripcion{border:1px solid #202020;min-height:35px;padding:6px;background:#fff;overflow-wrap:anywhere}
.total-row{display:grid;grid-template-columns:1fr 58%;margin-top:7px;border:1px solid #202020;min-height:32px}
.total-label{background:#16803d;color:#fff;font-weight:800;padding:7px;text-align:right;font-size:11pt}
.total-value{background:#fff;color:#111;padding:6px 8px;font-weight:800;font-size:12pt;min-height:30px}
.observaciones{margin-top:7px;border:1.5px solid #222;border-radius:16px;padding:7px 10px;min-height:39px}
.observaciones strong{display:block;margin-bottom:3px}
.pie{border-top:1px solid #222;margin-top:8px;padding-top:5px;text-align:center;font-size:7pt;line-height:1.35;color:#333}
.botones{margin:14px 0;text-align:center}
button{padding:9px 16px;margin:3px;cursor:pointer}
@media print{
 @page{size:Letter;margin:8mm}
 html,body{width:100%;height:auto;margin:0!important;padding:0!important}
 .botones{display:none!important}
 body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
 .hoja{width:100%;max-width:none;margin:0;min-height:0}
 .dato,.total-row,.observaciones,.top,.cabecera-servicio,.seccion,.descripcion,.pie{break-inside:avoid;page-break-inside:avoid}
}
</style>
</head>

<body>
<main class="hoja">

<header class="top">
 <div class="empresa">
  <img class="logo" src="/logo.jpg" alt="Logo MX">
  <div class="empresa-texto">
   <strong>Grupo Turístico MX S. de R.L. de C.V.</strong>
   RFC: GTM2604271F2<br>
   San Miguel de Allende, Guanajuato<br>
   +52 415 139 3219<br>
   <a class="contacto" href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a><br>
   <a class="contacto" href="https://transportesmx.org">https://transportesmx.org</a>
  </div>
 </div>
 <div class="folio">${seguro(f)}</div>
</header>

<div class="cabecera-servicio">
 <h1>Descripción del traslado</h1>
 <img class="sprinter" src="/sprinter.png" alt="Vehículo">
</div>

<section class="datos">
 ${fila("🚗 Vehículo", d.unidad)}
 ${fila("👤 Nombre del cliente", d.cliente)}
 ${fila("📆 Fecha y hora", [fmtFecha(d.fecha),fmtHora(d.hora)].filter(Boolean).join(" · "))}
 ${fila("📍 Recoger en", d.origen)}
 ${fila("✈️ Aerolínea", d.aerolinea)}
 ${fila("👥 Número de pasajeros", d.pasajeros)}
 ${fila("🧳 Número de maletas", d.maletas)}
 ${fila("📞 Número de teléfono", d.telefono)}
 ${fila("📍 Destino", d.destino)}
 ${fila("🔄 Ida y vuelta", d.idaVuelta)}
 ${fila("⏰ Duración", d.duracion)}
 ${fila("↩️ Regreso", [fmtFecha(d.regresoFecha),fmtHora(d.regresoHora)].filter(Boolean).join(" · "), "full")}
</section>

<div class="seccion">Descripción del servicio</div>
<div class="descripcion">${valor(d.servicio)}</div>

<div class="total-row">
 <div class="total-label">TOTAL (MXN)</div>
 <div class="total-value">${
   total
     ? "$" + Number(total).toLocaleString("es-MX", {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
       }) + " MXN"
     : ""
 }</div>
</div>

<div class="observaciones">
 <strong>Observaciones:</strong>
 ${valor(d.observaciones)}
</div>

<footer class="pie">
 San Miguel de Allende, Guanajuato / Documento generado: ${seguro(fechaGeneracion)} / Hora ${seguro(horaGeneracion)}<br>
 Grupo Turístico MX S. de R.L. de C.V. · contacto@transportesmx.org · transportesmx.org
</footer>

<div class="botones">
 <button onclick="window.print()">Imprimir / Guardar PDF</button>
 <button onclick="window.close()">Cerrar</button>
</div>

</main>
</body>
</html>`);

    ventana.document.close();
  }

  const notasFiltradas = notas.filter((nota) => {
    const texto = `${nota.folio || ""} ${nota.datos?.cliente || ""} ${nota.datos?.servicio || ""}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  if (cargando) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Cargando...
      </main>
    );
  }

  if (!sesion) {
    return (
      <main className="min-h-screen bg-black p-5 text-white sm:p-10">
        <form
          onSubmit={iniciarSesion}
          className="mx-auto mt-10 max-w-md rounded-2xl border border-gray-700 bg-gray-950 p-6"
        >
          <h1 className="text-3xl font-bold text-yellow-400">
            Transportes MX
          </h1>

          <p className="mt-2 text-gray-300">
            Sistema de notas de venta
          </p>

          <label className="mt-6 block text-sm">
            Correo electrónico
          </label>

          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-3"
          />

          <label className="mt-4 block text-sm">
            Contraseña
          </label>

          <input
            type="password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-3"
          />

          <button className="mt-5 w-full rounded-lg bg-yellow-500 p-3 font-bold text-black">
            Entrar
          </button>

          {mensaje && (
            <p role="alert" className="mt-4 text-red-400">
              {mensaje}
            </p>
          )}
        </form>
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-2xl font-bold">
          Acceso no autorizado
        </h1>

        <p className="mt-3">
          Esta cuenta no tiene permisos para las notas de venta.
        </p>

        <button
          onClick={cerrarSesion}
          className="mt-5 rounded border p-3"
        >
          Cerrar sesión
        </button>
      </main>
    );
  }
    return (
    <main className="min-h-screen bg-slate-950 p-3 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div className="flex items-center gap-4">
            <img
              src="/logo.jpg"
              alt="Transportes MX"
              className="h-14 w-24 rounded bg-white object-contain p-1"
            />

            <div>
              <h1 className="text-2xl font-bold text-yellow-400 sm:text-3xl">
                Transportes MX
              </h1>
              <p className="text-slate-300">Nota de venta</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">
              {admin1 ? "Administrador 1" : "Administrador 2"}
            </span>

            <button
              onClick={cerrarSesion}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {mensaje && (
          <p
            role="status"
            className="my-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"
          >
            {mensaje}
          </p>
        )}

        <div className="grid items-start gap-5 py-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">
                {editando
                  ? `Editar ${editando.folio}`
                  : "Nueva nota de venta"}
              </h2>

              <button
                type="button"
                onClick={nuevaNota}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm"
              >
                Nueva nota
              </button>
            </div>

            {folio && (
              <p className="mb-4 rounded-lg bg-slate-800 p-3 font-bold text-yellow-400">
                Folio: {folio}
              </p>
            )}

            <form onSubmit={guardar} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {campos.map(([campo, etiqueta, tipo]) => (
                  <label key={campo} className="block text-sm">
                    <span>{etiqueta}</span>

                    <input
                      type={tipo}
                      required={campo === "cliente"}
                      min={tipo === "number" ? "0" : undefined}
                      value={datos[campo]}
                      onChange={(e) => cambiar(campo, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-yellow-500"
                    />
                  </label>
                ))}

                <label className="block text-sm">
                  💰 Total (MXN)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={datos.importe}
                    onChange={(e) => cambiar("importe", e.target.value)}
                    placeholder="Capturar importe"
                    className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-yellow-500"
                  />
                </label>
              </div>

              <label className="block text-sm">
                Observaciones

                <textarea
                  value={datos.observaciones}
                  onChange={(e) => cambiar("observaciones", e.target.value)}
                  rows={3}
                  placeholder="Escribe las observaciones del servicio"
                  className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-yellow-500"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black disabled:opacity-50"
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                    ? "Guardar cambios"
                    : "Guardar nota"}
                </button>

                <button
                  type="button"
                  onClick={() => imprimir()}
                  className="rounded-lg border border-slate-500 px-4 py-3"
                >
                  Vista previa / PDF
                </button>

                {editando && (
                  <button
                    type="button"
                    onClick={nuevaNota}
                    className="rounded-lg border border-slate-500 px-4 py-3"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>

            <div className="mt-7 border-t border-slate-700 pt-5">
              <h3 className="mb-3 text-lg font-semibold">
                Historial de hojas
              </h3>

              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por folio, cliente o servicio..."
                className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white"
              />

              {notasFiltradas.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No hay registros que coincidan con la búsqueda.
                </p>
              ) : (
                <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {notasFiltradas.map((nota) => (
                    <article
                      key={nota.id}
                      className="rounded-xl border border-slate-700 bg-slate-950 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-yellow-400">
                            {nota.folio}
                          </p>

                          <p className="break-words">
                            {nota.datos?.cliente || "Sin cliente"}
                          </p>

                          <p className="break-words text-sm text-slate-400">
                            {nota.datos?.servicio || ""}
                          </p>

                          <p className="mt-1 font-semibold text-green-400">
                            {nota.datos?.importe
                              ? moneda(nota.datos.importe)
                              : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => imprimir(nota)}
                            className="rounded border border-slate-600 px-3 py-2 text-sm"
                          >
                            PDF
                          </button>

                          <button
                            type="button"
                            onClick={() => editar(nota)}
                            className="rounded border border-slate-600 px-3 py-2 text-sm"
                          >
                            Editar
                          </button>

                          {admin1 && (
                            <button
                              type="button"
                              onClick={() => eliminar(nota)}
                              className="rounded border border-red-800 px-3 py-2 text-sm text-red-300"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-slate-200 p-2 text-black sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <h2 className="font-semibold text-slate-800">
                Vista previa
              </h2>

              <button
                type="button"
                onClick={() => imprimir()}
                className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-bold"
              >
                Imprimir / PDF
              </button>
            </div>

            <article className="mx-auto max-w-[650px] bg-white p-5 shadow-xl sm:p-8">
              <header className="flex items-center gap-4 border-b-2 border-black pb-4">
                <img
                  src="/logo.jpg"
                  alt="Logo Transportes MX"
                  className="w-28 object-contain sm:w-36"
                />

                <div className="min-w-0">
                  <h3 className="text-xl font-bold sm:text-2xl">
                    Grupo Turístico MX S. de R.L. de C.V.
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    HOJA DE SERVICIO
                  </p>

                  <p className="mt-1 break-words text-xs text-slate-500">
                    Grupo Turístico MX S. de R.L. de C.V. · RFC: GTM2604271F2
                  </p>
                  <p className="break-words text-xs text-slate-500">
                    San Miguel de Allende, Guanajuato · +52 415 139 3219
                  </p>
                  <p className="break-words text-xs text-blue-700">
                    <a href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a>
                    {" · "}
                    <a href="https://transportesmx.org">transportesmx.org</a>
                  </p>

                  <p className="mt-2 font-bold text-red-600">
                    Folio: {folio || editando?.folio || "Se asigna al guardar"}
                  </p>
                </div>
              </header>

              <div className="flex h-20 items-center justify-center border-b border-slate-300">
                <img
                  src="/sprinter.png"
                  alt="Vehículo de Transportes MX"
                  className="max-h-16 max-w-full object-contain"
                />
              </div>

              <h4 className="mb-2 font-bold">
                Descripción del traslado
              </h4>

              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                {[
                  ["🚗 Vehículo", datos.unidad],
                  ["👤 Nombre del cliente", datos.cliente],
                  [
                    "📆 Fecha y hora",
                    [
                      fechaLarga(datos.fecha),
                      horaBonita(datos.hora),
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  ],
                  ["📍 Recoger en", datos.origen],
                  ["✈️ Aerolínea", datos.aerolinea],
                  ["👥 Número de pasajeros", datos.pasajeros],
                  ["🧳 Número de maletas", datos.maletas],
                  ["📞 Número de teléfono", datos.telefono],
                  ["📍 Destino", datos.destino],
                  ["🔄 Ida y vuelta", datos.idaVuelta],
                  ["⏰ Duración", datos.duracion],
                  [
                    "↩️ Regreso",
                    [
                      fechaLarga(datos.regresoFecha),
                      horaBonita(datos.regresoHora),
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  ],
                ].map(([etiqueta, valor]) => (
                  <div
                    key={etiqueta}
                    className="grid grid-cols-[42%_58%] border border-black"
                  >
                    <strong className="bg-slate-200 p-2">
                      {etiqueta}
                    </strong>

                    <span className="min-h-8 break-words bg-white p-2">
                      {valor || ""}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 border border-black">
                <div className="bg-slate-800 p-2 font-bold text-white">
                  Descripción del servicio
                </div>

                <div className="min-h-10 whitespace-pre-wrap break-words p-2 text-sm">
                  {datos.servicio}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-[42%_58%] border border-black">
                <strong className="bg-green-700 p-2 text-right text-white">
                  TOTAL (MXN)
                </strong>

                <span className="min-h-10 bg-white p-2 font-bold">
                  {datos.importe !== ""
                    ? moneda(datos.importe)
                    : ""}
                </span>
              </div>

              <div className="mt-5 min-h-20 rounded-2xl border border-slate-400 p-4 text-sm">
                <strong>Observaciones:</strong>

                <p className="mt-2 whitespace-pre-wrap break-words">
                  {datos.observaciones || ""}
                </p>
              </div>

              <footer className="mt-7 border-t-2 border-black pt-3 text-center text-[10px] text-slate-500">
                <p>
                  San Miguel de Allende, Guanajuato · Documento generado: {new Intl.DateTimeFormat("es-MX", {
                    day: "2-digit", month: "long", year: "numeric", timeZone: "America/Mexico_City",
                  }).format(new Date())} · Hora {new Intl.DateTimeFormat("es-MX", {
                    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/Mexico_City",
                  }).format(new Date())}
                </p>
                <p>
                  Grupo Turístico MX S. de R.L. de C.V. · <a className="text-blue-700" href="mailto:contacto@transportesmx.org">contacto@transportesmx.org</a> · <a className="text-blue-700" href="https://transportesmx.org">transportesmx.org</a>
                </p>
              </footer>
            </article>

            <p className="mx-auto mt-3 max-w-[650px] text-xs text-slate-600">
              La vista previa muestra los datos capturados. Para imprimir
              o guardar el PDF, utiliza el botón superior.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
