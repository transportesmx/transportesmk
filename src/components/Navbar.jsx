
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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

  // Control del desplazamiento móvil
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = isMenuOpen
      ? "hidden"
      : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  // Cerrar menú al pulsar fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isMenuOpen]);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleCotizar = () => {
    const phoneNumber = "524151393219";
    const message = "Hola, me gustaría cotizar un servicio";

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const socialLinks = [
    {
      href: "https://www.facebook.com/TransportesTMX/",
      label: "Facebook",
      icon: <FaFacebookF />,
      hover: "hover:text-blue-500",
    },
    {
      href: "https://www.instagram.com/trans_portesmx",
      label: "Instagram",
      icon: <FaInstagram />,
      hover: "hover:text-pink-500",
    },
    {
      href: "https://www.tiktok.com/@transportes.mx2",
      label: "TikTok",
      icon: <FaTiktok />,
      hover: "hover:text-gray-300",
    },
    {
      href: "https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html",
      label: "Tripadvisor",
      icon: <FaTripadvisor />,
      hover: "hover:text-green-500",
    },
  ];

  return (
    <header className="bg-black/70 shadow-md sticky top-0 z-50 text-white">

      <div className="container mx-auto flex justify-between items-center px-4 py-2">

        {/* LOGOTIPO Y CATRINA */}
        <a
          href="/"
          className="flex items-center py-2 gap-2"
          aria-label="Transportes MX inicio"
        >
          <img
            src="/assets/logo.png"
            alt="Transportes MX"
            className="h-8 w-auto"
            loading="eager"
          />

          {/* CATRINA MEXICANA */}
          <img
            src="/assets/catrina-3d.png"
            alt="Catrina mexicana Transportes MX"
            className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-110"
            loading="eager"
            decoding="async"
          />
        </a>

        {/* MENÚ DE ESCRITORIO */}
        <nav className="hidden lg:flex items-center space-x-4">

          <a href="/#Hero" className="hover:text-blue-500 transition">
            {traduccion.navbar.home}
          </a>

          <a href="/#About" className="hover:text-blue-500 transition">
            {traduccion.navbar.about}
          </a>

          {/* SERVICIOS */}
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
            className="hover:text-blue-500 transition"
          >
            Blog
          </Link>

          {/* ACCESO */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-2 hover:text-blue-500 transition"
            title="Acceso al sistema"
            aria-label="Acceso al sistema"
          >
            <FaUserCircle size={20} />
            <span>Acceso</span>
          </Link>

          {/* BANNER */}
          <Link
            href="/banner"
            className="hover:text-blue-500 transition"
            title="Banner de bienvenida"
          >
            Banner
          </Link>

          {/* RESERVACIONES */}
          <Link
            href="/reservar"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold text-sm"
          >
            {idioma.nombre === "EN" ? "Book now" : "Reservar"}
          </Link>

        </nav>

        {/* IDIOMAS Y REDES DE ESCRITORIO */}
        <div className="hidden lg:flex items-center gap-5">

          {/* IDIOMAS */}
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                setIdioma({ nombre: "ES", code: "MX" })
              }
              className={`flex items-center gap-1 rounded-md ${
                idioma.nombre === "ES"
                  ? "p-1 bg-white text-black"
                  : ""
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

            <span>/</span>

            <button
              type="button"
              onClick={() =>
                setIdioma({ nombre: "EN", code: "US" })
              }
              className={`flex items-center gap-1 rounded-md ${
                idioma.nombre === "EN"
                  ? "p-1 bg-white text-black"
                  : ""
              }`}
              aria-label="English"
            >
              EN
              <img
                src="/assets/icons/eu.png"
                alt="Estados Unidos"
                className="h-5"
              />
            </button>

          </div>

          {/* REDES */}
          <div className="flex items-center gap-4 text-lg">

            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={social.hover}
              >
                {social.icon}
              </Link>
            ))}

          </div>
        </div>

        {/* BOTÓN MÓVIL */}
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
            aria-label={
              isMenuOpen ? "Cerrar menú" : "Abrir menú"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <HiX size={24} />
            ) : (
              <HiMenu size={24} />
            )}
          </button>

        </div>

      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
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

          {/* SERVICIOS MÓVIL */}
          <div>

            <button
              type="button"
              onClick={() =>
                setIsDropdownOpen(!isDropdownOpen)
              }
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

          {/* ACCESO */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
          >
            <FaUserCircle size={20} />
            <span>Acceso</span>
          </Link>

          {/* BANNER */}
          <Link
            href="/banner"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-600"
            onClick={closeMobileMenu}
          >
            Banner
          </Link>

          {/* IDIOMAS */}
          <div className="px-4 py-3 flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setIdioma({ nombre: "ES", code: "MX" })
              }
              className={`flex items-center gap-2 rounded-md ${
                idioma.nombre === "ES"
                  ? "p-1 bg-white text-black"
                  : ""
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
              onClick={() =>
                setIdioma({ nombre: "EN", code: "US" })
              }
              className={`flex items-center gap-2 rounded-md ${
                idioma.nombre === "EN"
                  ? "p-1 bg-white text-black"
                  : ""
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

            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                aria-label={social.label}
                className={social.hover}
              >
                {social.icon}
              </Link>
            ))}

            <Link
              href="https://wa.me/524151393219"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              aria-label="WhatsApp"
              className="hover:text-green-500"
            >
              <FaWhatsapp />
            </Link>

          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;
