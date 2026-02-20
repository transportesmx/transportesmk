import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const clientes2 = [
  { nombre: "Cliente 1", logo: "/assets/clients2/adcb4c92-edc0-4d9b-ab9c-fd70d2697516.jpeg" },
  { nombre: "Cliente 2", logo: "/assets/clients2/a176ce62-2346-4aa1-aaba-2ab50dd590f0.jpeg" },
  { nombre: "Cliente 3", logo: "/assets/clients2/9f776189-6ad6-4f56-bd99-08e371a9d2e1.jpeg" },
  { nombre: "Cliente 4", logo: "/assets/clients2/6d980c9e-6a84-47d4-8f6d-3d9067576a88.jpeg" },
  { nombre: "Cliente 5", logo: "/assets/clients2/9b6ae373-c6a3-45aa-b3fe-2888f3a5bc11.jpeg" },
  { nombre: "Cliente 6", logo: "/assets/clients2/46abe8b8-c84c-433e-a1eb-7f330d3032fd.jpeg" },
  { nombre: "Cliente 7", logo: "/assets/clients2/d9f9bb9f-a835-4efb-a530-a86fd31200cc.jpeg" },
  { nombre: "Cliente 8", logo: "/assets/clients2/03fb143a-527d-42c5-82e1-58969c6ff177.jpeg" },
  { nombre: "Cliente 9", logo: "/assets/clients2/9a6613de-4a68-452e-8713-801f62b87c59.jpeg" },
  { nombre: "Cliente 10", logo: "/assets/clients2/1dc967f9-14d8-4bee-a16d-d2518e327502.jpeg" },
];

const ClientesCarousel2 = () => {
  return (
    <div className="w-full bg-white py-4">
      <Swiper
        spaceBetween={30}
        slidesPerView={3}
        loop={true}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          reverseDirection: true,
        }}
        speed={4000}
        modules={[Autoplay]}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        className="w-full px-6"
      >
        {clientes2.map((cliente, index) => (
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

export default ClientesCarousel2;
