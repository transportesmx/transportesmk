
import React from 'react';

export default function VelaNoviembre() {
  return (
    <div
      className="vela-noviembre"
      role="img"
      aria-label="Vela encendida de noviembre"
    >
      <div className="vela-llama">
        <div className="vela-llama-exterior" />
        <div className="vela-llama-interior" />
      </div>

      <div className="vela-mecha" />

      <div className="vela-cuerpo">
        <div className="vela-borde-superior" />
        <div className="vela-gota-cera" />
        <div className="vela-brillo" />
      </div>

      <style jsx>{`
        .vela-noviembre {
          position: relative;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          width: 32px;
          height: 49px;
          flex-shrink: 0;
          margin: 0 9px;
          vertical-align: middle;
        }

        .vela-llama {
          position: absolute;
          z-index: 3;
          top: 0;
          left: 50%;
          width: 17px;
          height: 24px;
          transform: translateX(-50%);
          transform-origin: 50% 100%;
          animation: flama 0.85s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 5px #ff7900)
            drop-shadow(0 0 9px #ff4d00);
        }

        .vela-llama-exterior {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            #ff3b00 0%,
            #ff8c00 48%,
            #ffdc70 82%,
            #fff5ce 100%
          );
          border-radius: 55% 45% 50% 50% / 70% 70% 30% 30%;
          clip-path: polygon(50% 0, 92% 58%, 82% 83%, 50% 100%, 18% 83%, 8% 58%);
        }

        .vela-llama-interior {
          position: absolute;
          left: 5px;
          bottom: 2px;
          width: 7px;
          height: 13px;
          background: linear-gradient(to top, #fff1a8, #ffffff);
          border-radius: 50% 50% 45% 45%;
          clip-path: polygon(50% 0, 100% 65%, 80% 100%, 20% 100%, 0 65%);
        }

        .vela-mecha {
          position: absolute;
          z-index: 2;
          top: 21px;
          left: 50%;
          width: 3px;
          height: 5px;
          background: #39251a;
          transform: translateX(-50%);
        }

        .vela-cuerpo {
          position: relative;
          width: 18px;
          height: 25px;
          overflow: visible;
          border-radius: 3px 3px 2px 2px;
          background: linear-gradient(
            90deg,
            #bca783 0%,
            #f9e8c3 28%,
            #fff5df 52%,
            #d5bd94 100%
          );
          box-shadow: 0 0 8px #ffbd5940;
        }

        .vela-borde-superior {
          position: absolute;
          top: -2px;
          left: 0;
          width: 18px;
          height: 6px;
          border-radius: 50%;
          background: #fff0cf;
          border-bottom: 1px solid #d5bc92;
        }

        .vela-gota-cera {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 4px;
          height: 8px;
          background: #fff0cf;
          border-radius: 0 0 5px 5px;
        }

        .vela-brillo {
          position: absolute;
          top: 7px;
          left: 4px;
          width: 2px;
          height: 13px;
          background: #ffffff80;
          border-radius: 3px;
        }

        @keyframes flama {
          0% {
            transform: translateX(-50%) rotate(-6deg) scale(0.94);
          }
          35% {
            transform: translateX(-50%) rotate(3deg) scale(1.04);
          }
          70% {
            transform: translateX(-50%) rotate(-3deg) scale(1.08);
          }
          100% {
            transform: translateX(-50%) rotate(6deg) scale(0.98);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vela-llama {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
