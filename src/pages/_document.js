import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Transportes MX" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Transportes MX ofrece traslados seguros y cómodos en San Miguel de Allende, Querétaro, Guanajuato y más. Transporte ejecutivo, traslados a aeropuertos, chofer privado y tours exclusivos."
        />
        <meta
          name="keywords"
          content="Transporte, Traslados, Aeropuerto, Bodas, Chofer Privado, Ejecutivo, Tours, San Miguel de Allende, Guanajuato, Querétaro, Viajes, Transporte Premium, Transportes MX"
        />
        <link rel="canonical" href="https://www.transportesmx.org/" />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:site_name" content="Transportes MX" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.transportesmx.org/" />
        <meta property="og:title" content="Transportes MX - Traslados Seguros y Confiables" />
        <meta
          property="og:description"
          content="Viaja con seguridad y comodidad con Transportes MX. Servicios de traslado a aeropuertos, bodas, ejecutivos, chofer privado y tours en San Miguel de Allende, Querétaro y Guanajuato."
        />
        <meta property="og:image" content="https://www.transportesmx.org/ogimage.jpg" />
        <meta property="og:image:secure_url" content="https://www.transportesmx.org/ogimage.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Transportes MX - Traslados ejecutivos en San Miguel de Allende" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Transportes MX - Traslados Seguros y Confiables" />
        <meta
          name="twitter:description"
          content="Reserva tu transporte con Transportes MX y viaja seguro. Servicios de chofer privado, aeropuertos, bodas y tours."
        />
        <meta name="twitter:image" content="https://www.transportesmx.org/ogimage.jpg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/ogimage.jpg" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
