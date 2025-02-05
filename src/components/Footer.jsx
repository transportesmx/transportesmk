import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTripadvisor, FaTiktok } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0 lg:px-16">
          {/* Logo y slogan */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4" /> {/* Asegúrate de poner el path correcto */}
            <p className="text-lg mb-4 text-[15px] max-w-[320px]">Viaja con comodidad, puntualidad y la mejor atención. ¡Cotiza tu traslado ahora!</p>
            <p className="text-sm">© 2025. Transportes TMX. Todos los derechos reservados.</p>
          </div>

          {/* Sección de servicios */}
          <div className="flex flex-col lg:flex-row lg:space-x-12 mb-6 lg:mb-0 space-y-6 lg:space-y-0">
            <div>
              <h3 className="font-bold text-lg mb-4 text-center lg:text-left">Servicios</h3>
              <ul className="space-y-2 text-center lg:text-left">
                <li><Link href="/traslados-a-aeropuerto"><span className="hover:text-blue-500">Traslados a Aeropuerto</span></Link></li>
                <li><Link href="/transporte-para-bodas"><span className="hover:text-blue-500">Transporte para bodas</span></Link></li>
                <li><Link href="/transporte-turistico"><span className="hover:text-blue-500">Transporte Turístico</span></Link></li>
                <li><Link href="/chofer-privado"><span className="hover:text-blue-500">Chofer Privado</span></Link></li>
                <li><Link href="/transporte-ejecutivo"><span className="hover:text-blue-500">Transporte Ejecutivo</span></Link></li>
              </ul>
            </div>

            {/* Sección de links */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-center lg:text-left">Inicio</h3>
              <ul className="space-y-2 text-center lg:text-left">
                <li><Link href="/acerca"><span className="hover:text-blue-500">Acerca</span></Link></li>
                <li><Link href="/servicios"><span className="hover:text-blue-500">Servicios</span></Link></li>
                <li><Link href="/tours"><span className="hover:text-blue-500">Tours</span></Link></li>
                <li><Link href="/cotiza"><span className="hover:text-blue-500">Cotiza</span></Link></li>
              </ul>
            </div>
                {/* Redes sociales */}
          <div className="flex flex-col items-center lg:items-start space-y-6 ">
            <Link href="https://www.facebook.com">
              <span target="_blank" className=" hover:text-blue-500 flex items-center text-[15px] gap-2">
                <FaFacebookF /> Facebook
              </span>
            </Link>
            <Link href="https://www.tripadvisor.com">
              <span target="_blank" className="text-[15px] hover:text-blue-500 flex items-center gap-2">
                <FaTripadvisor /> Tripadvisor
              </span>
            </Link>
            <Link href="https://www.instagram.com">
              <span target="_blank" className="text-[15px] hover:text-blue-500 flex items-center gap-2">
                <FaInstagram /> Instagram
              </span>
            </Link>
            <Link href="https://www.tiktok.com">
              <span target="_blank" className="text-[15px] hover:text-blue-500 flex items-center gap-2">
                <FaTiktok /> Tiktok
              </span>
            </Link>
          </div>
          </div>

      
        </div>

        {/* Enlaces a términos y condiciones */}
        <div className="mt-8 text-center">
          <Link href="/terminos-y-condiciones">
            <span className="text-sm text-gray-400 hover:text-blue-500">Términos y condiciones</span>
          </Link>
          <span className="mx-2">|</span>
          <Link href="/politica-de-privacidad">
            <span className="text-sm text-gray-400 hover:text-blue-500">Política de Privacidad</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
