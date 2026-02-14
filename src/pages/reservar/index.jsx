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
    <div className="min-h-[calc(100vh-64px)] relative text-white">
      {/* Fondo con imagen — sin backdrop-blur para evitar parpadeo al scroll */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: 'url(/assets/images/reservacion.png)' }}
      />
      <div className="fixed inset-0 bg-black/85" />
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

        {/* Evento especial CTA */}
        {reserva.paso < 6 && (
          <div className="mt-10 mx-auto max-w-lg">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-center">
              <p className="text-white/50 text-sm mb-3">
                {traduccion?.reservar?.specialEvent?.text || '¿Tienes un evento especial? Contáctanos'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://wa.me/524151393219?text=Hola,%20me%20gustaría%20cotizar%20un%20servicio%20para%20un%20evento%20especial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a
                  href="mailto:contacto@transportesmx.org?subject=Evento%20especial&body=Hola,%20me%20gustaría%20cotizar%20un%20servicio%20para%20un%20evento%20especial"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-white text-sm font-medium rounded-lg border border-white/[0.1] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  {traduccion?.reservar?.specialEvent?.email || 'Correo'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        {reserva.paso < 6 && (
          <div className="mt-4 pb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
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
