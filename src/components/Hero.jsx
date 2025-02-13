import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroCotiza from './HeroCotiza';
import { useContext } from 'react';
import { AppContext } from '../Context/AppContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Hero = () => {
  
  const {traduccion} = useContext(AppContext);

  const handleWhatsAppClickCotizar = () => {
    const phoneNumber = "524151393219"; // Reemplaza con el número de WhatsApp incluyendo el código de país (52 para México).
    const message = "Hola, me gustaría cotizar un servicio";
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, "_blank");
  };
  const handleWhatsAppClickReservar = () => {
    const phoneNumber = "524151393219"; // Reemplaza con el número de WhatsApp incluyendo el código de país (52 para México).
    const message = "Hola, me gustaría reservar un servicio";
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, "_blank");
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % traduccion.hero.slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
    id="Hero"
    className="relative w-full h-screen lg:h-[90vh] max-h-[730px] lg:min-h-[720px] xl:min-h-[850px] overflow-hidden  ">
    <div className="hidden lg:block absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
  <FaChevronLeft
    className="text-white text-4xl cursor-pointer"
    onClick={() =>
      setCurrentSlide((prev) =>
        prev === 0 ? traduccion.hero.slides.length - 1 : prev - 1
      )
    }
  />
</div>
<div className="hidden lg:block absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
          <FaChevronRight className="text-white text-4xl cursor-pointer" onClick={() => setCurrentSlide((prev) => (prev + 1) % traduccion.hero.slides.length)} />
        </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 flex items-center lg:items-start justify-center lg:justify-start bg-cover bg-center px-4 lg:px-20 "
          style={{ backgroundImage: `url(${traduccion.hero.slides[currentSlide].image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-white lg:px-4 rounded-lg max-w-2xl  text-center md:text-left lg:mt-16">
            <h1 className="text-[32px] lg:text-[40px] xl:text-[60px] leading-[40px] md:text-5xl font-bold mb-4">
              {traduccion.hero.slides[currentSlide].title}
            </h1>
            <p className="text-lg md:text-xl md:max-w-[550px]">{traduccion.hero.slides[currentSlide].description}</p>
            <div className="mt-6 flex justify-center md:justify-start space-x-4">
              <button className="px-4 py-2 bg-white/15 backdrop-blur-sm hover:bg-gray-700 rounded-lg transition shadow-lg w-[150px] h-[50px]"
              onClick={handleWhatsAppClickCotizar}
              >
                {traduccion.hero.buttons.quote}
              </button>
              <button className="px-4 py-2 border-2 border-white/15 hover:border-white shadow-lg w-[150px] h-[50px] rounded-lg transition"
              onClick={handleWhatsAppClickReservar}
              >
               {traduccion.hero.buttons.reserve}
              </button>
            </div>
            
          </div>
        </motion.div>
      </AnimatePresence>

      <div className='hidden lg:block mt-14 absolute bottom-[70px] xl:bottom-[80px] pl-24 transform space-x-2'>
              <HeroCotiza/>
            </div>

      {/* Indicadores de slide */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {traduccion.hero.slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              currentSlide === index ? 'bg-white' : 'bg-gray-400'
            }`}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Hero;
