import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";

const testimonios = [
  {
    nombre: "Ana Martínez",
    description:
      "El traslado desde el aeropuerto fue impecable. El chofer me recibió puntualmente, el vehículo estaba en perfectas condiciones y el viaje fue muy cómodo. Definitivamente lo volveré a contratar.",
    servicio: "Traslado a Aeropuerto",
  },
  {
    nombre: "Carlos Ramírez",
    description:
      "El servicio de chofer privado fue excelente. Puntualidad, comodidad y un trato muy profesional. Me permitió enfocarme en mis reuniones sin preocuparme por el tráfico.",
    servicio: "Chofer Privado",
  },
  {
    nombre: "María Hernández",
    description:
      "Contratamos el traslado para nuestra boda y fue una gran decisión. Todo estuvo perfectamente coordinado y nuestros invitados llegaron cómodos y a tiempo. Un servicio de primera.",
    servicio: "Traslado para Bodas",
  },
  {
    nombre: "Luis Gómez",
    description:
      "El tour a San Miguel de Allende fue increíble. Nos llevó a todos los lugares emblemáticos y nos ayudó a aprovechar al máximo nuestro día. Una experiencia que repetiría sin dudar.",
    servicio: "Tours (San Miguel de Allende)",
  },
  {
    nombre: "Eduardo Torres",
    description:
      "El traslado ejecutivo fue impecable. El chofer fue puntual, la camioneta estaba en perfectas condiciones y el servicio fue muy profesional. Lo recomiendo ampliamente para viajes de negocios.",
    servicio: "Traslado Ejecutivo",
  },
  {
    nombre: "Laura Sánchez",
    description:
      "El tour por los viñedos fue una experiencia increíble. El transporte fue muy cómodo, el chofer muy amable y atento. Todo estuvo bien organizado. Sin duda lo volveré a hacer.",
    servicio: "Tours (Ruta de Viñedos)",
  },
  {
    nombre: "Fernando Pérez",
    description:
      "Un servicio de primera. Me recogieron puntualmente y el traslado fue muy seguro y eficiente. Perfecto para viajes largos o de negocios.",
    servicio: "Chofer Privado",
  },
  {
    nombre: "Alejandra Ruiz",
    description:
      "Reservamos el transporte para la boda de mi hermana y fue perfecto. Puntualidad, elegancia y comodidad en cada traslado. Superó nuestras expectativas.",
    servicio: "Traslado para Bodas",
  },
  {
    nombre: "Ricardo López",
    description:
      "Necesitaba un servicio ejecutivo de calidad y lo encontré aquí. La camioneta estaba impecable y el chofer fue muy profesional. Ideal para reuniones de negocios.",
    servicio: "Traslado Ejecutivo",
  },
  {
    nombre: "Sofía Torres",
    description:
      "El tour por Guanajuato fue espectacular. Aprendimos mucho sobre la historia del lugar y disfrutamos cada parada. Excelente transporte y organización.",
    servicio: "Tours (Guanajuato)",
  },
  {
    nombre: "Javier Muñoz",
    description:
      "Mi familia y yo usamos el servicio de traslado desde el aeropuerto y fue excelente. Puntualidad, seguridad y comodidad garantizadas.",
    servicio: "Traslado a Aeropuerto",
  },
  {
    nombre: "Paula Gómez",
    description:
      "El tour por Querétaro fue una experiencia inolvidable. Lugares hermosos, buena logística y un chofer muy atento. Definitivamente recomendado.",
    servicio: "Tours (Querétaro)",
  },
  {
    nombre: "Roberto Castro",
    description:
      "El servicio de chofer privado fue excepcional. Puntualidad y comodidad en cada trayecto. Ideal para quienes buscan una opción segura y eficiente.",
    servicio: "Chofer Privado",
  },
  {
    nombre: "Elena Vargas",
    description:
      "Contratamos el traslado para nuestra boda y fue perfecto. Todos los invitados llegaron sin problemas y el servicio fue muy profesional.",
    servicio: "Traslado para Bodas",
  },
  {
    nombre: "Daniel Ríos",
    description:
      "El traslado ejecutivo fue de primer nivel. Puntual, cómodo y muy profesional. Lo recomiendo para cualquier viaje de negocios.",
    servicio: "Traslado Ejecutivo",
  }
];


const Testimonios = () => {
  return (
    <div className="px-4 py-8 bg-white">
      <h2 className="text-3xl font-bold mb-4 text-black text-center">Testimonios</h2>
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        navigation
        breakpoints={{
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        modules={[Navigation]}
        className="w-full h-full"
      >
        {testimonios.map((tour, index) => (
          <SwiperSlide key={index}>
            <div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden">
              <img
                src={tour.image}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-gray-700 text-sm mb-4">{tour.description}</p>
                <h3 className="text-xl font-semibold mb-2">{tour.nombre}</h3>
                <h3 className="text-xl font-semibold mb-2">{tour.servicio}</h3>
                
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonios;
