import About from "@/components/About";
import Aeropuerto from "@/components/Aeropuerto";
import Boda from "@/components/Bodas";
import Chofer from "@/components/Chofer";
import Ejecutivo from "@/components/Ejecutivo";
import Hero from "@/components/Hero";
import { Fragment } from "react";


export default function Home() {
  return (
    <Fragment>
      <Hero />
      <About />
      <Aeropuerto/>
      <Boda/>
      <Chofer/>
      <Ejecutivo/>
    </Fragment>
  );
}
