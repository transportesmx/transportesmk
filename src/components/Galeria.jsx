import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AppContext } from "../Context/AppContext";

import Image from "next/image";



const Galeria = () => {

  const { traduccion } = useContext(AppContext);

  const [isSwiperOpen, setIsSwiperOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [swiperIndex, setSwiperIndex] = useState(0);

  const openSwiper = (images, index) => {
    setCurrentImages(images);
    setSwiperIndex(index);
    setIsSwiperOpen(true);
  };

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
      className="w-full h-full bg-white relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <Image
        src={"/assets/images/toursflores.png"}
        width={100}
        height={100}
        alt="Tours"
        className="right-0 top-0 absolute"
      />
      <Image
        src={"/assets/images/heart.png"}
        width={100}
        height={100}
        alt="Tours"
        className="left-0 bottom-0 absolute"
      />

      <motion.div className="container mx-auto px-4 py-8 bg-white" variants={itemVariants}>
        <h2 className="text-2xl font-bold text-center mb-6 text-black">Galería Visual</h2>
        <Swiper
          spaceBetween={20}
          slidesPerView={1.2}
          navigation
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3 },
            1350: { slidesPerView: 4 },
          }}
          modules={[Navigation]}
          className="w-full h-full"
        >
          {traduccion.galeria.categories .map((category, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg w-[300px] h-[550px]"
                onClick={() => openSwiper(category.categoryImages, 0)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="object-cover transition-transform duration-300 group-hover:scale-110 w-[300px] h-[550px]"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <p className="font-bold text-[40px] text-center px-4">{category.title}</p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {isSwiperOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Swiper
            navigation={true}
            modules={[Navigation]}
            initialSlide={swiperIndex}
            className="w-11/12 h-3/4"
            onSlideChange={(swiper) => setSwiperIndex(swiper.activeIndex)}
          >
            {categoryImages.map((image, idx) => (
              <SwiperSlide key={idx}>
                <Image
                  src={image}
                  alt={`Slide ${idx + 1}`}
                  layout="fill"
                  objectFit="contain"
                  className="w-full h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className="absolute top-4 right-4 text-white text-2xl font-bold"
            onClick={() => setIsSwiperOpen(false)}
          >
            ✕
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Galeria;
