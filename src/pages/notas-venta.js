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
        setDatos({ ...inicial });
        setEditando(null);
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
