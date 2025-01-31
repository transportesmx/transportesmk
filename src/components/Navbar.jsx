import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaTripadvisor } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-black shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-2">
        <div className="flex items-center py-4">
          <img src="/assets/logo.png" alt="MK Logo" className="h-8 mr-4" />
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          <a href="#" className="hover:text-blue-500 transition">Inicio</a>
          <a href="#" className="hover:text-blue-500 transition">Acerca</a>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center hover:text-blue-500 transition"
            >
              Servicios <IoMdArrowDropdown className="ml-1" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-8 left-0 bg-black shadow-md rounded-lg w-40 py-2">
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Aeropuerto</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Bodas</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Privado</a>
              </div>
            )}
          </div>

          <a href="#" className="hover:text-blue-500 transition">Tours</a>
          <a href="#" className="hover:text-blue-500 transition">Cotiza</a>
          </nav>
          <div className="flex items-center space-x-8">

          <div className="flex items-center space-x-2">
            <img src="/assets/icons/mexico.png" alt="Mexican Flag" className="h-5" />
            <a href="#" className="hover:text-blue-500 transition">ESP</a>
            <span className="text-white ">{"/"}</span>

            <a href="#" className="hover:text-blue-500 transition">EN</a>
            <img src="/assets/icons/eu.png" alt="Mexican Flag" className="h-5" />
          </div>

          <div className=" items-center space-x-4 hidden lg:flex">
            <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            <FaTiktok className="hover:text-black cursor-pointer" />
            <FaTripadvisor className="hover:text-green-500 cursor-pointer" />
          </div>
          </div>
       

        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-black shadow-md">
          <a href="#" className="block px-4 py-2 hover:bg-gray-600">Inicio</a>
          <a href="#" className="block px-4 py-2 hover:bg-gray-600">Acerca</a>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full px-4 py-2 justify-between hover:bg-gray-600"
            >
              Servicios <IoMdArrowDropdown />
            </button>
            {isDropdownOpen && (
              <div className="bg-white shadow-md rounded-lg w-full">
                <a href="#" className="block px-4 py-2 hover:bg-gray-600">Aeropuerto</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-600">Bodas</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-600">Privado</a>
              </div>
            )}
          </div>

          <a href="#" className="block px-4 py-2 hover:bg-gray-600">Tours</a>
          <a href="#" className="block px-4 py-2 hover:bg-gray-600">Cotiza</a>

          <div className="px-4 py-2 flex items-center space-x-2">
            <img src="/mx-flag.png" alt="Mexican Flag" className="h-5" />
            <span className="hover:text-blue-500">ESP</span>
            <span className="text-white ">{"/"}</span>
            <span className="hover:text-blue-500">EN</span>
          </div>

          <div className="px-4 py-2 flex items-center space-x-4">
            <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            <FaTiktok className="hover:text-black cursor-pointer" />
            <FaTripadvisor className="hover:text-green-500 cursor-pointer" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
