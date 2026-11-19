import React, { useMemo } from 'react';

export default function BannerPasajeros({ nombres, nombre, pasajeros }) {
  // Obtener nombres desde cualquiera de las propiedades disponibles
  const listaNombres = useMemo(() => {
    let datos = nombres ?? nombre ?? pasajeros ?? '';

    if (typeof datos === 'string') {
      datos = datos
        .split(/[,;\n]+/)
        .map((n) => n.trim())
        .filter(Boolean);
    }

    if (!Array.isArray(datos)) {
      datos = [];
    }

    datos = datos
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

    return datos;
  }, [nombres, nombre, pasajeros]);

  // Unir los nombres para el banner
  const textoBanner = listaNombres.join('  •  ');

  // Ajustar el tamaño de fuente según la longitud de los nombres
  const fontSize = useMemo(() => {
    const longitud = textoBanner.length;

    if (longitud <= 12) return 100;
    if (longitud <= 20) return 80;
    if (longitud <= 30) return 65;
    if (longitud <= 40) return 50;
    if (longitud <= 55) return 40;
    if (longitud <= 70) return 32;
    if (longitud <= 90) return 26;

    return 22;
  }, [textoBanner]);

  return (
    <div className="banner-pasajeros-pagina">
      <style>{`
        .banner-pasajeros-pagina {
          width: 100%;
          min-height: 100vh;
          height: 100vh;
          box-sizing: border-box;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          page-break-before: always;
          break-before: page;
          overflow: hidden;
        }

        .banner-pasajeros-texto {
          width: 100%;
          text-align: center;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 900;
          color: #000000;
          text-transform: uppercase;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          letter-spacing: 1px;
          box-sizing: border-box;
        }

        @media print {
          .banner-pasajeros-pagina {
            width: 100%;
            height: 100vh;
            min-height: 100vh;
            margin: 0;
            padding: 10px;
            page-break-before: always;
            break-before: page;
            page-break-after: auto;
            break-inside: avoid;
            overflow: hidden;
          }

          .banner-pasajeros-texto {
            white-space: nowrap;
            overflow: visible;
          }
        }
      `}</style>

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
