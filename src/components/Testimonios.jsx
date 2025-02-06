import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { motion } from "framer-motion";


const testimonios = [
  {
    nombre: "Ana Martínez",
    description:
      "Reservamos transporte a Monterrey para visas de trabajo en EE.UU. Todo salió excelente, muy puntuales y con experiencia en trayectos largos.",
    usuario: "/assets/images/testimonios/usuario2.png",
    servicio: "Traslado a Aeropuerto",
    imagen: "/assets/images/testimonios/1.png",
  },
  {
    nombre: "Carlos Ramírez",
    description:
      "Tienen vehículos para todas las necesidades. Hemos viajado varias veces a San Miguel y siempre nos sentimos seguros reservando con ellos.",
    usuario: "/assets/images/testimonios/usuario4.png",
    servicio: "Chofer Privado",
    imagen: "/assets/images/testimonios/2.png",
  },
  {
    nombre: "María Hernández",
    description:
      "Somos una empresa de wedding planners y llevamos años trabajando con ellos. Siempre puntuales, profesionales y con excelente trato.",
    usuario: "/assets/images/testimonios/usuario3.png",
    servicio: "Traslado para Bodas",
    imagen: "/assets/images/testimonios/3.png",
  },
  {
    nombre: "Luis Gómez",
    description:
      "El tour a San Miguel fue increíble. Visitamos lugares emblemáticos y aprovechamos al máximo nuestro día. Sin duda lo repetiría.",
    imagen: "/assets/images/testimonios/4.png",
    usuario: "/assets/images/testimonios/usuario1.png",
    servicio: "Tours (San Miguel de Allende)",
  },
  {
    nombre: "Eduardo Torres",
    description:
      "El traslado ejecutivo fue impecable. Puntualidad, comodidad y un servicio profesional. Ideal para viajes de negocios.",
    imagen: "/assets/images/testimonios/5.png",
    usuario: "/assets/images/testimonios/usuario21.png",
    servicio: "Traslado Ejecutivo",
  },
  {
    nombre: "Laura Sánchez",
    description:
      "El tour por los viñedos fue una gran experiencia. Transporte cómodo, chofer amable y todo bien organizado. Lo volveré a hacer.",
    imagen: "/assets/images/testimonios/6.png",
    usuario: "/assets/images/testimonios/usuario5.png",
    servicio: "Tours (Ruta de Viñedos)",
  },
  {
    nombre: "Fernando Pérez",
    description:
      "Un servicio de primera. Me recogieron puntualmente y el traslado fue seguro y eficiente. Perfecto para viajes largos.",
    imagen: "/assets/images/testimonios/7.png",
    usuario: "/assets/images/testimonios/usuario13.png",
    servicio: "Chofer Privado",
  },
  {
    nombre: "Alejandra Ruiz",
    description:
      "Viajamos desde California y llegamos en distintos vuelos. Nos recogieron puntualmente y todo fue excelente. Hicimos excursiones a viñedos.",
    imagen: "/assets/images/testimonios/8.png",
    usuario: "/assets/images/testimonios/usuario9.png",
    servicio: "Traslado para Bodas",
  },
  {
    nombre: "Ricardo López",
    description:
      "Viajamos a San Miguel cada año desde EE.UU. Siempre contratamos sus traslados y el servicio es excelente. 100% recomendado.",
    imagen: "/assets/images/testimonios/9.png",
    usuario: "/assets/images/testimonios/usuario8.png",
    servicio: "Traslado Ejecutivo",
  },
  {
    nombre: "Sofía Torres",
    description:
      "Contratamos el tour a Guanajuato y visitamos muchos lugares sin perder tiempo. Muy buena organización y excelente experiencia.",
    imagen: "/assets/images/testimonios/10.png",
    usuario: "/assets/images/testimonios/usuario11.png",
    servicio: "Tours (Guanajuato)",
  },
  {
    nombre: "Javier Muñoz",
    description:
      "Mi familia y yo usamos el servicio de traslado desde el aeropuerto y fue excelente. Puntualidad, seguridad y comodidad garantizadas.",
    imagen: "/assets/images/testimonios/11.png",
    usuario: "/assets/images/testimonios/usuario10.png",
    servicio: "Traslado a Aeropuerto",
  },
  {
    nombre: "Paula Gómez",
    description:
      "El tour por Querétaro fue una experiencia inolvidable. Lugares hermosos, excelente logística y un chofer muy atento. Recomendado.",
    imagen: "/assets/images/testimonios/12.png",
    usuario: "/assets/images/testimonios/usuario12.png",
    servicio: "Tours (Querétaro)",
  },
  {
    nombre: "Roberto Castro",
    description:
      "Contratamos un chofer privado para visitar varias empresas agrícolas. Puntual, servicial y conocedor de las rutas.",
    imagen: "/assets/images/testimonios/13.png",
    usuario: "/assets/images/testimonios/usuario27.png",
    servicio: "Chofer Privado",
  },
  {
    nombre: "Ismael Serrano",
    description:
      "Contratamos su servicio para nuestra boda con 350 invitados. Coordinación impecable y traslados puntuales. Muy recomendados.",
    imagen: "/assets/images/testimonios/14.png",
    usuario: "/assets/images/testimonios/usuario25.png",
    servicio: "Traslado para Bodas",
  },
  {
    nombre: "Daniel Ríos",
    description:
      "El traslado ejecutivo fue de primer nivel. Puntual, cómodo y profesional. Lo recomiendo ampliamente para viajes de negocios.",
    imagen: "/assets/images/testimonios/15.png",
    usuario: "/assets/images/testimonios/usuario22.png",
    servicio: "Traslado Ejecutivo",
  },
];



const Testimonios = () => {

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
    className="px-4 py-8 bg-white"
    style={{
      backgroundImage: "url(/assets/images/testimonios.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={containerVariants}
  >
    <motion.h2
      className="text-3xl font-bold mb-4 text-white text-center"
      variants={itemVariants}
    >
      Testimonios
    </motion.h2>
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
          1350: {
            slidesPerView: 4,
          },
        }}
        modules={[Navigation]}
        className="w-full h-full"
      >
        {testimonios.map((testimonio, index) => (
        <SwiperSlide key={index}>
        <motion.div
          className="w-full h-[380px] flex flex-col justify-center items-center"
          variants={itemVariants}
        >
          <motion.div
            className="bg-white text-black rounded-lg shadow-lg rounded-tl-[8px] rounded-tr-[48px] rounded-br-[8px] rounded-bl-[48px] h-[268px] w-[274px] relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={testimonio.usuario}
              alt={testimonio.usuario}
              width={72}
              height={72}
              className="w-[72px] h-[72px] absolute left-0 right-0 mx-auto -top-10 rounded-full"
            />
            <div className="p-4 text-center">
              <h3 className="text-[16px] font-bold mt-6">{testimonio.nombre}</h3>
              <h3 className="text-[10px] mb-2">{testimonio.servicio}</h3>
              <p className="text-[14px] mb-4 h-[120px]">{testimonio.description}</p>
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src="/assets/icons/star.png"
                  alt="star"
                  className="w-4 h-4 inline-block"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default Testimonios;
