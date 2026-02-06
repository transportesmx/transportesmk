import React, { useCallback, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { ReservaProvider, useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import StepIndicator from '@/components/reserva/StepIndicator';
import BuscadorServicio from '@/components/reserva/BuscadorServicio';
import MapaRuta from '@/components/reserva/MapaRuta';
import SelectorVehiculo from '@/components/reserva/SelectorVehiculo';
import DatosCliente from '@/components/reserva/DatosCliente';
import PagoCheckout from '@/components/reserva/PagoCheckout';
import ConfirmacionReserva from '@/components/reserva/ConfirmacionReserva';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaStar, FaHeadset, FaWhatsapp } from 'react-icons/fa';

const libraries = ['places'];

function TrustBadges() {
  const { idioma } = useContext(AppContext);
  const isEN = idioma.nombre === 'EN';
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 mb-4 text-xs md:text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <FaShieldAlt className="text-green-400" />
        <span>{isEN ? 'Secure payment' : 'Pago 100% seguro'}</span>
      </div>
      <div className="flex items-center gap-2">
        <FaStar className="text-yellow-400" />
        <span>{isEN ? '+500 reviews on TripAdvisor' : '+500 reseñas en TripAdvisor'}</span>
      </div>
      <div className="flex items-center gap-2">
        <FaHeadset className="text-blue-400" />
        <span>{isEN ? '24/7 support' : 'Soporte 24/7'}</span>
      </div>
    </div>
  );
}

function ReservaFlow() {
  const { reserva, dispatch } = useReserva();
  const { idioma } = useContext(AppContext);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const irAPaso = useCallback(
    (paso) => {
      dispatch({ type: 'SET_PASO', payload: paso });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [dispatch]
  );

  const siguiente = () => irAPaso(reserva.paso + 1);
  const atras = () => irAPaso(reserva.paso - 1);

  const renderPaso = () => {
    switch (reserva.paso) {
      case 1:
        return <BuscadorServicio onNext={siguiente} isLoaded={isLoaded} />;
      case 2:
        return <MapaRuta onNext={siguiente} onBack={atras} isLoaded={isLoaded} />;
      case 3:
        return <SelectorVehiculo onNext={siguiente} onBack={atras} />;
      case 4:
        return <DatosCliente onNext={siguiente} onBack={atras} />;
      case 5:
        return <PagoCheckout onNext={siguiente} onBack={atras} />;
      case 6:
        return <ConfirmacionReserva />;
      default:
        return <BuscadorServicio onNext={siguiente} isLoaded={isLoaded} />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background con imagen */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/images/aeropuerto.png)' }}
      />
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Contenido */}
      <div className="relative z-10 py-6 md:py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <img
                src="/assets/logo.png"
                alt="TransportesMX"
                className="h-8 md:h-10 cursor-pointer hover:opacity-80 transition"
              />
            </Link>
            <a
              href="https://wa.me/524151393219"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs md:text-sm bg-green-600/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-full hover:bg-green-600/30 transition"
            >
              <FaWhatsapp />
              <span className="hidden sm:inline">
                {idioma.nombre === 'EN' ? 'Need help?' : '¿Necesitas ayuda?'}
              </span>
            </a>
          </div>

          {/* Step indicator */}
          <StepIndicator pasoActual={reserva.paso} />

          {/* Contenido del paso actual con animación */}
          <AnimatePresence mode="wait">
            <motion.div
              key={reserva.paso}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPaso()}
            </motion.div>
          </AnimatePresence>

          {/* Trust badges */}
          {reserva.paso < 6 && <TrustBadges />}
        </div>
      </div>
    </div>
  );
}

export default function ReservarPage() {
  return (
    <>
      <Head>
        <title>Reservar traslado | TransportesMX</title>
        <meta
          name="description"
          content="Reserva tu traslado en línea con TransportesMX. Precio inmediato, pago seguro y confirmación automática."
        />
      </Head>
      <ReservaProvider>
        <ReservaFlow />
      </ReservaProvider>
    </>
  );
}
