
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroCotiza from './HeroCotiza';
import { AppContext } from '../Context/AppContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import { useRouter } from 'next/router';

const Hero = () => {
  const { traduccion } = useContext(AppContext);
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = traduccion?.hero?.slides || [];

  const handleEmailClickCotizar = () => {
    const emailAddress = 'contacto@transportesmx.org';
    const subject = 'Cotización de servicio';
    const body = 'Hola, me gustaría cotizar un servicio';
    window.location.href =
      `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleEmailClickReservar = () => {
    router.push('/reservar');
  };

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
    onSwipedLeft: () =>
      slides.length > 0 &&
      setCurrentSlide((prev) => (prev + 1) % slides.length),
    onSwipedRight: () =>
      slides.length > 0 &&
      setCurrentSlide((prev) =>
        prev === 0 ? slides.length - 1 : prev - 1
      ),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  if (slides.length === 0) return null;

  const activeSlide = slides[currentSlide];

  return (
    <div
      id="Hero"
      {...swipeHandlers}
      className="relative isolate w-full overflow-hidden"
    >
      {/* Fondo panorámico */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${activeSlide.image}")`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {/* Oscurecimiento para mejorar la lectura */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Flecha anterior */}
      <button
        type="button"
        aria-label="Imagen anterior"
        className="hidden md:flex absolute left-4 lg:left-8 top-[30%] z-20 items-center justify-center text-white hover:text-white/70 transition"
        onClick={() =>
          setCurrentSlide((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
          )
        }
      >
        <FaChevronLeft className="text-3xl lg:text-4xl" />
      </button>

      {/* Flecha siguiente */}
      <button
        type="button"
        aria-label="Imagen siguiente"
        className="hidden md:flex absolute right-4 lg:right-8 top-[30%] z-20 items-center justify-center text-white hover:text-white/70 transition"
        onClick={() =>
          setCurrentSlide((prev) => (prev + 1) % slides.length)
        }
      >
        <FaChevronRight className="text-3xl lg:text-4xl" />
      </button>

      {/* Contenido del banner */}
      <div className="relative z-10 flex min-h-[620px] flex-col justify-between px-4 pt-20 pb-8 sm:min-h-[680px] sm:px-8 md:min-h-[720px] md:px-12 md:pt-16 lg:min-h-[760px] lg:px-20 xl:min-h-[820px] xl:px-24">
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

        {/* Indicadores */}
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
