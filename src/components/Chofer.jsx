import Image from 'next/image';
import React from 'react'
import { FaBus, FaClock, FaFacebook, FaInstagram, FaTiktok, FaTripadvisor, FaTruck, FaWhatsapp } from 'react-icons/fa';

function Chofer() {

  const handleCotizar = () => {
    const phoneNumber = "524151393219"; // Reemplaza con el número de WhatsApp incluyendo el código de país (52 para México).
    const message = "Hola, me gustaría cotizar un chofer privado";
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="relative bg-cover bg-center h-[1200px] md:h-[750px]" style={{ backgroundImage: 'url(/assets/images/chofer2.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 text-white h-full ">
        <div className="h-full place-content-center grid grid-cols-1 md:grid-cols-2 md:gap-12 lg:gap-12  xl:gap-24">
          {/* Left Section */}
          <div className=''>
            <h1 className="text-[40px] lg:text-[50px] leading-[34px] md:leading-[30px] md:text-4xl lg:text-5xl font-bold text-center md:text-left mb-8 md:mb-12">
            Chofer Privado
            </h1>
            <p className='text-center md:text-left text-[20px] md:text-[24px] mb-8'>
            Nuestros vehículos con chofer privado están disponibles para uso personalizado durante el tiempo que necesites. Ya sea para recorridos dentro de la ciudad, traslados ejecutivos o viajes largos a destinos turísticos, nos adaptamos a tus planes y horarios para ofrecerte una experiencia de lujo, sin preocupaciones.
            </p>
            <ul className=" space-y-4 text-sm sm:text-base md:text-lg md:hidden">
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4  text-center md:text-left">
                <Image src="/assets/icons/diamante.png" width={38} height={38} alt="Clock"  />
                Atención personalizada para garantizar una experiencia impecable.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left">
              <Image src="/assets/icons/driver.png" width={38} height={38} alt="Clock" />                Conductores uniformados, amables y conocedores de las rutas más eficientes.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left">
              <Image src="/assets/icons/bus.png" width={38} height={38} alt="Clock" />                Amplia flota que incluye sedanes, SUVs, y vans en perfectas condiciones.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left">
              <Image src="/assets/icons/24.png" width={38} height={38} alt="Clock" />Horarios adaptados a tu agenda y paradas personalizadas según tus necesidades.
              </li>
              
            </ul>
            <div className="flex justify-center md:justify-start space-x-4 mt-8 text-xl md:text-2xl">
            <button className='px-32 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8 md:hidden'
            onClick={handleCotizar}
            >
              Cotizar
            </button>
            </div>
            
          </div>

          {/* Right Section */}
          <div className='hidden md:block'>
          <ul className=" space-y-4 text-sm sm:text-base md:text-lg">
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left">
                <Image src="/assets/icons/clock.png" width={38} height={38} alt="Clock" />
                Coordinación precisa para cada traslado, desde el lugar de la ceremonia hasta la recepción.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left">
              <Image src="/assets/icons/driver.png" width={38} height={38} alt="Clock" />                Conductores uniformados, amables y conocedores de las rutas más eficientes.
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left">
              <Image src="/assets/icons/bus.png" width={38} height={38} alt="Clock" />                Transporte para grupos pequeños o grupos grandes de hasta más de 600 personas
              </li>
              <li className="flex flex-col md:flex-row items-center text-[20px] gap-4 text-center md:text-left">
              <Image src="/assets/icons/24.png" width={38} height={38} alt="Clock" />Ajustamos horarios, rutas y paradas según las necesidades de tu evento
              </li>
              <li>
              <button className='px-32 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8 md:hidden'
              onClick={handleCotizar}
              >
              Cotizar
            </button>
              </li>
              
              
            </ul>
            <button className='w-full px-32 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8 '
            onClick={handleCotizar}
            >
              Cotizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chofer