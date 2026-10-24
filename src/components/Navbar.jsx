setIsMenuOpen(false);
              handleCotizar();
            }}
          >
            {traduccion.navbar.quote}
          </span> */}
          <div className="px-4 py-2 flex items-center space-x-2">
            <div
              className="flex items-center  gap-2 cursor-pointer"
              onClick={() => {
                setIdioma({ nombre: "ES", code: "MX" });
              }}
            >
              <div
                className={`flex items-center space-x-1  rounded-md ${
                  idioma.nombre == "ES" && "p-1 bg-white"
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
            <span className="text-white ">{"/"}</span>
            <div
              className="flex items-center  gap-2 cursor-pointer"
              onClick={() => {
                setIdioma({ nombre: "EN", code: "US" });
              }}
            >
              <span className="hover:text-blue-500">EN</span>
              <div
                className={`flex items-center space-x-1  rounded-md ${
                  idioma.nombre == "EN" && "p-1 bg-white"
                }`}
              >
                <img
                  src="/assets/icons/eu.png"
                  alt="Mexican Flag"
                  className="h-5"
                />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <div
              className="flex items-center  gap-2"
              onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
            >
              <div
                className={`flex items-center space-x-1  rounded-md ${
                  idioma.nombre == "ES" && "p-1 bg-white"
                }`}
              >
                <img
                  src="/assets/icons/mexico.png"
                  alt="Mexican Flag"
                  className="h-5"
                />
              </div>
              <span className="hover:text-blue-500 transition">ESP</span>
            </div>
            <span className="text-white ">{"/"}</span>
            <div
              className="flex items-center  gap-2"
              onClick={() => setIdioma({ nombre: "EN", code: "US" })}
            >
              <span className="hover:text-blue-500 transition">EN</span>
              <div
                className={`flex items-center space-x-1  rounded-md ${
                  idioma.nombre == "EN" && "p-1 bg-white"
                }`}
              >
                <img
                  src="/assets/icons/eu.png"
                  alt="Mexican Flag"
                  className="h-5"
                />
              </div>
            </div>
          </div>

          <div className="px-4 py-2 flex items-center justify-center space-x-8 text-[30px]">
            <Link
              href="https://www.facebook.com/TransportesTMX/"
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            </Link>
            <Link
              href="https://www.instagram.com/trans_portesmx"
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            </Link>
            <Link
              href="https://www.tiktok.com/@transportes.mx2"
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTiktok className="hover:text-black cursor-pointer" />
            </Link>
            <Link
              href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html"
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
            >
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
