import { Fragment, useContext } from "react";
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
import Autobus from "@/components/Autobus";
import Clientes from "@/components/Clientes";
import Clientes2 from "@/components/Clientes2";
import Head from "next/head";
import { AppContext } from "@/Context/AppContext";

export default function Home() {
const { idioma, setIdioma } = useContext(AppContext);

return (
<Fragment>
<Head>
<title>
Transportes MX - Traslados Seguros y Confiables en San Miguel de Allende
</title>
</Head>

  <Hero />
  <About />

  {/* <Aeropuerto /> */}

  <Boda />

  <Chofer />
  <Ejecutivo />
  <Autobus />
  <Tours />
  <Testimonios />
  <Galeria />
  <Faqs />
  <Clientes />
  <Clientes2 />
</Fragment>

);
}
