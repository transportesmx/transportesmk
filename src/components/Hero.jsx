
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroCotiza from './HeroCotiza';
import { AppContext } from '../Context/AppContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';

const Hero = () => {
  const { traduccion } = useContext(AppContext);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = traduccion?.hero?.slides || [];

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [currentSlide, slides.length]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (slides.length > 1) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    },
    onSwipedRight: () => {
      if (slides.length > 1) {
        setCurrentSlide((prev) =>
          prev === 0 ? slides.length - 1 : prev - 1
        );
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  if (slides.length === 0) return null;

  const activeSlide = slides[currentSlide];

  const previousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      id="Hero"
      {...swipeHandlers}
      className="relative isolate w-full overflow-hidden bg-neutral-900"
    >
      {/* Fondo panorámico: imagen completa sin deformación */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url("${activeSlide.image}")`,
            backgroundSize: 'contain',
            backgroundPosition: 'center center',
            backgroundColor: '#171717',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {/* Capa oscura para facilitar la lectura */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Flecha anterior */}
      <button
        type="button"
        aria-label="Imagen anterior"
        className="hidden md:flex absolute left-4 lg:left-8 top-[30%] z-20 items-center justify-center text-white hover:text-white/70 transition"
        onClick={previousSlide}
      >
        <FaChevronLeft className="text-3xl lg:text-4xl" />
      </button>

      {/* Flecha siguiente */}
      <button
        type="button"
        aria-label="Imagen siguiente"
        className="hidden md:flex absolute right-4 lg:right-8 top-[30%] z-20 items-center justify-center text-white hover:text-white/70 transition"
        onClick={nextSlide}
      >
        <FaChevronRight className="text-3xl lg:text-4xl" />
      </button>

      {/* Banner con mayor altura */}
      <div className="relative z-10 flex min-h-[700px] flex-col justify-between px-4 pt-20 pb-8 sm:min-h-[760px] sm:px-8 md:min-h-[820px] md:px-12 md:pt-16 lg:min-h-[880px] lg:px-20 xl:min-h-[920px] xl:px-24">
        {/* Título y descripción */}
        <div className="w-full max-w-2xl flex-shrink-0 text-center text-white lg:text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mb-2 text-[26px] font-bold leading-tight sm:text-[30px] md:mb-4 md:text-[36px] lg:text-[40px] xl:text-[56px]">
                {activeSlide.title}
              </h1>

              <p className="mx-auto max-w-[500px] text-sm leading-relaxed text-white/90 sm:text-base md:text-lg lg:mx-0 lg:text-xl">
                {activeSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Formulario de cotización */}
        <div className="mt-6 lg:mt-0">
          <HeroCotiza />
        </div>

        {/* Indicadores del carrusel */}
        <div className="mt-4 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                currentSlide === index ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Mostrar imagen ${index + 1}`}
              aria-current={currentSlide === index ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
