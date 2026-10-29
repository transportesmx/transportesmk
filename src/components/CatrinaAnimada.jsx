
import { useEffect, useState } from "react";

export default function CatrinaAnimada({
  size = 70,
  image = "/assets/catrina-3d.png",
  activa = true,
}) {
  const [parpadeando, setParpadeando] = useState(false);
  const [brillo, setBrillo] = useState(false);

  useEffect(() => {
    if (!activa) return;

    let blinkTimer;
    let glowTimer;

    const blink = () => {
      setParpadeando(true);

      setTimeout(() => {
        setParpadeando(false);
      }, 180);

      blinkTimer = setTimeout(blink, 2400 + Math.random() * 2400);
    };

    const glow = () => {
      setBrillo(true);

      setTimeout(() => {
        setBrillo(false);
      }, 900);

      glowTimer = setTimeout(glow, 3200 + Math.random() * 2500);
    };

    blinkTimer = setTimeout(blink, 1200);
    glowTimer = setTimeout(glow, 1800);

    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(glowTimer);
    };
  }, [activa]);

  return (
    <span
      className="catrina-animada"
      aria-label="Catrina de Día de Muertos"
      role="img"
      style={{
        "--catrina-size": `${size}px`,
        "--catrina-glow": brillo ? "1" : "0",
      }}
    >
      <img
        src={image}
        alt=""
        draggable="false"
        className={`catrina-imagen ${
          parpadeando ? "catrina-parpadeo" : ""
        }`}
      />

      <style jsx>{`
        .catrina-animada {
          display: inline-flex;
          position: relative;
          width: var(--catrina-size);
          height: var(--catrina-size);
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          vertical-align: middle;
          background: transparent;
          overflow: visible;
          isolation: isolate;
        }

        .catrina-imagen {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: transparent;
          border: 0;
          animation: catrina-flotar 3.5s ease-in-out infinite;
          filter: drop-shadow(
            0 0 calc(5px * var(--catrina-glow))
            rgba(255, 155, 30, 0.95)
          );
          transition: filter 0.4s ease;
          user-select: none;
          -webkit-user-drag: none;
        }

        .catrina-parpadeo {
          animation:
            catrina-flotar 3.5s ease-in-out infinite,
            catrina-cerrar-ojos 0.18s ease-in-out;
        }

        @keyframes catrina-flotar {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-3px) rotate(2deg);
          }
        }

        @keyframes catrina-cerrar-ojos {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.78;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .catrina-imagen,
          .catrina-parpadeo {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
}
