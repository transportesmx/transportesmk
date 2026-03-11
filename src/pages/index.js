import { useState, useEffect, useRef, Fragment, useContext } from "react";
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
import BodasModal from "@/components/BodasModal";
import Autobus from "@/components/Autobus";
import Clientes from "@/components/Clientes";
import Clientes2 from "@/components/Clientes2";
import Head from "next/head";
import { AppContext } from "@/Context/AppContext";


export default function Home() {
  const [isBodasModalVisible, setIsBodasModalVisible] = useState(false);
  const [bodasModalShown, setBodasModalShown] = useState(false);
  const bodasRef = useRef(null);
  const {idioma, setIdioma} = useContext(AppContext);

  // Mostrar modal solo cuando la sección de Bodas entra en el viewport
  useEffect(() => {
    if (bodasModalShown) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !bodasModalShown) {
          setIsBodasModalVisible(true);
          setBodasModalShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (bodasRef.current) observer.observe(bodasRef.current);
    return () => observer.disconnect();
  }, [bodasModalShown]);

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
      <meta property="og:image" content="https://transportesmx.org/ogimage.jpg" />
      <meta property="og:url" content="https://www.transportesmx.org" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Transportes MX - Traslados Seguros y Confiables" />
      <meta
        name="twitter:description"
        content="Reserva tu transporte con Transportes MX y viaja seguro. Servicios de chofer privado, aeropuertos, bodas y tours."
      />
      <meta name="twitter:image" content="https://transportesmx.org/ogimage.jpg" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
      <Hero />
      <About />
      {/* <Aeropuerto /> */}
      <div ref={bodasRef}>
        <Boda />
      </div>
      <Chofer />
      <Ejecutivo />
      <Autobus  />
      <Tours />
      <Testimonios />
      <Galeria />
      <Faqs />
      <Clientes/>
      <Clientes2/>
      {isBodasModalVisible && <BodasModal />} {/* Renderizar el modal condicionalmente */}
    </Fragment>
  );
}