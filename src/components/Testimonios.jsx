import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

const testimonios = [
  {
    nombre: "Ana Martínez",
    description:
      "El traslado desde el aeropuerto fue impecable. El chofer me recibió puntualmente, el vehículo estaba en perfectas condiciones y el viaje fue muy cómodo. Definitivamente lo volveré a contratar.",
    usuario:"/assets/images/testimonios/usuario1.png",
      servicio: "Traslado a Aeropuerto",
    imagen: "/assets/images/testimonios/1.png",
  },
  {
    nombre: "Carlos Ramírez",
    description:
      "El servicio de chofer privado fue excelente. Puntualidad, comodidad y un trato muy profesional. Me permitió enfocarme en mis reuniones sin preocuparme por el tráfico.",
    usuario:"/assets/images/testimonios/usuario2.png",
      servicio: "Chofer Privado",
    imagen: "/assets/images/testimonios/2.png",

  },
  {
    nombre: "María Hernández",
    description:
      "Contratamos el traslado para nuestra boda y fue una gran decisión. Todo estuvo perfectamente coordinado y nuestros invitados llegaron cómodos y a tiempo. Un servicio de primera.",
    usuario:"/assets/images/testimonios/usuario3.png",
      servicio: "Traslado para Bodas",
    imagen: "/assets/images/testimonios/3.png",

  },
  {
    nombre: "Luis Gómez",
    description:
      "El tour a San Miguel de Allende fue increíble. Nos llevó a todos los lugares emblemáticos y nos ayudó a aprovechar al máximo nuestro día. Una experiencia que repetiría sin dudar.",
        imagen: "/assets/images/testimonios/4.png",
      usuario:"/assets/images/testimonios/usuario4.png",
        servicio: "Tours (San Miguel de Allende)",
  },
  {
    nombre: "Eduardo Torres",
    description:
      "El traslado ejecutivo fue impecable. El chofer fue puntual, la camioneta estaba en perfectas condiciones y el servicio fue muy profesional. Lo recomiendo ampliamente para viajes de negocios.",
        imagen: "/assets/images/testimonios/5.png",
      usuario:"/assets/images/testimonios/usuario5.png",
        servicio: "Traslado Ejecutivo",
  },
  {
    nombre: "Laura Sánchez",
    description:
      "El tour por los viñedos fue una experiencia increíble. El transporte fue muy cómodo, el chofer muy amable y atento. Todo estuvo bien organizado. Sin duda lo volveré a hacer.",
        imagen: "/assets/images/testimonios/6.png",
      usuario:"/assets/images/testimonios/usuario6.png",
        servicio: "Tours (Ruta de Viñedos)",
  },
  {
    nombre: "Fernando Pérez",
    description:
      "Un servicio de primera. Me recogieron puntualmente y el traslado fue muy seguro y eficiente. Perfecto para viajes largos o de negocios.",
        imagen: "/assets/images/testimonios/7.png",
      usuario:"/assets/images/testimonios/usuario7.png",
        servicio: "Chofer Privado",
  },
  {
    nombre: "Alejandra Ruiz",
    description:
      "Reservamos el transporte para la boda de mi hermana y fue perfecto. Puntualidad, elegancia y comodidad en cada traslado. Superó nuestras expectativas.",
        imagen: "/assets/images/testimonios/8.png",
      usuario:"/assets/images/testimonios/usuario8.png",
        servicio: "Traslado para Bodas",
  },
  {
    nombre: "Ricardo López",
    description:
      "Necesitaba un servicio ejecutivo de calidad y lo encontré aquí. La camioneta estaba impecable y el chofer fue muy profesional. Ideal para reuniones de negocios.",
        imagen: "/assets/images/testimonios/9.png",
      usuario:"/assets/images/testimonios/usuario9.png",
        servicio: "Traslado Ejecutivo",
  },
  {
    nombre: "Sofía Torres",
    description:
      "El tour por Guanajuato fue espectacular. Aprendimos mucho sobre la historia del lugar y disfrutamos cada parada. Excelente transporte y organización.",
        imagen: "/assets/images/testimonios/10.png",
      usuario:"/assets/images/testimonios/usuario11.png",
        servicio: "Tours (Guanajuato)",
  },
  {
    nombre: "Javier Muñoz",
    description:
      "Mi familia y yo usamos el servicio de traslado desde el aeropuerto y fue excelente. Puntualidad, seguridad y comodidad garantizadas.",
        imagen: "/assets/images/testimonios/11.png",
      usuario:"/assets/images/testimonios/usuario10.png",
        servicio: "Traslado a Aeropuerto",
  },
  {
    nombre: "Paula Gómez",
    description:
      "El tour por Querétaro fue una experiencia inolvidable. Lugares hermosos, buena logística y un chofer muy atento. Definitivamente recomendado.",
        imagen: "/assets/images/testimonios/12.png",
      usuario:"/assets/images/testimonios/usuario12.png",
        servicio: "Tours (Querétaro)",
  },
  {
    nombre: "Roberto Castro",
    description:
      "El servicio de chofer privado fue excepcional. Puntualidad y comodidad en cada trayecto. Ideal para quienes buscan una opción segura y eficiente.",
        imagen: "/assets/images/testimonios/13.png",
      usuario:"/assets/images/testimonios/usuario13.png",
        servicio: "Chofer Privado",
  },
  {
    nombre: "Elena Vargas",
    description:
      "Contratamos el traslado para nuestra boda y fue perfecto. Todos los invitados llegaron sin problemas y el servicio fue muy profesional.",
        imagen: "/assets/images/testimonios/14.png",
      usuario:"/assets/images/testimonios/usuario14.png",
        servicio: "Traslado para Bodas",
  },
  {
    nombre: "Daniel Ríos",
    description:
      "El traslado ejecutivo fue de primer nivel. Puntual, cómodo y muy profesional. Lo recomiendo para cualquier viaje de negocios.",
        imagen: "/assets/images/testimonios/15.png",
      usuario:"/assets/images/testimonios/usuario15.png",
        servicio: "Traslado Ejecutivo",
  }
];


const Testimonios = () => {
  return (
    <div className="px-4 py-8 bg-white"
    style={{backgroundImage: 'url(/assets/images/testimonios.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}
    >
      <h2 className="text-3xl font-bold mb-4 text-white text-center">Testimonios</h2>
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
            <div className="w-[353px] h-[621px] flex flex-col justify-center items-center">
              
            <div className="bg-white/15 rounded-lg shadow-lg  rounded-tl-[8px] rounded-tr-[48px] rounded-br-[8px] rounded-bl-[48px] h-[268px] w-[274px] relative">

            <Image src={tour.usuario} alt={tour.usuario} width={72} height={72} className="w-[72px] h-[72px] absolute left-0 right-0 mx-auto -top-10 rounded-full" />
              
              <div className="p-4 text-center">
              <h3 className="text-[16px] font-bold mt-6">{tour.nombre}</h3>
              <h3 className="text-[10px]  mb-2">{tour.servicio}</h3>
                <p className=" text-[14px] mb-4">{tour.description}</p>
                {[...Array(5)].map((_, i) => (
                  <img key={i} src="/assets/icons/star.png" alt="star" className="w-4 h-4 inline-block" />
                ))}                
              </div>
            </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonios;
