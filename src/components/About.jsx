import Image from 'next/image';
import React from 'react';
import { FaBus, FaClock, FaFacebook, FaInstagram, FaTiktok, FaTripadvisor, FaTruck, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

function About() {
  return (
    <motion.div
    id="About"
      className="relative bg-cover bg-center h-[700px] md:h-[600px] w-full flex justify-center items-center"
      style={{ backgroundImage: 'url(/assets/images/about.png)' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Section */}
          <motion.div
            className=""
            variants={variants}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-[32px] md:text-[30px] leading-[34px] md:leading-[30px] md:text-4xl xl:text-5xl font-bold text-center md:text-left mb-12">
              Más de 10 años de experiencia ofreciendo transporte turístico y ejecutivo de excelencia.
            </h1>
            <ul className="space-y-4 text-sm sm:text-base md:text-lg">
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
                <Image src="/assets/icons/clock.png" width={38} height={38} alt="Clock" />
                Puntualidad garantizada.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
                <Image src="/assets/icons/driver.png" width={38} height={38} alt="Clock" /> Choferes altamente capacitados.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
                <Image src="/assets/icons/bus.png" width={38} height={38} alt="Clock" /> Vehículos en perfectas condiciones.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
                <Image src="/assets/icons/24.png" width={38} height={38} alt="Clock" /> Atención personalizada 24/7.
              </li>
            </ul>

            <div className="flex md:hidden justify-center md:justify-start space-x-4 mt-8 text-xl md:text-2xl">
              <Link href="https://www.facebook.com/TransportesTMX/" target="_blank" aria-label="Facebook" className="hover:text-blue-500 text-[36px]"><FaFacebook /></Link>
              <Link href="https://www.instagram.com/trans_portesmx"  aria-label="Instagram"  target="_blank" className="hover:text-pink-500 text-[36px] "><FaInstagram /></Link>
              <Link href="https://www.tiktok.com/@transportes.mx2" target="_blank"  aria-label="TikTok" className="hover:text-black text-[36px]"><FaTiktok /></Link>
              <Link href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html" target="_blank" aria-label="TripAdvisor" className="hover:text-green-500 text-[36px]"><FaTripadvisor /></Link>
              <Link href="https://wa.me/524151393219" target="_blank" aria-label="WhatsApp" className="hover:text-green-500 text-[36px]"><FaWhatsapp /></Link>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div
            className="hidden md:block"
            variants={variants}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Misión:</h2>
              <p className="text-sm sm:text-base md:text-lg">
                Ofrecer servicios de transporte de calidad, garantizando la mejor experiencia para
                nuestros clientes, con un enfoque en puntualidad, seguridad y atención personalizada.
              </p>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Visión:</h2>
              <p className="text-sm sm:text-base md:text-lg">
                Ser la compañía de transporte más confiable y reconocida, destacándonos por nuestra
                excelencia y profesionalismo.
              </p>
            </div>

            <div className="hidden md:flex justify-center md:justify-start space-x-4 mt-8 text-xl md:text-2xl">
            <Link href="https://www.facebook.com/TransportesTMX/" target="_blank" aria-label="Facebook" className="hover:text-blue-500 text-[36px]"><FaFacebook /></Link>
              <Link href="https://www.instagram.com/trans_portesmx"   target="_blank" aria-label="Instagram" className="hover:text-pink-500 text-[36px] "><FaInstagram /></Link>
              <Link href="https://www.tiktok.com/@transportes.mx2" target="_blank"  aria-label="TikTok" className="hover:text-black text-[36px]"><FaTiktok /></Link>
              <Link href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html"  target="_blank" aria-label="TripAdvisor" className="hover:text-green-500 text-[36px]"><FaTripadvisor /></Link>
              <Link href="https://wa.me/524151393219" target="_blank" aria-label="WhatsApp" className="hover:text-green-500 text-[36px]"><FaWhatsapp /></Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default About;