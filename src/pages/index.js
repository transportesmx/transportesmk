import About from "@/components/About";
import Aeropuerto from "@/components/Aeropuerto";
import Hero from "@/components/Hero";
import Image from "next/image";
import { Fragment } from "react";


export default function Home() {
  return (
    <Fragment>
      <Hero />
      <About />
      <Aeropuerto/>
    </Fragment>
  );
}
