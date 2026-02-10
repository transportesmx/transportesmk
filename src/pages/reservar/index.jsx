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
import { motion, AnimatePresence } from 'framer-motion';

const libraries = ['places'];

function ReservaFlow() {
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);

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
  const t = traduccion?.reservar?.footerInfo || {};

  const renderPaso = () => {
    switch (reserva.paso) {
      case 1: return <BuscadorServicio onNext={siguiente} isLoaded={isLoaded} />;
      case 2: return <MapaRuta onNext={siguiente} onBack={atras} isLoaded={isLoaded} />;
      case 3: return <SelectorVehiculo onNext={siguiente} onBack={atras} />;
      case 4: return <DatosCliente onNext={siguiente} onBack={atras} />;
      case 5: return <PagoCheckout onNext={siguiente} onBack={atras} />;
      case 6: return <ConfirmacionReserva />;
      default: return <BuscadorServicio onNext={siguiente} isLoaded={isLoaded} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative text-white overflow-hidden">
      {/* Fondo con imagen */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/images/sanmiguel.png)' }}
      />
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-transparent to-[#0a0a0f]/95" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Indicador de pasos */}
        {reserva.paso < 6 && <StepIndicator pasoActual={reserva.paso} />}

        {/* Paso actual con animación */}
        <AnimatePresence mode="wait">
          <motion.div
            key={reserva.paso}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderPaso()}
          </motion.div>
        </AnimatePresence>

        {/* Footer info */}
        {reserva.paso < 6 && (
          <div className="mt-10 pb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/25">
            <span>{t.secure || 'Pago seguro con Stripe'}</span>
            <span className="hidden sm:inline">·</span>
            <span>{t.reviews || '+500 reseñas positivas'}</span>
            <span className="hidden sm:inline">·</span>
            <span>{t.support || 'Soporte 24/7'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservarPage() {
  const { traduccion } = useContext(AppContext);
  return (
    <>
      <Head>
        <title>{traduccion?.reservar?.pageTitle || 'Reservar traslado'} | TransportesMX</title>
        <meta name="description" content="Reserva tu traslado en línea con TransportesMX." />
      </Head>
      <ReservaProvider>
        <ReservaFlow />
      </ReservaProvider>
    </>
  );
}
