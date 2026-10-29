
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FaFacebookF,
  FaUserCircle,
  FaInstagram,
  FaTiktok,
  FaTripadvisor,
  FaWhatsapp,
} from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";
import { AppContext } from "@/Context/AppContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { idioma, setIdioma, traduccion } = useContext(AppContext);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

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
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-black/70 shadow-md sticky top-0 z-50 text-white">
      <div className="container mx-auto flex justify-between items-center px-4 py-2">
        {/* LOGOTIPO Y VELA DE NOVIEMBRE */}
        <a
          href="/"
          className="flex items-center py-4 flex-shrink-0"
          aria-label="Transportes MX - Inicio"
        >
          <img
            src="/assets/logo.png"
            alt="Transportes MX"
            className="h-8 w-auto mr-2"
          />

          {/* VELA ENCENDIDA */}
          <span
            className="vela-noviembre"
            role="img"
            aria-label="Vela encendida de noviembre"
          >
            <span className="vela-flama">
              <span className="vela-flama-interior" />
            </span>

            <span className="vela-mecha" />

            <span className="vela-cuerpo">
              <span className="vela-borde" />
              <span className="vela-gota" />
              <span className="vela-reflejo" />
            </span>
          </span>
        </a>

        {/* MENÚ DE ESCRITORIO */}
        <nav className="hidden lg:flex items-center space-x-4">
          <a href="/#Hero" className="hover:text-blue-500 transition">
            {traduccion.navbar.home}
          </a>

          <a href="/#About" className="hover:text-blue-500 transition">
            {traduccion.navbar.about}
          </a>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center hover:text-blue-500 transition"
              aria-expanded={isDropdownOpen}
            >
              {traduccion.navbar.services}
              <IoMdArrowDropdown className="ml-1" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-8 left-0 bg-black shadow-md rounded-lg w-40 py-2 z-50">
                <a
                  href="/#Aeropuerto"
                  className="block px-4 py-2 hover:bg-gray-600"
                >
                  {traduccion.navbar.airport_transfer}
                </a>

                <a
                  href="/#Bodas"
                  className="block px-4 py-2 hover:bg-gray-600"
                >
                  {traduccion.navbar.wedding_transport}
                </a>

                <a
                  href="/#Chofer"
                  className="block px-4 py-2 hover:bg-gray-600"
                >
                  {traduccion.navbar.private_driver}
                </a>
              </div>
            )}
          </div>

          <a href="/#Tours" className="hover:text-blue-500 transition">
            {traduccion.navbar.tours}
          </a>

          {/* BLOG */}
          <Link
            href="/blog"
            className="flex items-center gap-2 hover:text-blue-500 transition"
            title="Blog de Transportes MX"
          >
            Blog
          </Link>

          {/* ACCESO AL SISTEMA */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-2 hover:text-blue-500 transition"
            title="Acceso al sistema"
            aria-label="Acceso al sistema"
          >
            <FaUserCircle size={20} />
            <span>Acceso</span>
          </Link>

          {/* ACCESO AL BANNER */}
          <Link
            href="/banner"
            className="flex items-center gap-2 hover:text-blue-500 transition"
            title="Banner de bienvenida"
            aria-label="Banner de bienvenida"
          >
            <span>Banner</span>
          </Link>

          {/* RESERVACIONES */}
          <Link
            href="/reservar"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold text-sm"
          >
            {idioma.nombre === "EN" ? "Book now" : "Reservar"}
          </Link>
        </nav>

        {/* IDIOMAS Y REDES PARA ESCRITORIO */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
              className={`flex items-center gap-1 rounded-md ${
                idioma.nombre === "ES" ? "p-1 bg-white text-black" : ""
              }`}
              aria-label="Español"
            >
              <img
                src="/assets/icons/mexico.png"
                alt="México"
                className="h-5"
              />
              ESP
            </button>

            <span className="text-white">/</span>

            <button
              type="button"
              onClick={() => setIdioma({ nombre: "EN", code: "US" })}
              className={`flex items-center gap-1 rounded-md ${
                idioma.nombre === "EN" ? "p-1 bg-white text-black" : ""
              }`}
              aria-label="English"
            >
              EN
              <img
                src="/assets/icons/eu.png"
                alt="United States"
                className="h-5"
              />
            </button>
          </div>

          <div className="flex items-center gap-4 text-lg">
            <Link
              href="https://www.facebook.com/TransportesTMX/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            </Link>

            <Link
              href="https://www.instagram.com/trans_portesmx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            </Link>

            <Link
              href="https://www.tiktok.com/@transportes.mx2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <FaTiktok className="hover:text-gray-300 cursor-pointer" />
            </Link>

            <Link
              href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tripadvisor"
            >
              <FaTripadvisor className="hover:text-green-500 cursor-pointer" />
            </Link>
          </div>
        </div>

        {/* BOTÓN DEL MENÚ MÓVIL */}
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE PARA CELULAR */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden bg-black shadow-md text-white"
        >
          <a
            href="/#Hero"
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
          >
            {traduccion.navbar.home}
          </a>

          <a
            href="/#About"
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
          >
            {traduccion.navbar.about}
          </a>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full px-4 py-2 justify-between hover:bg-gray-600"
              aria-expanded={isDropdownOpen}
            >
              {traduccion.navbar.services}
              <IoMdArrowDropdown />
            </button>

            {isDropdownOpen && (
              <div className="bg-black w-full">
                <Link
                  href="/#Aeropuerto"
                  className="block px-6 py-2 hover:bg-gray-600"
                  onClick={closeMobileMenu}
                >
                  {traduccion.navbar.airport_transfer}
                </Link>

                <Link
                  href="/#Bodas"
                  className="block px-6 py-2 hover:bg-gray-600"
                  onClick={closeMobileMenu}
                >
                  {traduccion.navbar.wedding_transport}
                </Link>

                <Link
                  href="/#Chofer"
                  className="block px-6 py-2 hover:bg-gray-600"
                  onClick={closeMobileMenu}
                >
                  {traduccion.navbar.private_driver}
                </Link>
              </div>
            )}
          </div>

          <a
            href="/#Tours"
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
          >
            {traduccion.navbar.tours}
          </a>

          {/* BLOG */}
          <Link
            href="/blog"
            className="block px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
          >
            Blog
          </Link>

          {/* ACCESO AL SISTEMA */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
            title="Acceso al sistema"
          >
            <FaUserCircle size={20} />
            <span>Acceso</span>
          </Link>

          {/* ACCESO AL BANNER */}
          <Link
            href="/banner"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
            title="Banner de bienvenida"
          >
            <span>Banner</span>
          </Link>

          {/* SELECTOR DE IDIOMA */}
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
              className={`flex items-center gap-2 rounded-md ${
                idioma.nombre === "ES" ? "p-1 bg-white text-black" : ""
              }`}
            >
              <img
                src="/assets/icons/mexico.png"
                alt="México"
                className="h-5"
              />
              ESP
            </button>

            <span>/</span>

            <button
              type="button"
              onClick={() => setIdioma({ nombre: "EN", code: "US" })}
              className={`flex items-center gap-2 rounded-md ${
                idioma.nombre === "EN" ? "p-1 bg-white text-black" : ""
              }`}
            >
              EN
              <img
                src="/assets/icons/eu.png"
                alt="Estados Unidos"
                className="h-5"
              />
            </button>
          </div>

          {/* REDES SOCIALES */}
          <div className="px-4 py-4 flex items-center justify-center gap-7 text-2xl">
            <Link
              href="https://www.facebook.com/TransportesTMX/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              aria-label="Facebook"
            >
              <FaFacebookF className="hover:text-blue-500" />
            </Link>

            <Link
              href="https://www.instagram.com/trans_portesmx"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              aria-label="Instagram"
            >
              <FaInstagram className="hover:text-pink-500" />
            </Link>

            <Link
              href="https://www.tiktok.com/@transportes.mx2"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              aria-label="TikTok"
            >
              <FaTiktok className="hover:text-gray-300" />
            </Link>

            <Link
              href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              aria-label="Tripadvisor"
            >
              <FaTripadvisor className="hover:text-green-500" />
            </Link>

            <Link
              href="https://wa.me/524151393219"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="hover:text-green-500" />
            </Link>
          </div>
        </div>
      )}

      {/* ESTILOS DE LA VELA */}
      <style jsx>{`
        .vela-noviembre {
          position: relative;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          width: 28px;
          height: 43px;
          flex-shrink: 0;
          margin-left: 2px;
          margin-right: 5px;
          vertical-align: middle;
        }

        .vela-flama {
          position: absolute;
          z-index: 3;
          top: 0;
          left: 50%;
          width: 16px;
          height: 23px;
          transform: translateX(-50%);
          transform-origin: 50% 100%;
          border-radius: 55% 45% 50% 50%;
          background: linear-gradient(
            to top,
            #ff3b00 0%,
            #ff7900 43%,
            #ffc342 73%,
            #fff6c8 100%
          );
          clip-path: polygon(50% 0%, 91% 56%, 83% 83%, 50% 100%, 17% 83%, 9% 56%);
          filter: drop-shadow(0 0 4px #ff8c00);
          animation: llama-oscila 0.8s ease-in-out infinite alternate;
        }

        .vela-flama-interior {
          position: absolute;
          width: 6px;
          height: 11px;
          left: 5px;
          bottom: 2px;
          border-radius: 50% 50% 45% 45%;
          background: #fffbe4;
          clip-path: polygon(50% 0%, 100% 70%, 75% 100%, 25% 100%, 0% 70%);
        }

        .vela-mecha {
          position: absolute;
          z-index: 2;
          top: 19px;
          left: 50%;
          width: 3px;
          height: 5px;
          background: #39251a;
          transform: translateX(-50%);
        }

        .vela-cuerpo {
          position: relative;
          display: block;
          width: 17px;
          height: 22px;
          border-radius: 3px 3px 2px 2px;
          background: linear-gradient(
            90deg,
            #b8a17c 0%,
            #f5e3bd 35%,
            #fff3d6 58%,
            #d2b98e 100%
          );
          box-shadow: 0 0 8px #ffbd5940;
        }

        .vela-borde {
          position: absolute;
          top: -2px;
          left: 0;
          width: 17px;
          height: 5px;
          border-radius: 50%;
          background: #fff0cf;
          border-bottom: 1px solid #d5bc92;
        }

        .vela-gota {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 3px;
          height: 7px;
          background: #fff0cf;
          border-radius: 0 0 5px 5px;
        }

        .vela-reflejo {
          position: absolute;
          top: 6px;
          left: 4px;
          width: 2px;
          height: 12px;
          background: #ffffff80;
          border-radius: 3px;
        }

        @keyframes llama-oscila {
          0% {
            transform: translateX(-50%) rotate(-6deg) scale(0.94);
          }
          35% {
            transform: translateX(-50%) rotate(3deg) scale(1.04);
          }
          70% {
            transform: translateX(-50%) rotate(-3deg) scale(1.08);
          }
          100% {
            transform: translateX(-50%) rotate(6deg) scale(0.98);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vela-flama {
            animation: none;
          }
        }

        @media (max-width: 380px) {
          .vela-noviembre {
            width: 24px;
            margin-right: 2px;
          }

          .vela-cuerpo {
            width: 15px;
          }

          .vela-borde {
            width: 15px;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
