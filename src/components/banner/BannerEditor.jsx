
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./BannerEditor.module.css";

const DEFAULT_CONFIG = {
  name: "GERARDO SAINZ",
  theme: "dark",
  fontSize: 52,
  vehicleScale: 100,
  speed: 12,
  fontFamily: "Arial, Helvetica, sans-serif",
};

function useWakeLock(enabled) {
  useEffect(() => {
    if (
      !enabled ||
      typeof navigator === "undefined" ||
      !("wakeLock" in navigator)
    ) {
      return;
    }

    let lock;
    let active = true;

    const request = async () => {
      try {
        if (active && document.visibilityState === "visible") {
          lock = await navigator.wakeLock.request("screen");
        }
      } catch (_) {}
    };

    request();

    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
      if (lock) lock.release().catch(() => {});
    };
  }, [enabled]);
}

export function BannerStage({
  config = DEFAULT_CONFIG,
  fullscreen = false,
}) {
  const dark = config.theme !== "light";
  const stageRef = useRef(null);

  useWakeLock(fullscreen);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await stageRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (_) {}
  }, []);

  const fontSize = Math.max(
    20,
    Math.min(180, Number(config.fontSize) || 52)
  );

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${
        dark ? styles.dark : styles.light
      } ${fullscreen ? styles.fullscreenStage : ""}`}
    >
      <img
        className={styles.logo}
        src={
          dark
            ? "/banner/logo-mx-white.png"
            : "/banner/logo-mx-black.png"
        }
        alt="Transportes MX"
      />

      <div className={styles.namePlate}>
        <div
          className={styles.customerName}
          style={{
            "--name-size": `${fontSize}px`,
            fontFamily:
              config.fontFamily || DEFAULT_CONFIG.fontFamily,
          }}
        >
          {config.name || " "}
        </div>
      </div>

      <div className={styles.road} aria-hidden="true">
        <div className={styles.lightTrail} />

        <div
          className={styles.vehicle}
          style={{
            "--vehicle-scale":
              Number(config.vehicleScale || 100) / 100,
            "--vehicle-speed": `${Math.max(
              5,
              Number(config.speed || 12)
            )}s`,
          }}
        >
          <img
            className={styles.vehicleImage}
            src={
              dark
                ? "/banner/suburban-white.png"
                : "/banner/suburban-black.png"
            }
            alt=""
          />
        </div>
      </div>

      {!fullscreen && (
        <button
          type="button"
          className={styles.fullscreenButton}
          onClick={toggleFullscreen}
        >
          Mostrar en pantalla completa
        </button>
      )}
    </div>
  );
}

export default function BannerEditor() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [status, setStatus] = useState(
    "Cargando configuración…"
  );
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("display") === "1") {
      setFullscreen(true);

      fetch("/api/banner/config")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.config) {
            setConfig({
              ...DEFAULT_CONFIG,
              ...data.config,
            });
          } else {
            try {
              const local = localStorage.getItem(
                "tmx-banner-config"
              );

              if (local) {
                setConfig({
                  ...DEFAULT_CONFIG,
                  ...JSON.parse(local),
                });
              }
            } catch (_) {}
          }
        })
        .catch(() => {});

      return;
    }

    fetch("/api/banner/session")
      .then((r) => r.json())
      .then((data) => {
        setAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !authenticated) return;

    if (
      new URLSearchParams(window.location.search).get("display") === "1"
    ) {
      return;
    }

    fetch("/api/banner/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.config) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data.config,
          });
        } else {
          try {
            const local = localStorage.getItem(
              "tmx-banner-config"
            );

            if (local) {
              setConfig({
                ...DEFAULT_CONFIG,
                ...JSON.parse(local),
              });
            }
          } catch (_) {}
        }

        setStatus("Puedes editar y guardar los cambios.");
      })
      .catch(() => {
        setStatus(
          "Modo local: los cambios se guardarán en este dispositivo."
        );
      });
  }, [authenticated]);

  const login = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const r = await fetch("/api/banner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(
          data.error || "No se pudo iniciar sesión."
        );
      }

      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err.message || "Error de conexión.");
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");

    try {
      localStorage.setItem(
        "tmx-banner-config",
        JSON.stringify(config)
      );

      const r = await fetch("/api/banner/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (r.status === 503) {
        setStatus(
          "Guardado local en este dispositivo. Para sincronizar entre dispositivos, configura el almacenamiento KV."
        );
      } else if (!r.ok) {
        const data = await r.json().catch(() => ({}));

        if (r.status === 401) {
          setAuthenticated(false);
          throw new Error(
            "La sesión venció. Inicia sesión nuevamente."
          );
        }

        throw new Error(
          data.error || "No se pudo guardar en el servidor."
        );
      } else {
        setStatus(
          "Configuración guardada y disponible en otros dispositivos."
        );
      }
    } catch (err) {
      setError(err.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/banner/logout", {
      method: "POST",
    }).catch(() => {});

    setAuthenticated(false);
    setPassword("");
    setError("");
  };

  if (
    fullscreen ||
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("display") === "1")
  ) {
    return <BannerStage config={config} fullscreen />;
  }

  if (!authenticated) {
    return (
      <main className={styles.loginPage}>
        <form className={styles.loginCard} onSubmit={login}>
          <img
            src="/banner/logo-mx-white.png"
            alt="Transportes MX"
          />

          <h1>Acceso al banner</h1>
          <p>Ingresa con el correo y la contraseña asignados.</p>

          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit">Iniciar sesión</button>
        </form>
      </main>
    );
  }

  return (
    <main className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div>
          <h1>Banner Transportes MX</h1>
          <p>Editor de nombre, tema, tamaño y animación</p>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </header>

      <section className={styles.controls}>
        <label>
          Nombre del cliente
          <input
            maxLength={60}
            value={config.name}
            onChange={(e) =>
              setConfig({ ...config, name: e.target.value })
            }
          />
        </label>

        <label>
          Tema
          <select
            value={config.theme}
            onChange={(e) =>
              setConfig({ ...config, theme: e.target.value })
            }
          >
            <option value="dark">
              Fondo negro · Suburban y letras blancas
            </option>
            <option value="light">
              Fondo blanco · Suburban y letras negras
            </option>
          </select>
        </label>

        <label>
          Tamaño de letra: {config.fontSize}px
          <input
            type="range"
            min="20"
            max="180"
            value={config.fontSize}
            onChange={(e) =>
              setConfig({
                ...config,
                fontSize: Number(e.target.value),
              })
            }
          />
        </label>

        <label>
          Tamaño de camioneta: {config.vehicleScale}%
          <input
            type="range"
            min="10"
            max="140"
            value={config.vehicleScale}
            onChange={(e) =>
              setConfig({
                ...config,
                vehicleScale: Number(e.target.value),
              })
            }
          />
        </label>

        <label>
          Velocidad de recorrido: {config.speed}s
          <input
            type="range"
            min="5"
            max="20"
            value={config.speed}
            onChange={(e) =>
              setConfig({
                ...config,
                speed: Number(e.target.value),
              })
            }
          />
        </label>

        <label>
          Tipografía
          <select
            value={config.fontFamily}
            onChange={(e) =>
              setConfig({
                ...config,
                fontFamily: e.target.value,
              })
            }
          >
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Helvetica, Arial, sans-serif">Helvetica</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar configuración"}
          </button>

          <a
            className={styles.secondaryButton}
            href="/banner?display=1"
            target="_blank"
            rel="noreferrer"
          >
            Abrir pantalla de presentación
          </a>
        </div>

        <p className={styles.status}>{status}</p>
      </section>

      <h2>Vista previa</h2>
      <BannerStage config={config} />
    </main>
  );
}
