import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { defaultCenter, mapOptions, routeOptions, calcularRuta } from '@/lib/google-maps';
import { motion } from 'framer-motion';
import { FaRoute, FaClock, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const mapContainerStyle = { width: '100%', height: '100%' };

export default function MapaRuta({ onNext, onBack, isLoaded }) {
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.step2 || {};

  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded || !reserva.origenCoords || !reserva.destinoCoords) return;

    const calcular = async () => {
      setLoading(true);
      setError('');
      try {
        const directionsService = new window.google.maps.DirectionsService();
        const result = await calcularRuta(directionsService, reserva.origenCoords, reserva.destinoCoords);
        setDirections(result.directions);
        dispatch({
          type: 'SET_RUTA',
          payload: {
            distancia: result.distance,
            distanciaMetros: result.distanceValue,
            duracion: result.duration,
            duracionSegundos: result.durationValue,
            directions: result.directions,
          },
        });
      } catch (err) {
        setError(t.errorRoute || 'No se pudo calcular la ruta.');
      } finally {
        setLoading(false);
      }
    };
    calcular();
  }, [isLoaded, reserva.origenCoords, reserva.destinoCoords]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {t.title || 'Tu ruta'}
        </h2>
        <p className="text-white/40 text-sm mt-1">
          {t.subtitle || 'Verifica antes de elegir tu vehículo'}
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-0.5 pt-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-px h-6 bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-red-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{t.pickup || 'Recogida'}</p>
              <p className="text-sm text-white/80 truncate">{reserva.origen}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{t.destination || 'Destino'}</p>
              <p className="text-sm text-white/80 truncate">{reserva.destino}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/[0.06] mb-4">
        {loading ? (
          <div className="w-full h-[320px] sm:h-[380px] bg-white/[0.02] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-white/30 text-sm">{t.calculating || 'Calculando ruta...'}</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-[320px] sm:h-[380px] bg-red-500/[0.03] flex items-center justify-center">
            <p className="text-red-400/80 text-sm text-center px-6">{error}</p>
          </div>
        ) : isLoaded ? (
          <div className="h-[320px] sm:h-[380px]">
            <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={8} options={mapOptions}>
              {directions && <DirectionsRenderer directions={directions} options={{ polylineOptions: routeOptions }} />}
            </GoogleMap>
          </div>
        ) : null}
      </div>

      {!loading && !error && reserva.distancia && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <FaRoute className="text-blue-400 text-lg mx-auto mb-1.5" />
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{t.distance || 'Distancia'}</p>
            <p className="text-xl font-bold text-white mt-0.5">{reserva.distancia}</p>
          </motion.div>

          <motion.div
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          >
            <FaClock className="text-purple-400 text-lg mx-auto mb-1.5" />
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{t.estTime || 'Tiempo est.'}</p>
            <p className="text-xl font-bold text-white mt-0.5">{reserva.duracion}</p>
          </motion.div>
        </div>
      )}

      <p className="text-white/15 text-[11px] text-center mb-5">
        {t.disclaimer || '* Los tiempos pueden variar por tráfico'}
      </p>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3 text-sm text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all flex items-center gap-2">
          <FaArrowLeft className="text-xs" /> {t.back || 'Atrás'}
        </button>
        <button onClick={onNext} disabled={loading || !!error}
          className="flex-1 py-3 bg-white text-[#0a0a0f] font-semibold rounded-lg text-sm hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {t.next || 'Elegir vehículo'}
          <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}
