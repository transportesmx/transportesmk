import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="bg-black max-w-[1440px] min-w-sm mx-auto">
    <Navbar />
  <Component {...pageProps} />
  <Footer />
    </div>
)
}
