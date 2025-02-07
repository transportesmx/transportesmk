import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

function Boda() {
  const handleCotizar = () => {
    const recipientEmail = "amstrekgrt@gmail.com"; // Reemplaza con tu correo de destino
    const subject = "Información para bodas"; // Asunto del correo
    const body = "Hola, me gustaría informacion sobre el servicio para una boda";
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl; // Abre el cliente de correo del usuario
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
    id="Bodas"
      className="relative bg-cover bg-center h-[1100px] md:h-[750px]"
      style={{ backgroundImage: 'url(/assets/images/bodas.png)' }}
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
            <h1 className="text-[40px] lg:text-[50px] leading-[45px] md:leading-[30px] md:text-4xl lg:text-5xl font-bold text-center md:text-left mb-8 md:mb-12">
              Traslado para Bodas
            </h1>
            <p className="text-center md:text-left text-[18px] md:text-[24px] mb-8">
              En Transportes MX entendemos la importancia de un día tan especial como tu boda. Nuestro servicio de traslado para bodas está diseñado para garantizar que los novios e invitados lleguen cómodos, puntuales y con estilo. Nos encargamos de cada detalle para que tú solo te preocupes por disfrutar.
            </p>
            <motion.ul className="space-y-4 text-sm sm:text-base md:text-lg md:hidden" variants={containerVariants}>
              <motion.li className="flex flex-col md:flex-row items-center text-[18px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/clock.png" width={38} height={38} alt="Clock" />
                Coordinación precisa para cada traslado, desde el lugar de la ceremonia hasta la recepción.
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[18px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/driver.png" width={38} height={38} alt="Driver" />
                Conductores uniformados, amables y conocedores de las rutas más eficientes.
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[18px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/bus.png" width={38} height={38} alt="Bus" />
                Transporte para grupos pequeños o grupos grandes de hasta más de 600 personas.
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[18px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/24.png" width={38} height={38} alt="Clock" />
                Ajustamos horarios, rutas y paradas según las necesidades de tu evento.
              </motion.li>
            </motion.ul>
            <div className="flex justify-center md:justify-start space-x-4 mt-8 text-xl md:text-2xl">
              <motion.button
                className="px-32 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8 md:hidden"
                onClick={handleCotizar}
                variants={itemVariants}
              >
                Cotizar
              </motion.button>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div className="hidden md:block" variants={containerVariants}>
            <ul className="space-y-4 text-sm sm:text-base md:text-lg">
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/clock.png" width={38} height={38} alt="Clock" />
                Coordinación precisa para cada traslado, desde el lugar de la ceremonia hasta la recepción.
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/driver.png" width={38} height={38} alt="Driver" />
                Conductores uniformados, amables y conocedores de las rutas más eficientes.
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/bus.png" width={38} height={38} alt="Bus" />
                Transporte para grupos pequeños o grupos grandes de hasta más de 600 personas.
              </motion.li>
              <motion.li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left" variants={itemVariants}>
                <Image src="/assets/icons/24.png" width={38} height={38} alt="Clock" />
                Ajustamos horarios, rutas y paradas según las necesidades de tu evento.
              </motion.li>
            </ul>
            <motion.button
              className="w-full px-32 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8"
              onClick={handleCotizar}
              variants={itemVariants}
            >
              Cotizar
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Boda;
