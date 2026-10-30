
import { useState, useEffect, useRef, Fragment } from "react";

import Head from "next/head";

import About from "@/components/About";
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

export default function Home() {
  const [isBodasModalVisible, setIsBodasModalVisible] = useState(false);
  const [bodasModalShown, setBodasModalShown] = useState(false);

  const bodasRef = useRef(null);

  // Mostrar modal cuando la sección de Bodas entra en pantalla
  useEffect(() => {
    if (bodasModalShown) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsBodasModalVisible(true);
          setBodasModalShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (bodasRef.current) {
      observer.observe(bodasRef.current);
    }

    return () => observer.disconnect();
  }, [bodasModalShown]);

  return (
    <Fragment>
      <Head>
        <title>
          Transportes MX - Traslados Seguros y Confiables en San Miguel de Allende
        </title>
      </Head>

      <Hero />

      <About />

      <div ref={bodasRef}>
        <Boda />
      </div>

      <Chofer />

      <Ejecutivo />

      <Autobus />

      <Tours />

      <Testimonios />

      <Galeria />

      <Faqs />

      <Clientes />

      <Clientes2 />

      {isBodasModalVisible && <BodasModal />}
    </Fragment>
  );
}
