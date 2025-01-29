import Image from 'next/image';
import React from 'react'
import { FaBus, FaClock, FaFacebook, FaInstagram, FaTiktok, FaTripadvisor, FaTruck, FaWhatsapp } from 'react-icons/fa';

function About() {
  return (
    <div className="relative bg-cover bg-center h-[700px] md:h-[800px]" style={{ backgroundImage: 'url(/assets/images/about.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          {/* Left Section */}
          <div className=''>
            <h1 className="text-[32px] md:text-[30px] leading-[34px] md:leading-[30px] md:text-4xl lg:text-5xl font-bold text-center md:text-left mb-12">
              Más de 10 años de experiencia ofreciendo transporte turístico y ejecutivo de excelencia.
            </h1>
            <ul className="space-y-4 text-sm sm:text-base md:text-lg">
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
                <Image src="/assets/icons/clock.png" width={38} height={38} alt="Clock" />
                Puntualidad garantizada.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
              <Image src="/assets/icons/driver.png" width={38} height={38} alt="Clock" />                Choferes altamente capacitados.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
              <Image src="/assets/icons/bus.png" width={38} height={38} alt="Clock" />                Vehículos en perfectas condiciones.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4">
              <Image src="/assets/icons/24.png" width={38} height={38} alt="Clock" />                Atención personalizada 24/7.
              </li>
            </ul>
            <div className="flex justify-center md:justify-start space-x-4 mt-8 text-xl md:text-2xl">
              <a href="#" aria-label="Facebook" className="hover:opacity-75 text-[36px]"><FaFacebook/></a>
              <a href="#" aria-label="Instagram" className="hover:opacity-75 text-[36px] "><FaInstagram/></a>
              <a href="#" aria-label="TikTok" className="hover:opacity-75 text-[36px]"><FaTiktok/></a>
              <a href="#" aria-label="TripAdvisor" className="hover:opacity-75 text-[36px]"><FaTripadvisor/></a>
              <a href="#" aria-label="WhatsApp" className="hover:opacity-75 text-[36px]"><FaWhatsapp/></a>
            </div>
          </div>

          {/* Right Section */}
          <div className='hidden md:block'>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default About