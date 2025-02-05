import { useState, useEffect, Fragment } from "react";
import About from "@/components/About";
import Aeropuerto from "@/components/Aeropuerto";
import Boda from "@/components/Bodas";
import Chofer from "@/components/Chofer";
import Ejecutivo from "@/components/Ejecutivo";
import Faqs from "@/components/Faqs";
import Galeria from "@/components/Galeria";
import Hero from "@/components/Hero";
import Testimonios from "@/components/Testimonios";
import Tours from "@/components/Tours";
import BodasModal from "@/components/BodasModal"; // Asegúrate de importar el componente del modal
import Head from "next/head";


export default function Home() {
  const [isBodasModalVisible, setIsBodasModalVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBodasModalVisible(true);
    }, 5000); // 5000 ms = 5 segundos

    return () => clearTimeout(timer); // Limpiar el timeout si el componente se desmonta
  }, []);

  return (
    <Fragment>
       <Head>
      <meta name="theme-color" content="#000000" />
      <title>Transportes MX - Traslados Seguros y Confiables</title>
      <meta
        name="description"
        content="Transportes MX ofrece traslados seguros y cómodos en San Miguel de Allende, Querétaro, Guanajuato y más. Transporte ejecutivo, traslados a aeropuertos, chofer privado y tours exclusivos. Reserva con nosotros y viaja con comodidad y seguridad."
      />
      <meta
        name="keywords"
        content="Transporte, Traslados, Aeropuerto, Bodas, Chofer Privado, Ejecutivo, Tours, San Miguel de Allende, Guanajuato, Querétaro, Viajes, Rentas, Transporte Premium, Transportes MX"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content="Transportes MX - Traslados Seguros y Confiables" />
      <meta
        property="og:description"
        content="Viaja con seguridad y comodidad con Transportes MX. Servicios de traslado a aeropuertos, bodas, ejecutivos, chofer privado y tours en San Miguel de Allende, Querétaro y Guanajuato."
      />
      <meta property="og:image" content="/assets/images/ogimage.jpg" />
      <meta property="og:url" content="https://www.transportesmx.com" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Transportes MX - Traslados Seguros y Confiables" />
      <meta
        name="twitter:description"
        content="Reserva tu transporte con Transportes MX y viaja seguro. Servicios de chofer privado, aeropuertos, bodas y tours."
      />
      <meta name="twitter:image" content="/assets/images/ogimage.jpg" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
      <Hero />
      <About />
      <Aeropuerto />
      <Boda />
      <Chofer />
      <Ejecutivo />
      <Tours />
      <Testimonios />
      <Galeria />
      <Faqs />
      {isBodasModalVisible && <BodasModal />} {/* Renderizar el modal condicionalmente */}
    </Fragment>
  );
}