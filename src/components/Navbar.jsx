import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaTripadvisor, FaWhatsapp } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCotizar = () => {
    const phoneNumber = "524151393219"; // Reemplaza con el número de WhatsApp incluyendo el código de país (52 para México).
    const message = "Hola, me gustaría cotizar un servicio";
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <header className="bg-black shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-2">
        <div className="flex items-center py-4">
          <img src="/assets/logo.png" alt="MK Logo" className="h-8 mr-4" />
        </div>

        <nav className="hidden lg:flex items-center space-x-4">
          <a href="/#Hero" className="hover:text-blue-500 transition">Inicio</a>
          <a href="/#About" className="hover:text-blue-500 transition">Acerca</a>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center hover:text-blue-500 transition"
            >
              Servicios <IoMdArrowDropdown className="ml-1" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-8 left-0 bg-black shadow-md rounded-lg w-40 py-2">
                <a href="/#Aeropuerto" className="block px-4 py-2 ">
                Traslado Aeropuerto</a>
                <a href="/#Bodas" className="block px-4 py-2 ">Trasnporte Bodas Destino</a>
                <a href="/#Chofer" className="block px-4 py-2 ">Privado</a>
              </div>
            )}
          </div>

          <a href="/#Tours" className="hover:text-blue-500 transition">Tours</a>
          <span onClick={handleCotizar} className="hover:text-blue-500 transition cursor-pointer">Cotiza</span>
          </nav>
          <div className="flex items-center space-x-8">

          <div className="hidden lg:flex items-center space-x-2">
            <img src="/assets/icons/mexico.png" alt="Mexican Flag" className="h-5" />
            <a href="#" className="hover:text-blue-500 transition">ESP</a>
            <span className="text-white ">{"/"}</span>

            <a href="#" className="hover:text-blue-500 transition">EN</a>
            <img src="/assets/icons/eu.png" alt="Mexican Flag" className="h-5" />
          </div>

          <div className=" items-center space-x-4 hidden lg:flex">
          <Link href="https://www.facebook.com/TransportesTMX/" target="_blank">
            <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            </Link>
            <Link href="https://www.instagram.com/trans_portesmx" target="_blank">
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            </Link>
            <Link href="https://www.tiktok.com/@transportes.mx2" target="_blank">
            <FaTiktok className="hover:text-black cursor-pointer" />
            </Link>
            <Link href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html" target="_blank">
            <FaTripadvisor className="hover:text-green-500 cursor-pointer" />
            </Link>
          </div>
          </div>
       

        <div className="lg:hidden flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-black shadow-md">
          <a href="/#Hero" className="block px-4 py-2 hover:bg-gray-600"
          onClick={() => setIsMenuOpen(false)}
          >Inicio</a>
          <a href="/#About"
          onClick={() => setIsMenuOpen(false)}
          className="block px-4 py-2 hover:bg-gray-600">Acerca</a>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full px-4 py-2 justify-between hover:bg-gray-600"
            >
              Servicios <IoMdArrowDropdown />
            </button>
            {isDropdownOpen && (
              <div className="bg-white shadow-md rounded-lg w-full">
                <Link href="/#Aeropuerto" className="block bg-black px-4 py-2 hover:bg-gray-600"
                onClick={() => setIsMenuOpen(false)}
                >Traslado Aeropuerto</Link>
                <Link href="/#Bodas" className="block bg-black px-4 py-2 hover:bg-gray-600"
                onClick={() => setIsMenuOpen(false)}
                >Transporte Bodas Destino</Link>
                <Link href="/#Chofer" className="block bg-black px-4 py-2 hover:bg-gray-600"
                onClick={() => setIsMenuOpen(false)}
                >Chofer Privado</Link>
              </div>
            )}
          </div>

          <a href="/#Tours" className="block px-4 py-2 hover:bg-gray-600"
          onClick={() => setIsMenuOpen(false)}
          >Tours</a>
          <span className="block px-4 py-2 hover:bg-gray-600"
          onClick={() => {
            setIsMenuOpen(false)
            handleCotizar()
          }}
          >Cotiza</span>

          <div className="px-4 py-2 flex items-center space-x-2">
          <img src="/assets/icons/mexico.png" alt="Mexican Flag" className="h-5" />
            <span className="hover:text-blue-500">ESP</span>
            <span className="text-white ">{"/"}</span>
            <span className="hover:text-blue-500">EN</span>
            <img src="/assets/icons/eu.png" alt="Mexican Flag" className="h-5" />
          </div>

       

          <div className="px-4 py-2 flex items-center justify-center space-x-8 text-[30px]">
          <Link href="https://www.facebook.com/TransportesTMX/" target="_blank">
            <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            </Link>
            <Link href="https://www.instagram.com/trans_portesmx" target="_blank">
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            </Link>
            <Link href="https://www.tiktok.com/@transportes.mx2" target="_blank">
            <FaTiktok className="hover:text-black cursor-pointer" />
            </Link>
            <Link href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html" target="_blank">
            <FaTripadvisor className="hover:text-green-500 cursor-pointer" />
            </Link>
            <Link href="https://wa.me/524151393219" target="_blank">
            <FaWhatsapp className="hover:text-green-500 cursor-pointer" />
            </Link>
          </div>
         
        </div>
      )}
    </header>
  );
};

export default Navbar;
