
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./BannerEditor.module.css";

const DEFAULT_CONFIG = {
  name: "GERARDO SAINZ",
  theme: "dark",
  fontSize: 52,
  vehicleScale: 100,
  showVehicle: true,
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
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const isDisplayPage = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("display") === "1";
  const isFullscreen = fullscreen || fallbackFullscreen || nativeFullscreen;

  useWakeLock(isFullscreen);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setNativeFullscreen(active);
      if (!active && !isDisplayPage) setFallbackFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [isDisplayPage]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch (_) {}
      }
      setFallbackFullscreen(false);
      if (isDisplayPage) {
        window.location.href = "/banner";
      }
      return;
    }

    try {
      if (stageRef.current?.requestFullscreen) {
        await stageRef.current.requestFullscreen();
        setNativeFullscreen(true);
        return;
      }
    } catch (_) {}
    // Safari/iPhone and some mobile browsers do not support Element.requestFullscreen.
    // Use a fixed-position full-screen presentation as a compatible fallback.
    setFallbackFullscreen(true);
  }, [isFullscreen, isDisplayPage]);

  const fontSize = Math.max(20, Math.min(180, Number(config.fontSize) || 52));
  const fullscreenStyle = isFullscreen ? {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    minHeight: "100dvh",
    zIndex: 2147483000,
    borderRadius: 0,
    margin: 0,
  } : undefined;

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${dark ? styles.dark : styles.light} ${isFullscreen ? styles.fullscreenStage : ""}`}
      style={fullscreenStyle}
    >
      <img
        className={styles.logo}
        src={dark ? "/banner/logo-mx-white.png" : "/banner/logo-mx-black.png"}
        alt="Transportes MX"
      />

      <div className={styles.namePlate}>
        <div
          className={styles.customerName}
          style={{
            "--name-size": `${fontSize}px`,
            fontFamily: config.fontFamily || DEFAULT_CONFIG.fontFamily,
          }}
        >
          {config.name || " "}
        </div>
      </div>

      {config.showVehicle !== false && (
        <div className={styles.road} aria-hidden="true">
          <div className={styles.lightTrail} />
          <div
            className={styles.vehicle}
            style={{
              // Keep the animated wrapper responsible only for horizontal movement.
              // Scaling the image itself prevents the vehicle from dropping below the banner.
              "--vehicle-scale": 1,
              "--vehicle-speed": `${Math.max(5, Number(config.speed || 12))}s`,
              transformOrigin: "bottom center",
            }}
          >
            <img
              className={styles.vehicleImage}
              src={dark ? "/banner/suburban-white.png" : "/banner/suburban-black.png"}
              alt=""
              style={{
                transform: `scale(${Math.max(0.1, Math.min(1.4, Number(config.vehicleScale || 100) / 100))})`,
                transformOrigin: "bottom center",
                display: "block",
              }}
            />
          </div>
        </div>
      )}

      {isFullscreen ? (
        <button
          type="button"
          className={styles.fullscreenButton}
          onClick={toggleFullscreen}
          aria-label="Salir de pantalla completa"
          title="Salir de pantalla completa"
          style={{
            position: "fixed",
            top: "max(10px, env(safe-area-inset-top))",
            right: "max(10px, env(safe-area-inset-right))",
            zIndex: 2147483647,
            width: 38,
            height: 38,
            minWidth: 38,
            padding: 0,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            lineHeight: 1,
            opacity: 0.72,
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : (
        <button
          type="button"
          className={styles.fullscreenButton}
          onClick={toggleFullscreen}
          aria-label="Mostrar en pantalla completa"
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

        <label
          className={styles.vehicleToggle}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: "14px 16px",
            border: `2px solid ${config.showVehicle !== false ? "#16a34a" : "#9ca3af"}`,
            borderRadius: 12,
            background: config.showVehicle !== false ? "#f0fdf4" : "#f3f4f6",
            color: config.showVehicle !== false ? "#166534" : "#374151",
            fontSize: 17,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                flex: "0 0 34px",
                borderRadius: "50%",
                background: config.showVehicle !== false ? "#16a34a" : "#6b7280",
                color: "white",
                fontSize: 21,
                lineHeight: 1,
              }}
            >
              {config.showVehicle !== false ? "✓" : "×"}
            </span>
            <span>Mostrar camioneta</span>
          </span>
          <span
            style={{
              padding: "7px 12px",
              minWidth: 48,
              textAlign: "center",
              borderRadius: 8,
              background: config.showVehicle !== false ? "#16a34a" : "#6b7280",
              color: "#fff",
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            {config.showVehicle !== false ? "SÍ" : "NO"}
          </span>
          <input
            type="checkbox"
            checked={config.showVehicle !== false}
            onChange={(e) =>
              setConfig({ ...config, showVehicle: e.target.checked })
            }
            aria-label="Mostrar camioneta sí o no"
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
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
