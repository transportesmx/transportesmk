import React from 'react';
import Formulario from './Formulario';
import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

function Aeropuerto() {
  return (
    <motion.div
    id="Aeropuerto"
      className='h-[950px]'
      style={{ backgroundImage: 'url(/assets/images/aeropuerto.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <div className='max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 h-full flex flex-col justify-center items-center lg:items-start'>
        <motion.h1
          className='text-[40px] lg:text-[50px] leading-[45px] lg:leading-[50px] font-bold mb-2 text-center'
          variants={variants}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Traslado a Aeropuerto
        </motion.h1>
        <motion.p
          className='text-lg lg:text-xl text-center px- mb-6'
          variants={variants}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Servicio personalizado, rápido y confiable.
        </motion.p>
        <motion.div
          className='w-full px-4 lg:px-0 flex flex-col justify-center items-center lg:items-start'
          variants={variants}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Formulario />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Aeropuerto;