import React, { useMemo } from 'react';

export default function BannerPasajeros({ nombres, nombre, pasajeros }) {
  const listaNombres = useMemo(() => {
    let datos = nombres ?? nombre ?? pasajeros ?? '';

    if (typeof datos === 'string') {
      datos = datos
        .split(/[,;\n]+/)
        .map((n) => n.trim())
        .filter(Boolean);
    }

    if (!Array.isArray(datos)) datos = [];

    return datos
      .map((n) => {
        if (typeof n === 'string') return n.trim();

        if (typeof n === 'object' && n !== null) {
          return (
            n.nombreCompleto ||
            n.nombre ||
            n.name ||
            `${n.nombreCliente || ''} ${n.apellido || ''}`.trim()
          );
        }

        return '';
      })
      .filter(Boolean);
  }, [nombres, nombre, pasajeros]);

  const textoBanner = listaNombres.join('  •  ').toUpperCase();

  // Ajuste automático del tamaño de letra
  const fontSize = useMemo(() => {
    const longitud = textoBanner.length;

    if (longitud <= 10) return 110;
    if (longitud <= 15) return 90;
    if (longitud <= 20) return 75;
    if (longitud <= 25) return 62;
    if (longitud <= 30) return 52;
    if (longitud <= 40) return 42;
    if (longitud <= 50) return 34;
    if (longitud <= 65) return 28;
    if (longitud <= 80) return 23;
    if (longitud <= 100) return 19;

    return 16;
  }, [textoBanner]);

  return (
    <div className="banner-pasajeros-pagina">
      <style>{`
        .banner-pasajeros-pagina {
          width: 100%;
          aspect-ratio: 11 / 8.5;
          background: #ffffff;
          box-sizing: border-box;
          overflow: hidden;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 4%;
          gap: 5%;

          page-break-before: auto !important;
          break-before: auto !important;
          page-break-after: auto !important;
          break-after: auto !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .banner-pasajeros-logo {
          width: 22%;
          max-width: 220px;
          height: auto;
          object-fit: contain;
          object-position: center;
          flex-shrink: 0;
        }

        .banner-pasajeros-texto {
          width: 100%;
          max-width: 100%;
          text-align: center;

          font-family: Arial, Helvetica, sans-serif;
          font-weight: 900;
          font-style: italic;
          color: #000000;

          text-transform: uppercase;
          line-height: 0.95;
          letter-spacing: -1px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: clip;

          box-sizing: border-box;
          margin: 0;
        }

        @media print {
          @page {
            size: letter landscape;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .banner-pasajeros-pagina {
            width: 11in !important;
            height: 8.5in !important;
            min-height: 0 !important;
            max-height: 8.5in !important;
            aspect-ratio: auto !important;

            padding: 0.35in !important;
            margin: 0 !important;

            overflow: hidden !important;

            page-break-before: auto !important;
            break-before: auto !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .banner-pasajeros-logo {
            width: 1.8in !important;
            max-width: 1.8in !important;
            height: 1.2in !important;
            object-fit: contain !important;
          }

          .banner-pasajeros-texto {
            width: 100% !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: clip !important;
          }
        }
      `}</style>

      <img
        className="banner-pasajeros-logo"
        src="/logo.jpg"
        alt="Transportes MX"
      />

      <div
        className="banner-pasajeros-texto"
        style={{
          fontSize: `${fontSize}pt`,
        }}
      >
        {textoBanner || 'NOMBRE DEL PASAJERO'}
      </div>
    </div>
  );
}
