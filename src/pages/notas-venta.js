
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

export default function NotasVenta() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState(null);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setError("Falta configurar la conexión con Supabase.");
      setCargando(false);
      return;
    }

    let activo = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!activo) return;
      if (error) setError(error.message);
      setSesion(data?.session ?? null);
      setCargando(false);
    });

    const { data } = supabase.auth.onAuthStateChange(
      (_evento, nuevaSesion) => {
        setSesion(nuevaSesion);
      }
    );

    return () => {
      activo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function iniciarSesion(e) {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("No está disponible la conexión con Supabase.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });

    if (error) {
      setError("No se pudo iniciar sesión. Revisa tus datos.");
      return;
    }

    setSesion(data.session);
    setContrasena("");
  }

  async function cerrarSesion() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSesion(null);
    router.replace("/notas-venta");
  }

  if (cargando) {
    return <main className="min-h-screen bg-black text-white p-8">Cargando...</main>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-5 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-yellow-400">
          Transportes MX
        </h1>
        <p className="mt-2 text-gray-300">Sistema de notas de venta</p>

        {!sesion ? (
          <form
            onSubmit={iniciarSesion}
            className="mt-8 max-w-md rounded-xl border border-gray-700 bg-gray-950 p-6"
          >
            <h2 className="mb-5 text-xl font-semibold">Iniciar sesión</h2>

            <label className="mb-2 block" htmlFor="correo">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="username"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-600 bg-black p-3 text-white"
            />

            <label className="mb-2 block" htmlFor="contrasena">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="mb-5 w-full rounded-lg border border-gray-600 bg-black p-3 text-white"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-yellow-500 p-3 font-bold text-black hover:bg-yellow-400"
            >
              Entrar
            </button>

            {error && (
              <p role="alert" className="mt-4 text-red-400">
                {error}
              </p>
            )}
          </form>
        ) : (
          <section className="mt-8 rounded-xl border border-gray-700 bg-gray-950 p-6">
            <p>Sesión iniciada: {sesion.user.email}</p>
            <p className="mt-3 text-gray-300">
              La conexión inicial está lista. El siguiente paso será configurar
              los permisos y las funciones de las notas de venta.
            </p>
            <button
              onClick={cerrarSesion}
              className="mt-6 rounded-lg border border-gray-500 px-4 py-2 hover:bg-gray-800"
            >
              Cerrar sesión
            </button>
            {error && <p className="mt-4 text-red-400">{error}</p>}
          </section>
        )}
      </div>
    </main>
  );
}

