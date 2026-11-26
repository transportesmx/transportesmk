import { AppContext } from '@/Context/AppContext';
import Link from 'next/link';
import { useContext } from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaTripadvisor,
  FaTiktok,
  FaLocationArrow,
  FaPhone
} from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';

export default function Footer() {
  const { traduccion } = useContext(AppContext);
  const footer = traduccion?.footer || {};

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0 lg:px-16">
          {/* Logo y slogan */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <img
              src="/assets/logo.png"
              alt="Transportes MX"
              className="h-16 mb-4 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            <p className="text-lg mb-4 text-[15px] max-w-[320px]">
              {footer.logoSlogan}
            </p>
            <p className="text-sm">
              {footer.rights?.replace('{{year}}', new Date().getFullYear())}
            </p>
          </div>

          {/* Sección de servicios */}
          <div className="flex flex-col lg:flex-row lg:space-x-12 mb-6 lg:mb-0 space-y-6 lg:space-y-0">
            <div>
              <h3 className="font-bold text-lg mb-4 text-center lg:text-left">
                {footer.services?.title}
              </h3>
              <ul className="space-y-2 text-center lg:text-left">
                <li><Link href="/#Aeropuerto"><span className="hover:text-blue-500">{footer.services?.aeropuerto}</span></Link></li>
                <li><Link href="/#Bodas"><span className="hover:text-blue-500">{footer.services?.bodas}</span></Link></li>
                <li><Link href="/#Chofer"><span className="hover:text-blue-500">{footer.services?.chofer}</span></Link></li>
                <li><Link href="/#Ejecutivo"><span className="hover:text-blue-500">{footer.services?.ejecutivo}</span></Link></li>
              </ul>
            </div>

            {/* Redes sociales */}
            <div className="flex flex-col items-center lg:items-start space-y-6">
              <a href="https://www.facebook.com/TransportesTMX/" target="_blank" rel="noopener noreferrer">
                <span className="hover:text-blue-500 flex items-center text-[15px] gap-2"><FaFacebookF /> {footer.social?.facebook}</span>
              </a>
              <a href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html" target="_blank" rel="noopener noreferrer">
                <span className="text-[15px] hover:text-blue-500 flex items-center gap-2"><FaTripadvisor /> {footer.social?.tripadvisor}</span>
              </a>
              <a href="https://www.instagram.com/trans_portesmx" target="_blank" rel="noopener noreferrer">
                <span className="text-[15px] hover:text-blue-500 flex items-center gap-2"><FaInstagram /> {footer.social?.instagram}</span>
              </a>
              <a href="https://www.tiktok.com/@transportes.mx2" target="_blank" rel="noopener noreferrer">
                <span className="text-[15px] hover:text-blue-500 flex items-center gap-2"><FaTiktok /> {footer.social?.tiktok}</span>
              </a>
            </div>

            {/* Contacto */}
            <div className="flex flex-col items-center lg:items-start space-y-6">
              <a href="mailto:contacto@transportesmx.org">
                <span className="hover:text-blue-500 flex items-center text-[15px] gap-2"><IoMdMail /> {footer.contact?.email}</span>
              </a>
              <a href="tel:+524151393219">
                <span className="hover:text-blue-500 flex items-center text-[15px] gap-2"><FaPhone /> {footer.contact?.phone}</span>
              </a>
              <span className="hover:text-blue-500 flex items-center text-[15px] gap-2">
                <FaLocationArrow /> {footer.contact?.address}
              </span>
            </div>
          </div>
        </div>

        {/* Enlaces a términos y condiciones */}
        <div className="mt-8 text-center flex flex-col lg:flex-row lg:justify-center items-center">
          <Link href="/Terminos">
            <span className="text-sm text-gray-400 hover:text-blue-500">{footer.links?.terms}</span>
          </Link>
          <div className="mx-8 cursor-pointer hidden lg:block" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/assets/icons/arriba.png" alt={footer.backToTop || 'Back to top'} className="h-6 inline transform -translate-y-2" />
          </div>
          <Link href="/Privacidad">
            <span className="text-sm text-gray-400 hover:text-blue-500">{footer.links?.privacy}</span>
          </Link>
          <div className="mx-8 cursor-pointer lg:hidden" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/assets/icons/arriba.png" alt={footer.backToTop || 'Back to top'} className="h-6 inline transform translate-y-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
