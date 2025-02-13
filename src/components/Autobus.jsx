import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import { FaBus, FaUserTie, FaMusic, FaClock } from 'react-icons/fa'; // Íconos para el servicio
import { useContext } from 'react';
import { AppContext } from '../Context/AppContext';

function Autobus() {
  
  const { traduccion } = useContext(AppContext);

  const handleCotizar = () => {
    const recipientEmail = "amstrekgrt@gmail.com"; // Correo destino
    const subject = "Información sobre Transporte en Autobús";
    const body = "Hola, me gustaría obtener más información sobre el servicio de transporte en autobús.";
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl; // Abre el cliente de correo
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
      id="Autobus"
      className="relative bg-cover bg-center h-[1200px] md:h-[750px]"
      style={{ backgroundImage: 'url(/assets/images/autobus.png)' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 text-white h-full">
        <div className="h-full place-content-center grid grid-cols-1 md:grid-cols-2 md:gap-12 lg:gap-12 xl:gap-24">
          {/* Left Section */}
          <motion.div variants={itemVariants}>
            <h1 className="text-[40px] lg:text-[50px] leading-[34px] md:leading-[30px] md:text-4xl lg:text-5xl font-bold text-center md:text-left mb-8 md:mb-12">
              {traduccion.autobus.title}
            </h1>
            <p className="text-center md:text-left text-[20px] md:text-[24px] mb-8">
             {traduccion.autobus.description}
            </p>
            <motion.ul
              className="space-y-4 text-sm sm:text-base md:text-lg md:hidden"
              variants={containerVariants}
            >
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaBus className="text-3xl text-white" />
                {traduccion.autobus.features[0].text}
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaUserTie className="text-3xl text-white" />
                {traduccion.autobus.features[1].text}
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaMusic className="text-3xl text-white" />
                {traduccion.autobus.features[2].text}
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaClock className="text-3xl text-white" />
                {traduccion.autobus.features[3].text}
              </motion.li>
            </motion.ul>
            <div className="flex justify-center md:justify-start space-x-4 mt-8 text-xl md:text-2xl">
              <motion.button
                className="px-32 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8 md:hidden"
                onClick={handleCotizar}
                variants={itemVariants}
              >
              {traduccion.autobus.buttons.quote}
              </motion.button>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div className="hidden md:block" variants={containerVariants}>
            <ul className="space-y-4 text-sm sm:text-base md:text-lg">
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaBus className="text-3xl text-white" />
                {traduccion.autobus.features[0].text}
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaUserTie className="text-3xl text-white" />
                {traduccion.autobus.features[1].text}
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaMusic className="text-3xl text-white" />
                {traduccion.autobus.features[2].text}
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <FaClock className="text-3xl text-white" />
                {traduccion.autobus.features[3].text}
              </motion.li>
            </ul>
            <motion.button
              className="w-full px-32 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8"
              onClick={handleCotizar}
              variants={itemVariants}
            >
              {traduccion.autobus.buttons.quote}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Autobus;
