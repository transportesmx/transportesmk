
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN1 = "amstrekgrt@gmail.com";
const ADMIN2 = "and-i89@hotmail.com";

const initial = {
  cliente: "",
  telefono: "",
  correo: "",
  vehiculo: "",
  nombreCliente: "",
  fecha: "",
  hora: "",
  recoger: "",
  aerolinea: "",
  pasajeros: "",
  maletas: "",
  telefonoServicio: "",
  destino: "",
  idaVuelta: "",
  duracion: "",
  regresoFecha: "",
  regresoHora: "",
  observaciones: "",
};

const fields = [
  ["cliente", "Cliente", "text"],
  ["telefono", "Teléfono", "tel"],
  ["correo", "Correo electrónico", "email"],
  ["vehiculo", "🚗 Vehículo", "text"],
  ["nombreCliente", "👤 Nombre del cliente", "text"],
  ["fecha", "📆 Fecha", "date"],
  ["hora", "🕒 Hora", "time"],
  ["recoger", "📍 Recoger en", "text"],
  ["aerolinea", "✈️ Aerolínea", "text"],
  ["pasajeros", "👥 Número de pasajeros", "number"],
  ["maletas", "🧳 Número de maletas", "number"],
  ["telefonoServicio", "📞 Número de teléfono", "tel"],
  ["destino", "📍 Destino", "text"],
  ["idaVuelta", "🔄 Ida y vuelta", "text"],
  ["duracion", "⏰ Duración", "text"],
];

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  }).format(new Date(`${value}T12:00:00`));
}

function formatTime(value) {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function currentStamp() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  }).format(now);

  const time = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Mexico_City",
  })
    .format(now)
    .replace(/\./g, "")
    .toLowerCase();

  return `${date} / ${time}`;
}

export default function HojaServicio() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(initial);
  const [stamp, setStamp] = useState("");
  const [message, setMessage] = useState("");

  const authorized = [ADMIN1, ADMIN2].includes(
    session?.user?.email?.toLowerCase()
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setMessage("No está configurada la conexión con Supabase.");
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data: sessionData, error }) => {
      if (!active) return;
      if (error) setMessage("No se pudo comprobar la sesión.");
      setSession(sessionData?.session || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const regreso = useMemo(() => {
    const date = formatDate(data.regresoFecha);
    const time = formatTime(data.regresoHora);

    if (!date && !time) return "";
    return `↩️ Regreso: ${date}${date && time ? " / " : ""}${time}`;
  }, [data.regresoFecha, data.regresoHora]);

  async function login(event) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("No está configurada la conexión con Supabase.");
      return;
    }

    const { data: loginData, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setMessage("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
    } else {
      setSession(loginData.session);
      setPassword("");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setData(initial);
    setStamp("");
  }

  function update(key, value) {
    setData((previous) => ({ ...previous, [key]: value }));
  }

  function printSheet() {
    setStamp(currentStamp());
    window.setTimeout(() => window.print(), 300);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Cargando...
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black p-5 text-white">
        <form
          onSubmit={login}
          className="mx-auto mt-12 max-w-md rounded-xl border border-gray-700 bg-gray-950 p-6"
        >
          <h1 className="text-2xl font-bold text-yellow-400">
            Transportes MX
          </h1>
          <p className="my-2">Hoja de Servicio</p>

          <label className="block py-2">
            Correo electrónico
            <input
              className="mt-1 w-full rounded border border-gray-600 bg-black p-3"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block py-2">
            Contraseña
            <input
              className="mt-1 w-full rounded border border-gray-600 bg-black p-3"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button className="mt-3 w-full rounded bg-yellow-500 p-3 font-bold text-black">
            Entrar
          </button>

          {message && <p className="mt-3 text-red-300">{message}</p>}
        </form>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-2xl">Acceso no autorizado</h1>
        <button onClick={logout} className="mt-4 rounded border p-2">
          Cerrar sesión
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              Hoja de Servicio oficial
            </h1>
            <p className="text-sm text-gray-300">
              La vista previa se actualiza al capturar los datos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={printSheet}
              className="rounded bg-yellow-500 px-4 py-2 font-bold text-black"
            >
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={logout}
              className="rounded border border-gray-600 px-3 py-2"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {message && (
          <p role="status" className="no-print mb-3 rounded bg-gray-900 p-3">
            {message}
          </p>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section className="no-print rounded-xl border border-gray-700 bg-gray-950 p-4">
            <h2 className="mb-3 text-lg font-semibold">Datos editables</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {fields.map(([key, label, type]) => (
                <label key={key} className="block text-sm">
                  {label}
                  <input
                    type={type}
                    min={type === "number" ? "0" : undefined}
                    value={data[key]}
                    onChange={(event) => update(key, event.target.value)}
                    className="mt-1 w-full rounded border border-gray-600 bg-black p-2.5 text-white"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-700 pt-4">
              <h3 className="mb-2 font-semibold">Regreso</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  📅 Fecha
                  <input
                    type="date"
                    value={data.regresoFecha}
                    onChange={(event) =>
                      update("regresoFecha", event.target.value)
                    }
                    className="mt-1 w-full rounded border border-gray-600 bg-black p-2 text-white"
                  />
                </label>

                <label className="text-sm">
                  🕒 Hora
                  <input
                    type="time"
                    value={data.regresoHora}
                    onChange={(event) =>
                      update("regresoHora", event.target.value)
                    }
                    className="mt-1 w-full rounded border border-gray-600 bg-black p-2 text-white"
                  />
                </label>
              </div>
            </div>

            <label className="mt-4 block text-sm">
              Observaciones
              <textarea
                rows={3}
                value={data.observaciones}
                onChange={(event) =>
                  update("observaciones", event.target.value)
                }
                className="mt-1 w-full rounded border border-gray-600 bg-black p-3 text-white"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setData(initial);
                setStamp("");
                setMessage("Formulario limpio.");
              }}
              className="mt-3 rounded border border-gray-600 px-4 py-2"
            >
              Limpiar formulario
            </button>
          </section>

          <section className="preview-wrap overflow-x-auto rounded-xl bg-gray-200 p-2 sm:p-4">
            <article className="service-sheet mx-auto bg-white text-black">
              <header className="company">
                <img src="/logo.jpg" alt="Logotipo TMX" className="logo" />

                <div className="company-data">
                  <strong>Grupo Turístico MX S. de R.L. de C.V.</strong>
                  <span>RFC: GTM2604271F2</span>
                  <span>San Miguel de Allende, Guanajuato</span>
                  <span>contacto@transportesmx.org</span>
                  <span>Sitio web: https://transportesmx.org</span>
                </div>
              </header>

              <div className="sprinter-band">
                <img src="/sprinter.png" alt="Mercedes-Benz Sprinter negra" />
              </div>

              <div className="client-lines">
                <p><b>Cliente:</b> {data.cliente}</p>
                <p><b>Teléfono:</b> {data.telefono}</p>
                <p><b>Correo:</b> {data.correo}</p>
              </div>

              <div className="fields-preview">
                <p>🚗 Vehículo: <span>{data.vehiculo}</span></p>
                <p>👤 Nombre del cliente: <span>{data.nombreCliente}</span></p>
                <p>
                  📆 Fecha y hora:{" "}
                  <span>
                    {formatDate(data.fecha)}
                    {data.hora ? ` / ${formatTime(data.hora)}` : ""}
                  </span>
                </p>
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

              <div className="observaciones">
                <span>Observaciones:</span>
                <p>{data.observaciones}</p>
              </div>

              <footer className="sheet-footer">
                <div className="footer-rule" />
                <p>
                  San Miguel de Allende, Guanajuato / Documento generado:{" "}
                  {stamp || currentStamp()}
                </p>
                <p>Grupo Turístico MX S. de R.L. de C.V.</p>
              </footer>
            </article>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .service-sheet {
          width: 215.9mm;
          height: 279.4mm;
          min-height: 279.4mm;
          box-sizing: border-box;
          padding: 8mm 10mm 6mm;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
          font-size: 10pt;
          box-shadow: 0 2px 12px #0002;
          overflow: hidden;
        }

        .company {
          display: flex;
          align-items: center;
          gap: 8mm;
          min-height: 24mm;
          border-bottom: 2px solid #111;
          padding-bottom: 3mm;
          flex-shrink: 0;
        }

        .logo {
          width: 48mm;
          max-height: 22mm;
          object-fit: contain;
        }

        .company-data {
          display: flex;
          flex-direction: column;
          gap: 1mm;
          font-size: 8pt;
          color: #4c4c4c;
        }

        .company-data strong {
          font-size: 9pt;
          color: #222;
        }

        .sprinter-band {
          height: 36mm;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #bbb;
          overflow: hidden;
        }

        .sprinter-band img {
          max-width: 100%;
          max-height: 34mm;
          object-fit: contain;
        }

        .client-lines {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 8mm;
          margin-top: 3mm;
          font-size: 9pt;
          flex-shrink: 0;
        }

        .client-lines p {
          margin: 0 0 2mm;
          overflow-wrap: anywhere;
        }

        .client-lines p:first-child {
          grid-column: 1 / -1;
        }

        .fields-preview {
          margin-top: 2mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 8mm;
          row-gap: 1.5mm;
          font-size: 9pt;
          flex-shrink: 0;
        }

        .fields-preview p {
          margin: 0;
          min-height: 5mm;
          overflow-wrap: anywhere;
        }

        .regreso {
          margin-top: 12mm;
          font-weight: bold;
          font-size: 10pt;
          min-height: 6mm;
          flex-shrink: 0;
        }

        .observaciones {
          margin-top: auto;
          min-height: 19mm;
          max-height: 30mm;
          border: 1.3px solid #333;
          border-radius: 999px;
          padding: 4mm 7mm;
          overflow: hidden;
          overflow-wrap: anywhere;
          font-size: 9pt;
          flex-shrink: 0;
        }

        .observaciones span {
          font-weight: bold;
        }

        .observaciones p {
          margin: 1mm 0 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .sheet-footer {
          margin-top: 5mm;
          text-align: center;
          color: #777;
          font-size: 7pt;
          line-height: 1.4;
          flex-shrink: 0;
        }

        .footer-rule {
          height: 1.2mm;
          background: #111;
          margin-bottom: 3mm;
        }

        .sheet-footer p {
          margin: 0;
        }

        @page {
          size: Letter;
          margin: 0;
        }

        @media screen and (max-width: 850px) {
          .service-sheet {
            width: 215.9mm;
            height: 279.4mm;
          }

          .preview-wrap {
            overflow-x: auto;
          }
        }

        @media print {
          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .preview-wrap,
          .preview-wrap * {
            visibility: visible;
          }

          .preview-wrap {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
            overflow: visible !important;
          }

          .service-sheet {
            width: 215.9mm !important;
            height: 279.4mm !important;
            min-height: 279.4mm !important;
            padding: 8mm 10mm 6mm !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
