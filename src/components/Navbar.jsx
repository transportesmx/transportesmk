```jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FaFacebookF,
  FaSignInAlt,
  FaInstagram,
  FaTiktok,
  FaTripadvisor,
  FaWhatsapp,
  FaBookOpen,
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

  // Bloquear el desplazamiento de la página cuando
  // el menú móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Cerrar el menú móvil al hacer clic fuera.
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
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
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
      hover: "hover:text-gray-400",
    },
    {
      href: "https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html",
      label: "Tripadvisor",
      icon: <FaTripadvisor />,
      hover: "hover:text-green-500",
    },
  ];

  const blogLink = (
    <Link
      href="/blog"
      title="Blog de Transportes MX"
      aria-label="Visitar el blog de Transportes MX"
      className="flex items-center gap-2 hover:text-blue-500 transition"
    >
      <FaBookOpen size={16} />
      <span>Blog</span>
    </Link>
  );

  return (
    <header className="bg-black/70 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-2">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center py-4"
          aria-label="Transportes MX - Inicio"
        >
          <img
            src="/assets/logo.png"
            alt="Transportes MX"
            className="h-8 mr-4"
          />
        </Link>

        {/* MENÚ DE COMPUTADORA */}
        <nav className="hidden lg:flex items-center space-x-4">
          <Link href="/#Hero" className="hover:text-blue-500 transition">
            {traduccion.navbar.home}
          </Link>

          <Link href="/#About" className="hover:text-blue-500 transition">
            {traduccion.navbar.about}
          </Link>

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
              <div className="absolute top-8 left-0 bg-black shadow-md rounded-lg w-48 py-2">
                <Link
                  href="/#Aeropuerto"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  {traduccion.navbar.airport_transfer}
                </Link>

                <Link
                  href="/#Bodas"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  {traduccion.navbar.wedding_transport}
                </Link>

                <Link
                  href="/#Chofer"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  {traduccion.navbar.private_driver}
                </Link>
              </div>
            )}
          </div>

          <Link href="/#Tours" className="hover:text-blue-500 transition">
            {traduccion.navbar.tours}
          </Link>

          {/* NUEVO ACCESO AL BLOG */}
          {blogLink}

          {/* ACCESO A NOTAS DE VENTA */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-2 hover:text-blue-500 transition"
            title="Acceso al sistema de notas de venta"
            aria-label="Acceso al sistema de notas de venta"
          >
            <FaSignInAlt size={17} />
            <span>Acceso</span>
          </Link>

          {/* RESERVAR */}
          <Link
            href="/reservar"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold text-sm"
          >
            {idioma.nombre === "EN" ? "Book now" : "Reservar"}
          </Link>
        </nav>

        {/* IDIOMAS Y REDES SOCIALES EN COMPUTADORA */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
              className={`flex items-center gap-1 rounded-md ${
                idioma.nombre === "ES" ? "bg-white text-black p-1" : ""
              }`}
              aria-label="Cambiar a español"
            >
              <img
                src="/assets/icons/mexico.png"
                alt=""
                className="h-5"
              />
              <span>ESP</span>
            </button>

            <span>/</span>

            <button
              type="button"
              onClick={() => setIdioma({ nombre: "EN", code: "US" })}
              className={`flex items-center gap-1 rounded-md ${
                idioma.nombre === "EN" ? "bg-white text-black p-1" : ""
              }`}
              aria-label="Switch to English"
            >
              <span>EN</span>
              <img src="/assets/icons/eu.png" alt="" className="h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`${social.hover} transition`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* BOTONES DEL CELULAR */}
        <div className="lg:hidden flex items-center gap-3">
          <Link
            href="/reservar"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold text-xs text-white whitespace-nowrap"
          >
            {idioma.nombre === "EN" ? "Book now" : "Reservar"}
          </Link>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            className="p-1"
          >
            {isMenuOpen ? <HiX size={26} /> : <HiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE PARA CELULAR */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden bg-black shadow-md max-h-[80vh] overflow-y-auto"
        >
          <Link
            href="/#Hero"
            className="block px-4 py-3 hover:bg-gray-700"
            onClick={closeMobileMenu}
          >
            {traduccion.navbar.home}
          </Link>

          <Link
            href="/#About"
            className="block px-4 py-3 hover:bg-gray-700"
            onClick={closeMobileMenu}
          >
            {traduccion.navbar.about}
          </Link>

          {/* SERVICIOS EN CELULAR */}
          <div>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full px-4 py-3 justify-between items-center hover:bg-gray-700"
              aria-expanded={isDropdownOpen}
            >
              {traduccion.navbar.services}
              <IoMdArrowDropdown />
            </button>

            {isDropdownOpen && (
              <div className="bg-gray-900">
                <Link
                  href="/#Aeropuerto"
                  className="block px-8 py-3 hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  {traduccion.navbar.airport_transfer}
                </Link>

                <Link
                  href="/#Bodas"
                  className="block px-8 py-3 hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  {traduccion.navbar.wedding_transport}
                </Link>

                <Link
                  href="/#Chofer"
                  className="block px-8 py-3 hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  {traduccion.navbar.private_driver}
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/#Tours"
            className="block px-4 py-3 hover:bg-gray-700"
            onClick={closeMobileMenu}
          >
            {traduccion.navbar.tours}
          </Link>

          {/* NUEVO ACCESO AL BLOG EN CELULAR */}
          <Link
            href="/blog"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700 hover:text-blue-400 transition"
            onClick={closeMobileMenu}
            title="Blog de Transportes MX"
            aria-label="Visitar el blog de Transportes MX"
          >
            <FaBookOpen size={18} />
            <span>Blog</span>
          </Link>

          {/* ACCESO A NOTAS DE VENTA EN CELULAR */}
          <Link
            href="/notas-venta"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700"
            onClick={closeMobileMenu}
            title="Acceso al sistema de notas de venta"
            aria-label="Acceso al sistema de notas de venta"
          >
            <FaSignInAlt size={18} />
            <span>Acceso</span>
          </Link>

          {/* CAMBIO DE IDIOMA EN CELULAR */}
          <div className="px-4 py-4 flex items-center gap-4 border-t border-gray-700 mt-2">
            <button
              type="button"
              onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
              className={`flex items-center gap-2 rounded-md ${
                idioma.nombre === "ES" ? "bg-white text-black p-1" : ""
              }`}
            >
              <img
                src="/assets/icons/mexico.png"
                alt=""
                className="h-5"
              />
              <span>ESP</span>
            </button>

            <span>/</span>

            <button
              type="button"
              onClick={() => setIdioma({ nombre: "EN", code: "US" })}
              className={`flex items-center gap-2 rounded-md ${
                idioma.nombre === "EN" ? "bg-white text-black p-1" : ""
              }`}
            >
              <img src="/assets/icons/eu.png" alt="" className="h-5" />
              <span>EN</span>
            </button>
          </div>

          {/* REDES SOCIALES EN CELULAR */}
          <div className="px-4 py-5 flex items-center justify-center gap-7 text-2xl border-t border-gray-700">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                aria-label={social.label}
                className={`${social.hover} transition`}
              >
                {social.icon}
              </a>
            ))}

            <a
              href="https://wa.me/524151393219"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              aria-label="WhatsApp"
              className="hover:text-green-500 transition"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
```
