import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AppContext } from "../Context/AppContext";






const Testimonios = () => {

  const { traduccion } = useContext(AppContext);

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
      {traduccion.testimonios.title}
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
        {traduccion.testimonios.reviews.map((testimonio, index) => (
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
