
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

  const admin1 = sesion?.user?.email?.toLowerCase() === ADMIN1;
  const autorizado = admin1 ||
    sesion?.user?.email?.toLowerCase() === ADMIN2;

  useEffect(() => {
    if (!supabase) {
      setMensaje("No está configurada la conexión con Supabase.");
      setCargando(false);
      return;
    }

    let activo = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!activo) return;
      if (error) setMensaje(error.message);
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
    setDatos(inicial);
    setFolio("");
  }

  function cambiar(campo, valor) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    if (!supabase || !autorizado) return;
    setGuardando(true);
    setMensaje("");

    const payload = { ...datos, importe: Number(datos.importe || 0) };

    if (editando) {
      const { error } = await supabase.rpc("editar_nota_venta", {
        p_id: editando.id,
        p_datos: payload,
      });

      if (error) {
        setMensaje("No se pudo editar la nota: " + error.message);
      } else {
        setMensaje("Nota actualizada correctamente.");
        setDatos(inicial);
        setEditando(null);
        await cargarNotas();
      }
    } else {
      const { data, error } = await supabase.rpc("crear_nota_venta", {
        p_datos: payload,
      });

      if (error) {
        setMensaje("No se pudo guardar la nota: " + error.message);
      } else {
        const nueva = Array.isArray(data) ? data[0] : data;
        setFolio(nueva?.folio || "");
        setMensaje(`Nota guardada con folio ${nueva?.folio || ""}.`);
        setDatos(inicial);
        await cargarNotas();
      }
    }

    setGuardando(false);
  }

  function editar(nota) {
    setEditando(nota);
    setDatos({ ...inicial, ...nota.datos });
    setFolio(nota.folio);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(nota) {
    if (!admin1) {
      setMensaje("Solo el Administrador 1 puede eliminar notas.");
      return;
    }
    if (!window.confirm(`¿Eliminar la nota ${nota.folio}?`)) return;

    const { error } = await supabase.rpc("eliminar_nota_venta", {
      p_id: nota.id,
    });

    if (error) {
      setMensaje("No se pudo eliminar: " + error.message);
    } else {
      setMensaje(`La nota ${nota.folio} fue eliminada.`);
      await cargarNotas();
    }
  }

  function imprimir(nota = null) {
    const d = nota?.datos || datos;
    const f = nota?.folio || folio || "Vista previa";
    const ventana = window.open("", "_blank", "width=850,height=950");
    if (!ventana) {
      setMensaje("Permite las ventanas emergentes para imprimir la nota.");
      return;
    }

    const moneda = Number(d.importe || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

    const seguro = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);

    ventana.document.write(`
      <!doctype html><html lang="es"><head><meta charset="utf-8">
      <title>Nota ${seguro(f)}</title>
      <style>
        body{font-family:Arial,sans-serif;color:#222;margin:28px}
        header{border-bottom:3px solid #c99a16;padding-bottom:16px}
        h1{margin:0;color:#111} .folio{font-size:22px;color:#b58b12;font-weight:bold}
        table{width:100%;border-collapse:collapse;margin-top:24px}
        td{padding:11px;border:1px solid #ddd;vertical-align:top}
        td:first-child{width:30%;font-weight:bold;background:#f6f6f6}
        .total{font-size:20px;font-weight:bold;color:#188038;text-align:right;margin-top:24px}
        .obs{margin-top:20px;border:1px solid #ddd;border-radius:12px;padding:14px}
        @media print{button{display:none}body{margin:12mm}}
      </style></head><body>
      <header><h1>TRANSPORTES MX</h1><p>NOTA DE VENTA</p>
      <div class="folio">${seguro(f)}</div></header>
      <table>
      <tr><td>Cliente</td><td>${seguro(d.cliente)}</td></tr>
      <tr><td>Teléfono</td><td>${seguro(d.telefono)}</td></tr>
      <tr><td>Correo</td><td>${seguro(d.email)}</td></tr>
      <tr><td>Servicio</td><td>${seguro(d.servicio)}</td></tr>
      <tr><td>Fecha y hora</td><td>${seguro(d.fecha)} ${seguro(d.hora)}</td></tr>
      <tr><td>Origen</td><td>${seguro(d.origen)}</td></tr>
      <tr><td>Destino</td><td>${seguro(d.destino)}</td></tr>
      <tr><td>Unidad</td><td>${seguro(d.unidad)}</td></tr>
      <tr><td>Pasajeros</td><td>${seguro(d.pasajeros)}</td></tr>
      </table>
      <div class="total">TOTAL: ${moneda}</div>
      <div class="obs"><b>Observaciones:</b><br>${seguro(d.observaciones)}</div>
      <p style="margin-top:40px;text-align:center;font-size:12px">
      Transportes MX · San Miguel de Allende, Guanajuato</p>
      <button onclick="window.print()">Imprimir / Guardar como PDF</button>
      </body></html>
    `);
    ventana.document.close();
  }

  if (cargando) {
    return <main className="min-h-screen bg-black p-8 text-white">Cargando...</main>;
  }

  if (!sesion) {
    return (
      <main className="min-h-screen bg-black p-5 text-white sm:p-10">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold text-yellow-400">Transportes MX</h1>
          <p className="mt-2">Sistema de notas de venta</p>
          <form onSubmit={iniciarSesion} className="mt-8 rounded-xl border border-gray-700 bg-gray-950 p-6">
            <h2 className="mb-5 text-xl font-semibold">Iniciar sesión</h2>
            <label className="mb-2 block">Correo electrónico</label>
            <input type="email" required value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-600 bg-black p-3" />
            <label className="mb-2 block">Contraseña</label>
            <input type="password" required value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="mb-5 w-full rounded-lg border border-gray-600 bg-black p-3" />
            <button className="w-full rounded-lg bg-yellow-500 p-3 font-bold text-black">
              Entrar
            </button>
            {mensaje && <p role="alert" className="mt-4 text-red-400">{mensaje}</p>}
          </form>
        </div>
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

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-700 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Transportes MX</h1>
            <p className="mt-1 text-gray-300">Notas de venta</p>
          </div>
          <div>
            <p className="text-sm">{admin1 ? "Administrador 1" : "Administrador 2"}</p>
            <button onClick={cerrarSesion} className="mt-2 rounded border border-gray-600 px-3 py-2">
              Cerrar sesión
            </button>
          </div>
        </header>

        {mensaje && <p role="status" className="my-4 rounded bg-gray-900 p-3">{mensaje}</p>}

        <div className="grid gap-6 py-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-700 bg-gray-950 p-5">
            <h2 className="mb-4 text-xl font-semibold">
              {editando ? `Editar ${editando.folio}` : "Nueva nota de venta"}
            </h2>
            {folio && <p className="mb-4 font-bold text-yellow-400">Folio: {folio}</p>}

            <form onSubmit={guardar} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {campos.map(([campo, etiqueta, tipo]) => (
                  <label key={campo} className="block text-sm">
                    {etiqueta}
                    <input type={tipo} required={["cliente","servicio","importe"].includes(campo)}
                      min={tipo === "number" ? "0" : undefined}
                      step={campo === "importe" ? "0.01" : undefined}
                      value={datos[campo]}
                      onChange={(e) => cambiar(campo, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-3 text-white" />
                  </label>
                ))}
              </div>
              <label className="block text-sm">Observaciones
                <textarea value={datos.observaciones}
                  onChange={(e) => cambiar("observaciones", e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-3 text-white" />
              </label>
              <div className="flex flex-wrap gap-3">
                <button disabled={guardando}
                  className="rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black disabled:opacity-50">
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar nota"}
                </button>
                <button type="button" onClick={() => imprimir()}
                  className="rounded-lg border border-gray-500 px-5 py-3">
                  Vista previa / PDF
                </button>
                {editando && <button type="button" onClick={() => {
                  setEditando(null); setDatos(inicial); setFolio("");
                }} className="rounded-lg border border-gray-500 px-4 py-3">Cancelar edición</button>}
              </div>
            </form>
          </section>

          <section className="rounded-xl border border-gray-700 bg-gray-950 p-5">
            <h2 className="mb-4 text-xl font-semibold">Historial de notas</h2>
            {notas.length === 0 ? (
              <p className="text-gray-400">Todavía no hay notas guardadas.</p>
            ) : (
              <div className="space-y-3">
                {notas.map((nota) => (
                  <article key={nota.id} className="rounded-lg border border-gray-700 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-yellow-400">{nota.folio}</p>
                        <p>{nota.datos?.cliente || "Sin cliente"}</p>
                        <p className="text-sm text-gray-400">{nota.datos?.servicio || ""}</p>
                        <p className="mt-1 font-semibold text-green-400">
                          {Number(nota.datos?.importe || 0).toLocaleString("es-MX", {
                            style: "currency", currency: "MXN",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => imprimir(nota)} className="rounded border px-3 py-2 text-sm">PDF</button>
                        <button onClick={() => editar(nota)} className="rounded border px-3 py-2 text-sm">Editar</button>
                        {admin1 && <button onClick={() => eliminar(nota)}
                          className="rounded border border-red-700 px-3 py-2 text-sm text-red-300">Eliminar</button>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
