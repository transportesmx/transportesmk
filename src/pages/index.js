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