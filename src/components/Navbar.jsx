
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTripadvisor,
  FaWhatsapp,
  FaUserCircle,
} from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";
import { AppContext } from "@/Context/AppContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { idioma, setIdioma } = useContext(AppContext);
  const { traduccion } = useContext(AppContext);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCotizar = () => {
    const phoneNumber = "524151393219";
    const message = "Hola, me gustaría cotizar un servicio";
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <header className="bg-black/70 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-2">
        <a href="/" className="flex items-center py-4">
          <img
            src="/assets/logo.png"
            alt="MK Logo"
            className="h-8 mr-4"
          />
        </a>

        {/* MENÚ DE COMPUTADORA */}
        <nav className="hidden lg:flex items-center space-x-4">
          <a href="/#Hero" className="hover:text-blue-500 transition">
            {traduccion.navbar.home}
          </a>

          <a href="/#About" className="hover:text-blue-500 transition">
            {traduccion.navbar.about}
          </a>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center hover:text-blue-500 transition"
            >
              {traduccion.navbar.services}{" "}
              <IoMdArrowDropdown className="ml-1" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-8 left-0 bg-black shadow-md rounded-lg w-40 py-2">
                <a href="/#Aeropuerto" className="block px-4 py-2">
                  {traduccion.navbar.airport_transfer}
                </a>
                <a href="/#Bodas" className="block px-4 py-2">
                  {traduccion.navbar.wedding_transport}
                </a>
                <a href="/#Chofer" className="block px-4 py-2">
                  {traduccion.navbar.private_driver}
                </a>
              </div>
            )}
          </div>

          <a href="/#Tours" className="hover:text-blue-500 transition">
            {traduccion.navbar.tours}
          </a>

          {/* ACCESO AL SISTEMA */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-2 hover:text-blue-500 transition"
            title="Acceso al sistema"
            aria-label="Acceso al sistema"
          >
            <FaUserCircle size={18} />
            <span>Acceso</span>
          </Link>

          {/* Cotizar */}
          {/* <span
            onClick={handleCotizar}
            className="hover:text-blue-500 transition cursor-pointer"
          >
            {traduccion.navbar.quote}
          </span> */}

          <Link
            href="/reservar"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold text-sm"
          >
            {idioma.nombre === "EN" ? "Book now" : "Reservar"}
          </Link>
        </nav>

        <div className="flex items-center space-x-8">
          {/* IDIOMAS DE COMPUTADORA */}
          <div className="hidden lg:flex items-center space-x-2">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
            >
              <div
                className={`flex items-center space-x-1 rounded-md ${
                  idioma.nombre === "ES" ? "p-1 bg-white" : ""
                }`}
              >
                <img
                  src="/assets/icons/mexico.png"
                  alt="Mexican Flag"
                  className="h-5"
                />
              </div>
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="hover:text-blue-500 transition"
              >
                ESP
              </a>
            </div>

            <span className="text-white">/</span>

            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIdioma({ nombre: "EN", code: "US" })}
            >
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="hover:text-blue-500 transition"
              >
                EN
              </a>
              <div
                className={`flex items-center space-x-1 rounded-md ${
                  idioma.nombre === "EN" ? "p-1 bg-white" : ""
                }`}
              >
                <img
                  src="/assets/icons/eu.png"
                  alt="US Flag"
                  className="h-5"
                />
              </div>
            </div>
          </div>

          {/* REDES SOCIALES DE COMPUTADORA */}
          <div className="items-center space-x-4 hidden lg:flex">
            <Link
              href="https://www.facebook.com/TransportesTMX/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            </Link>

            <Link
              href="https://www.instagram.com/trans_portesmx"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            </Link>

            <Link
              href="https://www.tiktok.com/@transportes.mx2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok className="hover:text-white cursor-pointer" />
            </Link>

            <Link
              href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTripadvisor className="hover:text-green-500 cursor-pointer" />
            </Link>
          </div>
        </div>

        {/* BOTONES DE CELULAR */}
        <div className="lg:hidden flex items-center gap-3">
          <Link
            href="/reservar"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold text-xs text-white whitespace-nowrap"
          >
            {idioma.nombre === "EN" ? "Book now" : "Reservar"}
          </Link>

          <button
            ref={buttonRef}
            type="button"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE DE CELULAR */}
      {isMenuOpen && (
        <div ref={menuRef} className="lg:hidden bg-black shadow-md">
          <a
            href="/#Hero"
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={() => setIsMenuOpen(false)}
          >
            {traduccion.navbar.home}
          </a>

          <a
            href="/#About"
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={() => setIsMenuOpen(false)}
          >
            {traduccion.navbar.about}
          </a>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full px-4 py-2 justify-between hover:bg-gray-600"
            >
              {traduccion.navbar.services}
              <IoMdArrowDropdown />
            </button>

            {isDropdownOpen && (
              <div className="bg-black shadow-md rounded-lg w-full">
                <Link
                  href="/#Aeropuerto"
                  className="block px-4 py-2 hover:bg-gray-600"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {traduccion.navbar.airport_transfer}
                </Link>

                <Link
                  href="/#Bodas"
                  className="block px-4 py-2 hover:bg-gray-600"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {traduccion.navbar.wedding_transport}
                </Link>

                <Link
                  href="/#Chofer"
                  className="block px-4 py-2 hover:bg-gray-600"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {traduccion.navbar.private_driver}
                </Link>
              </div>
            )}
          </div>

          <a
            href="/#Tours"
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={() => setIsMenuOpen(false)}
          >
            {traduccion.navbar.tours}
          </a>

          {/* ACCESO AL SISTEMA */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-600"
            onClick={() => {
              setIsMenuOpen(false);
              setIsDropdownOpen(false);
            }}
            title="Acceso al sistema"
            aria-label="Acceso al sistema"
          >
            <FaUserCircle size={18} />
            <span>Acceso</span>
          </Link>

          {/* Cotizar */}
          {/* <span
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={() => {
              setIsMenuOpen(false);
              handleCotizar();
            }}
          >
            {traduccion.navbar.quote}
          </span> */}

          {/* SELECTOR DE IDIOMA DE CELULAR */}
          <div className="px-4 py-2 flex items-center space-x-2">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
            >
              <div
                className={`flex items-center space-x-1 rounded-md ${
                  idioma.nombre === "ES" ? "p-1 bg-white" : ""
                }`}
              >
                <img
                  src="/assets/icons/mexico.png"
                  alt="Mexican Flag"
                  className="h-5"
                />
              </div>
              <span className="hover:text-blue-500">ESP</span>
            </div>

            <span className="text-white">/</span>

            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIdioma({ nombre: "EN", code: "US" })}
            >
              <span className="hover:text-blue-500">EN</span>
              <div
                className={`flex items-center space-x-1 rounded-md ${
                  idioma.nombre === "EN" ? "p-1 bg-white" : ""
                }`}
              >
                <img
                  src="/assets/icons/eu.png"
                  alt="US Flag"
                  className="h-5"
                />
              </div>
            </div>
          </div>

          {/* REDES SOCIALES DE CELULAR */}
          <div className="px-4 py-2 flex items-center justify-center space-x-8 text-[30px]">
            <Link
              href="https://www.facebook.com/TransportesTMX/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            </Link>

            <Link
              href="https://www.instagram.com/trans_portesmx"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            </Link>

            <Link
              href="https://www.tiktok.com/@transportes.mx2"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTiktok className="hover:text-white cursor-pointer" />
            </Link>

            <Link
              href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTripadvisor className="hover:text-green-500 cursor-pointer" />
            </Link>

            <Link
              href="https://wa.me/524151393219"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaWhatsapp className="hover:text-green-500 cursor-pointer" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
