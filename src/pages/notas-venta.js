
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
};

const campos = [
  ["cliente", "Nombre del cliente", "text"],
  ["telefono", "Teléfono", "tel"],
  ["email", "Correo electrónico", "email"],
  ["servicio", "Descripción del servicio", "text"],
  ["fecha", "Fecha del servicio", "date"],
  ["hora", "Hora del servicio", "time"],
  ["origen", "Origen", "text"],
  ["destino", "Destino", "text"],
  ["unidad", "Unidad / vehículo", "text"],
  ["pasajeros", "Número de pasajeros", "number"],
  ["importe", "Importe (MXN)", "number"],
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
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
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
      if (error) setMensaje("No se pudo comprobar la sesión.");
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
      setMensaje("No se pudieron cargar las notas. Revisa los permisos de Supabase.");
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
      setMensaje("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
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
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
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
      const payload = {
        ...datos,
        importe: Number(datos.importe || 0),
      };

      if (editando) {
        const { error } = await supabase.rpc("editar_nota_venta", {
          p_id: editando.id,
          p_datos: payload,
        });

        if (error) throw error;

        setMensaje(`La nota ${editando.folio} se actualizó correctamente.`);
        nuevaNota();
        await cargarNotas();
      } else {
        const { data, error } = await supabase.rpc("crear_nota_venta", {
          p_datos: payload,
        });

        if (error) throw error;

        const nueva = Array.isArray(data) ? data[0] : data;

        if (!nueva?.folio) {
          setMensaje("La nota se guardó, pero no se recibió el folio. Revisa Supabase antes de crear otra.");
          await cargarNotas();
          return;
        }

        setFolio(nueva.folio);
        setMensaje(`Nota guardada correctamente con folio ${nueva.folio}.`);
        await cargarNotas();
        setDatos({ ...inicial });
        setEditando(null);
      }
    } catch (error) {
      setMensaje("No se pudo guardar la nota: " + (error?.message || "Error desconocido."));
    } finally {
      setGuardando(false);
    }
  }

  function editar(nota) {
    setEditando(nota);
    setDatos({ ...inicial, ...nota.datos });
    setFolio(nota.folio);
    setMensaje(`Editando la nota ${nota.folio}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(nota) {
    if (!admin1) {
      setMensaje("Solo el Administrador 1 puede eliminar notas.");
      return;
    }

    if (!window.confirm(`¿Eliminar la nota ${nota.folio}? Esta acción no se puede deshacer.`)) {
      return;
    }

    const { error } = await supabase.rpc("eliminar_nota_venta", {
      p_id: nota.id,
    });

    if (error) {
      setMensaje("No se pudo eliminar: " + error.message);
    } else {
      setMensaje(`La nota ${nota.folio} fue eliminada.`);
      if (editando?.id === nota.id) nuevaNota();
      await cargarNotas();
    }
  }

  function imprimir(nota = null) {
    const d = nota?.datos || datos;
    const f = nota?.folio || folio || "Vista previa";

    if (!nota && !datos.cliente.trim()) {
      setMensaje("Captura el nombre del cliente antes de imprimir.");
      return;
    }

    const ventana = window.open("", "_blank", "width=900,height=950");

    if (!ventana) {
      setMensaje("Permite las ventanas emergentes para imprimir la nota.");
      return;
    }

    const filas = [
      ["Cliente", d.cliente],
      ["Teléfono", d.telefono],
      ["Correo electrónico", d.email],
      ["Servicio", d.servicio],
      ["Fecha del servicio", fechaLarga(d.fecha)],
      ["Hora", horaBonita(d.hora)],
      ["Origen", d.origen],
      ["Destino", d.destino],
      ["Unidad / vehículo", d.unidad],
      ["Número de pasajeros", d.pasajeros],
    ];

    ventana.document.open();
    ventana.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nota de venta ${seguro(f)}</title>
<style>
  *{box-sizing:border-box}
  @page{size:Letter;margin:12mm}
  body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:0;font-size:10pt}
  .hoja{width:100%;max-width:190mm;margin:0 auto}
  .encabezado{display:flex;align-items:center;gap:18px;border-bottom:3px solid #c99a16;padding-bottom:12px}
  .logo{width:115px;max-height:65px;object-fit:contain}
  .empresa{flex:1}
  h1{font-size:21pt;margin:0 0 5px;color:#111}
  .subtitulo{font-size:11pt;margin:0;color:#555;font-weight:bold}
  .folio{margin-top:9px;color:#b58b12;font-weight:bold;font-size:17pt}
  .sprinter{width:100%;height:85px;object-fit:contain;margin:10px 0 2px}
  table{width:100%;border-collapse:collapse;margin-top:12px;table-layout:fixed}
  td{border:1px solid #ddd;padding:7px 9px;vertical-align:top;overflow-wrap:anywhere}
  td:first-child{width:32%;font-weight:bold;background:#f5f5f5}
  .total{margin-top:16px;text-align:right;color:#188038;font-size:19pt;font-weight:bold}
  .obs{margin-top:15px;border:1px solid #999;border-radius:14px;padding:12px;min-height:48px;overflow-wrap:anywhere}
  .pie{margin-top:22px;border-top:2px solid #222;padding-top:9px;text-align:center;color:#777;font-size:8pt}
  .botones{margin:20px 0;text-align:center}
  button{padding:10px 18px;margin:4px;cursor:pointer}
  @media print{
    .botones{display:none}
    .hoja{max-width:none}
    body{print-color-adjust:exact;-webkit-print-color-adjust:exact}
    tr{break-inside:avoid}
  }
</style>
</head>
<body>
<main class="hoja">
  <header class="encabezado">
    <img class="logo" src="/logo.jpg" alt="Transportes MX">
    <div class="empresa">
      <h1>TRANSPORTES MX</h1>
      <p class="subtitulo">NOTA DE VENTA</p>
      <p>San Miguel de Allende, Guanajuato</p>
      <p>contacto@transportesmx.org</p>
      <div class="folio">Folio: ${seguro(f)}</div>
    </div>
  </header>
  <img class="sprinter" src="/sprinter.png" alt="Vehículo de Transportes MX">
  <table>
    ${filas.map(([etiqueta, valor]) =>
      `<tr><td>${seguro(etiqueta)}</td><td>${seguro(valor || "")}</td></tr>`
    ).join("")}
  </table>
  <div class="total">TOTAL: ${moneda(d.importe)}</div>
  <div class="obs"><b>Observaciones:</b><br>${seguro(d.observaciones).replace(/\n/g, "<br>")}</div>
  <footer class="pie">
    Transportes MX · San Miguel de Allende, Guanajuato<br>
    Documento generado: ${new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Mexico_City",
    }).format(new Date())}<br>
    https://transportesmx.org
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
    return <main className="min-h-screen bg-black p-8 text-white">Cargando...</main>;
  }

  if (!sesion) {
    return (
      <main className="min-h-screen bg-black p-5 text-white sm:p-10">
        <form onSubmit={iniciarSesion} className="mx-auto mt-10 max-w-md rounded-2xl border border-gray-700 bg-gray-950 p-6">
          <h1 className="text-3xl font-bold text-yellow-400">Transportes MX</h1>
          <p className="mt-2 text-gray-300">Sistema de notas de venta</p>

          <label className="mt-6 block text-sm">Correo electrónico</label>
          <input type="email" required value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-3" />

          <label className="mt-4 block text-sm">Contraseña</label>
          <input type="password" required value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-3" />

          <button className="mt-5 w-full rounded-lg bg-yellow-500 p-3 font-bold text-black">
            Entrar
          </button>
          {mensaje && <p role="alert" className="mt-4 text-red-400">{mensaje}</p>}
        </form>
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
        <p className="mt-3">Esta cuenta no tiene permisos para las notas de venta.</p>
        <button onClick={cerrarSesion} className="mt-5 rounded border p-3">Cerrar sesión</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Transportes MX" className="h-14 w-24 rounded bg-white object-contain p-1" />
            <div>
              <h1 className="text-2xl font-bold text-yellow-400 sm:text-3xl">Transportes MX</h1>
              <p className="text-slate-300">Nota de venta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">{admin1 ? "Administrador 1" : "Administrador 2"}</span>
            <button onClick={cerrarSesion} className="rounded-lg border border-slate-600 px-3 py-2 text-sm">
              Cerrar sesión
            </button>
          </div>
        </header>

        {mensaje && (
          <p role="status" className="my-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm">
            {mensaje}
          </p>
        )}

        <div className="grid items-start gap-5 py-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">
                {editando ? `Editar ${editando.folio}` : "Nueva nota de venta"}
              </h2>
              <button type="button" onClick={nuevaNota} className="rounded-lg border border-slate-600 px-3 py-2 text-sm">
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
                      required={["cliente", "servicio", "importe"].includes(campo)}
                      min={tipo === "number" ? "0" : undefined}
                      step={campo === "importe" ? "0.01" : undefined}
                      value={datos[campo]}
                      onChange={(e) => cambiar(campo, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white outline-none focus:border-yellow-400"
                    />
                  </label>
                ))}
              </div>

              <label className="block text-sm">
                Observaciones
                <textarea
                  value={datos.observaciones}
                  onChange={(e) => cambiar("observaciones", e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white outline-none focus:border-yellow-400"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button disabled={guardando}
                  className="rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black disabled:opacity-50">
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar nota"}
                </button>
                <button type="button" onClick={() => imprimir()}
                  className="rounded-lg border border-slate-500 px-4 py-3">
                  Vista previa / PDF
                </button>
                {editando && (
                  <button type="button" onClick={nuevaNota}
                    className="rounded-lg border border-slate-500 px-4 py-3">
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>

            <div className="mt-7 border-t border-slate-700 pt-5">
              <h3 className="mb-3 text-lg font-semibold">Historial de notas</h3>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por folio, cliente o servicio..."
                className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white"
              />

              {notasFiltradas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay notas que coincidan con la búsqueda.</p>
              ) : (
                <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {notasFiltradas.map((nota) => (
                    <article key={nota.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-yellow-400">{nota.folio}</p>
                          <p className="break-words">{nota.datos?.cliente || "Sin cliente"}</p>
                          <p className="break-words text-sm text-slate-400">{nota.datos?.servicio || ""}</p>
                          <p className="mt-1 font-semibold text-green-400">{moneda(nota.datos?.importe)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => imprimir(nota)} className="rounded border border-slate-600 px-3 py-2 text-sm">
                            PDF
                          </button>
                          <button onClick={() => editar(nota)} className="rounded border border-slate-600 px-3 py-2 text-sm">
                            Editar
                          </button>
                          {admin1 && (
                            <button onClick={() => eliminar(nota)}
                              className="rounded border border-red-800 px-3 py-2 text-sm text-red-300">
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
              <h2 className="font-semibold text-slate-800">Vista previa</h2>
              <button onClick={() => imprimir()}
                className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-bold">
                Imprimir / PDF
              </button>
            </div>

            <article className="mx-auto min-h-[650px] max-w-[650px] bg-white p-5 shadow-xl sm:p-8">
              <header className="flex items-center gap-4 border-b-2 border-black pb-4">
                <img src="/logo.jpg" alt="Logo Transportes MX" className="w-28 object-contain sm:w-36" />
                <div className="min-w-0">
                  <h3 className="text-xl font-bold sm:text-2xl">TRANSPORTES MX</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">NOTA DE VENTA</p>
                  <p className="mt-1 break-words text-xs text-slate-500">San Miguel de Allende, Guanajuato</p>
                  <p className="break-words text-xs text-slate-500">contacto@transportesmx.org</p>
                  <p className="mt-2 font-bold text-yellow-700">Folio: {folio || (editando?.folio || "Se asigna al guardar")}</p>
                </div>
              </header>

              <div className="flex h-24 items-center justify-center border-b border-slate-300">
                <img src="/sprinter.png" alt="Vehículo de Transportes MX" className="max-h-20 max-w-full object-contain" />
              </div>

              <div className="mt-4 space-y-0 text-sm">
                {[
                  ["Cliente", datos.cliente],
                  ["Teléfono", datos.telefono],
                  ["Correo electrónico", datos.email],
                  ["Servicio", datos.servicio],
                  ["Fecha", fechaLarga(datos.fecha)],
                  ["Hora", horaBonita(datos.hora)],
                  ["Origen", datos.origen],
                  ["Destino", datos.destino],
                  ["Unidad / vehículo", datos.unidad],
                  ["Pasajeros", datos.pasajeros],
                ].map(([etiqueta, valor]) => (
                  <div key={etiqueta} className="grid grid-cols-[36%_64%] border-b border-slate-200 py-2">
                    <strong className="pr-2">{etiqueta}</strong>
                    <span className="break-words">{valor || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 text-right text-xl font-bold text-green-700">
                TOTAL: {moneda(datos.importe)}
              </div>

              <div className="mt-5 min-h-20 rounded-2xl border border-slate-400 p-4 text-sm">
                <strong>Observaciones:</strong>
                <p className="mt-2 whitespace-pre-wrap break-words">{datos.observaciones || "—"}</p>
              </div>

              <footer className="mt-7 border-t-2 border-black pt-3 text-center text-[10px] text-slate-500">
                <p>Transportes MX · San Miguel de Allende, Guanajuato</p>
                <p>https://transportesmx.org · contacto@transportesmx.org</p>
              </footer>
            </article>
            <p className="mx-auto mt-3 max-w-[650px] text-xs text-slate-600">
              La vista previa muestra los datos capturados. Para imprimir o guardar el PDF, utiliza el botón superior.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

