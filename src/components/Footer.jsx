import { AppContext } from '@/Context/AppContext';
import Link from 'next/link';
import { useContext } from 'react';
import { FaFacebookF, FaInstagram, FaTripadvisor, FaTiktok, FaMailBulk,  FaLocationArrow } from 'react-icons/fa';
import { FaPhone } from "react-icons/fa6";
import { IoMdMail } from 'react-icons/io';

export default function Footer() {
  const {traduccion} = useContext(AppContext);
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0 lg:px-16">
          {/* Logo y slogan */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            /> {/* Asegúrate de poner el path correcto */}
            <p className="text-lg mb-4 text-[15px] max-w-[320px]">{traduccion.footer.logoSlogan}</p>
            <p className="text-sm">{traduccion.footer.rights}</p>
          </div>

          {/* Sección de servicios */}
          <div className="flex flex-col lg:flex-row lg:space-x-12 mb-6 lg:mb-0 space-y-6 lg:space-y-0">
            <div>
              <h3 className="font-bold text-lg mb-4 text-center lg:text-left">{traduccion.footer.services.title}</h3>
              <ul className="space-y-2 text-center lg:text-left">
                <li><Link href="/#Aeropuerto"><span className="hover:text-blue-500">{traduccion.footer.services.aeropuerto}</span></Link></li>
                <li><Link href="/#Bodas"><span className="hover:text-blue-500">{traduccion.footer.services.bodas}</span></Link></li>
              
                <li><Link href="/#Chofer"><span className="hover:text-blue-500">{traduccion.footer.services.chofer}</span></Link></li>
                <li><Link href="/#Ejecutivo"><span className="hover:text-blue-500">{traduccion.footer.services.ejecutivo}</span></Link></li>
              </ul>
            </div>

          
                {/* Redes sociales */}
          <div className="flex flex-col items-center lg:items-start space-y-6 ">
            <Link href="https://www.facebook.com/TransportesTMX/">
              <span target="_blank" className=" hover:text-blue-500 flex items-center text-[15px] gap-2"> 
                <FaFacebookF /> Facebook
              </span>
            </Link>
            <Link href="https://www.tripadvisor.com.mx/Attraction_Review-g151932-d25402392-Reviews-Transportes_MX-San_Miguel_de_Allende_Central_Mexico_and_Gulf_Coast.html">
              <span target="_blank" className="text-[15px] hover:text-blue-500 flex items-center gap-2">
                <FaTripadvisor /> Tripadvisor
              </span>
            </Link>
            <Link href="https://www.instagram.com/trans_portesmx">
              <span target="_blank" className="text-[15px] hover:text-blue-500 flex items-center gap-2">
                <FaInstagram /> Instagram
              </span>
            </Link>
            <Link href="hhttps://www.tiktok.com/@transportes.mx2">
              <span target="_blank" className="text-[15px] hover:text-blue-500 flex items-center gap-2">
                <FaTiktok /> Tiktok
              </span>
            </Link>
          </div>
          
          <div className="flex flex-col items-center lg:items-start space-y-6 ">
            <a href='mailto:amstrekgrt@gmail.com '>
              <span  className=" hover:text-blue-500 flex items-center text-[15px] gap-2"> 
              <IoMdMail /> amstrekgrt@gmail.com
              </span>
            </a>
            <a href='tel:+524151393219 '>
              <span  className=" hover:text-blue-500 flex items-center text-[15px] gap-2"> 
              <FaPhone/>  +52 415 139 3219
              </span>
            </a>
              <span  className=" hover:text-blue-500 flex items-center text-[15px] gap-2"> 
              <FaLocationArrow/>  San Miguel de Allende Guanajuato
              </span>
          </div>
          </div>
        </div>
        {/* Enlaces a términos y condiciones */}
        <div className="mt-8 text-center flex flex-col lg:flex-row  lg:justify-center items-center">
          <Link href="/Terminos">
            <span className="text-sm text-gray-400 hover:text-blue-500">{traduccion.footer.links.terms}</span>
          </Link>
          <div className="mx-8 cursor-pointer hidden lg:block" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/assets/icons/arriba.png" alt="Flecha arriba" className="h-6 inline transform -translate-y-2" />
          </div>
          <Link href="/Privacidad">
            <span className="text-sm text-gray-400 hover:text-blue-500">{traduccion.footer.links.privacy}</span>
          </Link>
          <div className="mx-8 cursor-pointer  lg:hidden" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/assets/icons/arriba.png" alt="Flecha arriba" className="h-6 inline transform translate-y-4" />
          </div>                 
        </div>
      </div>
    </footer>
  );
}
