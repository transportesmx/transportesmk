import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";

const tours = [
  {
    title: "Guanajuato",
    description:
      "Descubre los túneles de Guanajuato y disfruta la vista desde el Mirador del Pípila. Visita el Teatro Juárez, la Universidad de Guanajuato y la Alhóndiga de Granaditas. Sumérgete en la historia en el Museo de las Momias y la Iglesia de San Cayetano (Valenciana). No te pierdas el místico Museo de la Santa Inquisición ni el romántico Callejón del Beso.",
    price: "$1,750 x persona",
    duration: "8 hrs aprox.",
    image: "/path-to-guanajuato-image.jpg",
  },
  {
    title: "San Miguel De Allende",
    description:
      "Recorre el Santuario de Jesús Nazareno en Atotonilco, conocido como la 'Capilla Sixtina de México'. Descubre arte y diseño en la Fábrica La Aurora y disfruta del colorido Mercado de Artesanías Lucas Balderas. Admira la ciudad desde el Mirador, relájate en el Parque Juárez y conoce la historia en los Lavaderos del Chorro.",
    price: "$2,850 x persona",
    duration: "4 hrs aprox.",
    image: "/path-to-san-miguel-image.jpg",
  },
  {
    title: "Dolores, Hidalgo",
    description:
      "Visita el Santuario de Atotonilco y el Mausoleo de José Alfredo Jiménez con degustación de rompope y mezcal. Recorre la Avenida de la Cerámica y la Iglesia del Grito de Independencia. Disfruta las nieves típicas.",
    price: "$2,500 x persona",
    duration: "6 hrs aprox.",
    image: "/path-to-dolores-hidalgo-image.jpg",
  },
  {
    title: "Querétaro",
    description:
      "Explora el Acueducto de Querétaro, recorre el Centro Histórico y disfruta de las casonas coloniales. Prueba la deliciosa gastronomía y conoce los viñedos y queserías cercanos.",
    price: "$2,300 x persona",
    duration: "5 hrs aprox.",
    image: "/path-to-queretaro-image.jpg",
  },
];

const Tours = () => {
  return (
    <div className="px-4 py-8 bg-white">
      <h2 className="text-3xl font-bold mb-4 text-black">Tours</h2>
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
        {tours.map((tour, index) => (
          <SwiperSlide key={index}>
            <div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden">
              <img
                src={tour.image}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{tour.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-indigo-600">{tour.price}</span>
                  <span className="text-sm text-gray-500">{tour.duration}</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Tours;
