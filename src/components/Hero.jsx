import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroCotiza from './HeroCotiza';
import { useContext } from 'react';
import { AppContext } from '../Context/AppContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import { useRouter } from 'next/router';


const Hero = () => {
  
  const {traduccion} = useContext(AppContext);
  const router = useRouter();

  const handleEmailClickCotizar = () => {
    const emailAddress = "contacto@transportesmx.org";
    const subject = "Cotización de servicio";
    const body = "Hola, me gustaría cotizar un servicio";
    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleEmailClickReservar = () => {
    router.push('/reservar');
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % traduccion.hero.slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentSlide(prev => (prev + 1) % traduccion.hero.slides.length),
    onSwipedRight: () =>
      setCurrentSlide(prev =>
        prev === 0 ? traduccion.hero.slides.length - 1 : prev - 1
      ),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });


  return (
    <div
    id="Hero"
    {...swipeHandlers}
    className="relative w-full overflow-hidden"
    >
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${traduccion.hero.slides[currentSlide].image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/30" />

      {/* Flechas navegación */}
      <div className="hidden md:block absolute left-4 lg:left-8 top-[30%] z-10">
        <FaChevronLeft
          className="text-white text-3xl lg:text-4xl cursor-pointer hover:text-white/70 transition"
          onClick={() =>
            setCurrentSlide((prev) =>
              prev === 0 ? traduccion.hero.slides.length - 1 : prev - 1
            )
          }
        />
      </div>
      <div className="hidden md:block absolute right-4 lg:right-8 top-[30%] z-10">
        <FaChevronRight
          className="text-white text-3xl lg:text-4xl cursor-pointer hover:text-white/70 transition"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % traduccion.hero.slides.length)}
        />
      </div>

      {/* Contenido: texto arriba + formulario abajo */}
      <div className="relative z-[5] flex flex-col justify-between min-h-[600px] sm:min-h-[620px] md:min-h-[650px] lg:min-h-[680px] xl:min-h-[780px] px-4 sm:px-8 md:px-12 lg:px-20 xl:px-24 pt-20 md:pt-16 pb-10">
        {/* Texto del slide */}
        <div className="text-white max-w-2xl mx-auto lg:mx-0 text-center lg:text-left flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-[26px] sm:text-[30px] md:text-[36px] lg:text-[40px] xl:text-[56px] leading-tight font-bold mb-2 md:mb-4">
                {traduccion.hero.slides[currentSlide].title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-[500px] mx-auto lg:mx-0 text-white/90 leading-relaxed">
                {traduccion.hero.slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Formulario */}
        <div className="mt-6 lg:mt-0">
          <HeroCotiza />
        </div>

        {/* Indicadores de slide */}
        <div className="flex justify-center space-x-2 mt-4">
          {traduccion.hero.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition ${
                currentSlide === index ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
