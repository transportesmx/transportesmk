import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const slides = [
    {
      image: '/assets/images/suburban.png',
      title: 'Explora, vive y disfruta destinos inolvidables',
      description: 'Descubre la riqueza cultural y los paisajes más impresionantes con nuestros tours personalizados. Vive la magia de cada rincón con comodidad y un servicio de lujo.'
    },
    {
      image: '/assets/images/sprinter.png',
      title: 'Llegadas y salidas con puntualidad y comodidad',
      description: 'Disfruta de un traslado cómodo y seguro a los principales aeropuertos. Viaja sin preocupaciones, siempre a tiempo y con atención personalizada.'
    },
    {
      image: '/assets/images/odissey.png',
      title: 'Comodidad y seguridad garantizadas',
      description: 'Maximiza tu tiempo con un transporte exclusivo y seguro. Perfecto para reuniones de trabajo, eventos empresariales y traslados VIP.'
    },
    {
      image: '/assets/images/chofer.png',
      title: 'Comodidad y seguridad garantizadas',
      description: 'Nos aseguramos de que cada viaje sea una experiencia tranquila, cómoda y completamente segura.'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[90vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 flex items-center justify-start bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="text-white p-8 rounded-lg max-w-2xl text-center md:text-left">
            <h1 className="text-[40px] leading-[40px] md:text-5xl font-bold mb-4">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg md:text-xl">{slides[currentSlide].description}</p>
            <div className="mt-6 flex justify-center md:justify-start space-x-4">
              <button className="px-4 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition">
                Cotizar
              </button>
              <button className="px-4 py-2 border-2 border-white/50 hover:bg-blue-500 rounded-lg transition">
                Reservar
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicadores de slide */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
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
