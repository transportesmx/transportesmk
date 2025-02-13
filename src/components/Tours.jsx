import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { useContext } from "react";
import { AppContext } from "../Context/AppContext";



const handleCotizar = (tour) => {
  const phoneNumber = "524151393219"; // Reemplaza con el número de WhatsApp incluyendo el código de país (52 para México).
  const message = `Hola, me gustaría reservar el tour de ${tour.title}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
};

const Tours = () => {
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

  const {traduccion} = useContext(AppContext);

  return (
    <motion.div
    id="Tours"
      className="w-full h-full px-4 py-8 bg-white relative"
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
        src={"/assets/images/lele.png"}
        width={100}
        height={100}
        alt="Tours"
        className="left-0 bottom-0 absolute"
      />
      <motion.h2
        className="text-3xl font-bold mb-4 text-black text-center"
        variants={itemVariants}
      >
        {traduccion.tours.title}
      </motion.h2>
      <Swiper
        spaceBetween={20}
        slidesPerView={1.3}
        navigation
        breakpoints={{
          640: {
            slidesPerView: 2.5,
          },
          768: {
            slidesPerView: 2.7,
          },
          980: {
            slidesPerView: 3,
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
        {traduccion.tours.options.map((tour, index) => (
          <SwiperSlide key={index}>
            <motion.div
              className="bg-gray-100 rounded-lg shadow-lg overflow-hidden h-[550px] lg:h-[630px] w-[271px] lg:w-[321px] cursor-pointer relative"
              onClick={() => handleCotizar(tour)}
              variants={itemVariants}
            >
              <img
                src={tour.image}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              <img
                src="/assets/images/fade.png"
                alt={tour.name}
                className="w-full h-full object-cover absolute top-0 left-0"
              />
              <div className="p-4 absolute bottom-0 z-30">
                <motion.h3
                  className="text-[30px] leading-[30px] font-bold mb-2 drop-shadow-xl"
                  variants={itemVariants}
                >
                  {tour.name}
                </motion.h3>
                <motion.p
                  className="text-white text-[14px] leading-[18px] font-bold mb-4 drop-shadow-2xl"
                  variants={itemVariants}
                >
                  {tour.description}
                </motion.p>
                <ul className="space-y-1 text-[11px] sm:text-base md:text-[12px]">
                  <li className="flex flex-row items-center gap-2">
                    <Image
                      src="/assets/icons/bus.png"
                      width={22}
                      height={22}
                      alt="Bus"
                    />
                    {traduccion.tours.static.vehicle_info}
                  </li>
                  <li className="flex flex-row items-center gap-2">
                    <Image
                      src="/assets/icons/driver.png"
                      width={22}
                      height={22}
                      alt="Driver"
                    />
                    {traduccion.tours.static.driver_info}
                  </li>
                  <li className="flex flex-row items-center gap-2">
                    <Image
                      src="/assets/icons/clock.png"
                      width={22}
                      height={22}
                      alt="Clock"
                    />
                    {tour.duration}
                  </li>
                </ul>
                <div className="flex justify-end items-center">
                  <span className="text-lg font-bold text-white">
                    {tour.price}
                  </span>
                  <span className="ml-2 pt-1 text-[10px] font-bold text-white">
                    {tour.minimo}
                  </span>
                </div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default Tours;
