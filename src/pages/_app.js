import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import Image from "next/image";

export default function App({ Component, pageProps }) {
  return (
    <div className="bg-black">
    <div className="bg-black max-w-[1440px] min-w-sm mx-auto text-white">
    <Navbar />
  <Component {...pageProps} />
  <Footer />
  <a href="https://wa.me/+524151393219?text=Hola!%20me%20podrías%20dar%20mas%20información?" 
        className='animate-pulse transition-all duration-700 hover:animate-none hover:scale-110 z-10 '
        style={{position: 'fixed', bottom: '25px', right: '25px', padding: '10px', backgroundColor: '#25D366', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', textDecoration: 'none'}}
        >
          <Image
          src="/assets/whatsapp.svg" alt="WhatsApp" width={100} height={100}
          
          style={{width: '48px', height: '48px'}}/>
        </a>
          </div>
    </div>
)
}
