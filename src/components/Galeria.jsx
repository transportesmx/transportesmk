import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

const galleryData = [
  {
    title: "Traslado a Aeropuertos",
    image: "/assets/images/galeria/aeropuertos/aeropuertos.jpg",
    categoryImages:[
  "/assets/images/galeria/aeropuertos/swiper/1.jpg",
  "/assets/images/galeria/aeropuertos/swiper/2.jpg",
  "/assets/images/galeria/aeropuertos/swiper/3.jpg",
  "/assets/images/galeria/aeropuertos/swiper/4.jpg",
  "/assets/images/galeria/aeropuertos/swiper/5.jpg",
  "/assets/images/galeria/aeropuertos/swiper/6.jpg",
  "/assets/images/galeria/aeropuertos/swiper/7.jpg",
  "/assets/images/galeria/aeropuertos/swiper/8.jpg",
  "/assets/images/galeria/aeropuertos/swiper/9.jpg",
  "/assets/images/galeria/aeropuertos/swiper/10.jpg",
  "/assets/images/galeria/aeropuertos/swiper/11.jpg",
  "/assets/images/galeria/aeropuertos/swiper/12.jpg",
  "/assets/images/galeria/aeropuertos/swiper/13.jpg",
  "/assets/images/galeria/aeropuertos/swiper/14.jpg",
  "/assets/images/galeria/aeropuertos/swiper/15.jpg",
  "/assets/images/galeria/aeropuertos/swiper/16.jpg",
  "/assets/images/galeria/aeropuertos/swiper/17.jpg",
  "/assets/images/galeria/aeropuertos/swiper/18.jpg",
  "/assets/images/galeria/aeropuertos/swiper/19.jpg",
  "/assets/images/galeria/aeropuertos/swiper/20.jpg",
    ] 
  },
  {
    title: "Transporte para bodas",
    image: "/assets/images/galeria/bodas/bodas.jpg",
    categoryImages:[
      "/assets/images/galeria/bodas/swiper/1.jpg",
      "/assets/images/galeria/bodas/swiper/2.jpg",
      "/assets/images/galeria/bodas/swiper/3.jpg",
      "/assets/images/galeria/bodas/swiper/4.jpg",
      "/assets/images/galeria/bodas/swiper/5.jpg",
      "/assets/images/galeria/bodas/swiper/6.jpg"
    ] 
  },
  {
    title: "Transporte Turístico",
    image: "/assets/images/galeria/turistico/turistico.jpg",
    categoryImages: [
      "/assets/images/galeria/turistico/swiper/1.jpg",
      "/assets/images/galeria/turistico/swiper/2.jpg",
      "/assets/images/galeria/turistico/swiper/3.jpg",
      "/assets/images/galeria/turistico/swiper/4.jpg",
      "/assets/images/galeria/turistico/swiper/5.jpg",
      "/assets/images/galeria/turistico/swiper/6.jpg",
      "/assets/images/galeria/turistico/swiper/7.jpg",
      "/assets/images/galeria/turistico/swiper/8.jpg",
      "/assets/images/galeria/turistico/swiper/9.jpg",
      "/assets/images/galeria/turistico/swiper/10.jpg",
      "/assets/images/galeria/turistico/swiper/11.jpg",
      "/assets/images/galeria/turistico/swiper/12.jpg",
      "/assets/images/galeria/turistico/swiper/13.jpg",
      "/assets/images/galeria/turistico/swiper/14.jpg",
      "/assets/images/galeria/turistico/swiper/15.jpg",
      "/assets/images/galeria/turistico/swiper/16.jpg",
      "/assets/images/galeria/turistico/swiper/17.jpg",
    ]
  },
  {
    title: "Chofer Privado",
    image: "/assets/images/galeria/chofer/chofer.jpg",
    categoryImages: [
      "/assets/images/galeria/chofer/swiper/1.jpg",
      "/assets/images/galeria/chofer/swiper/2.jpg",
      "/assets/images/galeria/chofer/swiper/3.jpg",
      "/assets/images/galeria/chofer/swiper/4.jpg",
      "/assets/images/galeria/chofer/swiper/5.jpg",
      "/assets/images/galeria/chofer/swiper/6.jpg",
      "/assets/images/galeria/chofer/swiper/7.jpg",
      "/assets/images/galeria/chofer/swiper/8.jpg",
      "/assets/images/galeria/chofer/swiper/9.jpg",
      "/assets/images/galeria/chofer/swiper/10.jpg",
      "/assets/images/galeria/chofer/swiper/11.jpg",
      "/assets/images/galeria/chofer/swiper/12.jpg",
      "/assets/images/galeria/chofer/swiper/13.jpg",
      "/assets/images/galeria/chofer/swiper/14.jpg",
      "/assets/images/galeria/chofer/swiper/15.jpg",
    ]
  },
];

const Galeria = () => {
  const [isSwiperOpen, setIsSwiperOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [swiperIndex, setSwiperIndex] = useState(0);

  const openSwiper = (images, index) => {
    setCurrentImages(images);
    setSwiperIndex(index);
    setIsSwiperOpen(true);
  };

  return (
    <div className="w-full h-full bg-white relative">

<Image src={"/assets/images/toursflores.png"} width={100} height={100} alt="Tours" className="right-0 top-0 absolute" />
<Image src={"/assets/images/heart.png"} width={100} height={100} alt="Tours" className="left-0 bottom-0 absolute" />

    <div className="container mx-auto px-4 py-8 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">Galería Visual</h2>
      <div className="flex gap-4">
          <Swiper
                spaceBetween={20}
                slidesPerView={1.2}
                navigation
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                  },
                  768: {
                    slidesPerView: 2.2,
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
        {galleryData.map((category, index) => (
          <SwiperSlide key={index}>
          <div
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg w-[300px] h-[550px]"
            onClick={() => openSwiper(category.categoryImages, 0)}
            >
            <img
              src={category.image}
              alt={category.title}
              className=" object-cover transition-transform duration-300 group-hover:scale-110 w-[300px] h-[550px] "
              />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center ">
              <p className=" font-bold text-[40px] text-center px-4 ">{category.title}</p>
            </div>
          </div>
          </SwiperSlide>
        ))}
        </Swiper>
      </div>

      {isSwiperOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <Swiper
            navigation={true}
            modules={[Navigation]}
            initialSlide={swiperIndex}
            className="w-11/12 h-3/4"
            onSlideChange={(swiper) => setSwiperIndex(swiper.activeIndex)}
            >
            {currentImages.map((image, idx) => (
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
        </div>
      )}
    </div>
      </div>
  );
};

export default Galeria;
