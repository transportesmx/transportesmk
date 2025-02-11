import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const clientes = [
  { nombre: "Empresa 1", logo: "/assets/clients/1.png" },
  { nombre: "Empresa 2", logo: "/assets/clients/2.png" },
  { nombre: "Empresa 3", logo: "/assets/clients/3.png" },
  { nombre: "Empresa 4", logo: "/assets/clients/4.png" },
  { nombre: "Empresa 5", logo: "/assets/clients/5.png" },
  { nombre: "Empresa 6", logo: "/assets/clients/6.png" },
  { nombre: "Empresa 6", logo: "/assets/clients/7.png" },
  { nombre: "Empresa 6", logo: "/assets/clients/8.png" },
];

const ClientesCarousel = () => {
  return (
    <div className="w-full bg-white py-4">
      <Swiper
        spaceBetween={30}
        slidesPerView={3}
        loop={true}
        autoplay={{
          delay: 0, // Velocidad continua
          disableOnInteraction: false,
        }}
        speed={4000} // Velocidad del desplazamiento
        modules={[Autoplay]}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        className="w-full px-6"
      >
        {clientes.map((cliente, index) => (
          <SwiperSlide key={index} className="flex justify-center items-center">
            <img
              src={cliente.logo}
              alt={cliente.nombre}
              className="w-[140px] h-[140px] object-contain"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ClientesCarousel;