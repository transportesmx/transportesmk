import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { defaultCenter, mapOptions, routeOptions, calcularRuta } from '@/lib/google-maps';
import { motion } from 'framer-motion';
import { FaRoute, FaClock, FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const mapContainerStyle = {
  width: '100%',
  height: '380px',
  borderRadius: '16px',
};

export default function MapaRuta({ onNext, onBack, isLoaded }) {
  const { reserva, dispatch } = useReserva();
  const { idioma } = useContext(AppContext);
  const isEN = idioma.nombre === 'EN';

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
        setError(isEN ? 'Could not calculate route.' : 'No se pudo calcular la ruta.');
      } finally {
        setLoading(false);
      }
    };
    calcular();
  }, [isLoaded, reserva.origenCoords, reserva.destinoCoords]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        className="rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-600 p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-center">
            {isEN ? 'Your route' : 'Tu ruta'}
          </h2>
          <p className="text-blue-200 text-center text-sm mt-1">
            {isEN ? 'Review your route before choosing a vehicle' : 'Revisa tu ruta antes de elegir vehículo'}
          </p>
        </div>

        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 p-5 md:p-6 border border-white/5 border-t-0">
          {/* Origen → Destino */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
              <div className="w-px h-8 bg-gradient-to-b from-green-400 to-red-400" />
              <div className="w-3 h-3 rounded-full bg-red-400 shadow-lg shadow-red-400/50" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{isEN ? 'Pickup' : 'Recogida'}</p>
                <p className="text-sm text-white font-medium truncate">{reserva.origen}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{isEN ? 'Destination' : 'Destino'}</p>
                <p className="text-sm text-white font-medium truncate">{reserva.destino}</p>
              </div>
            </div>
          </div>

          {/* Mapa */}
          {loading ? (
            <div className="w-full h-[380px] rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-blue-500/30 rounded-full" />
                  <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
                </div>
                <p className="text-gray-400 text-sm font-medium">
                  {isEN ? 'Calculating your route...' : 'Calculando tu ruta...'}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-[380px] rounded-2xl bg-red-500/5 flex items-center justify-center border border-red-500/20">
              <p className="text-red-400 text-center px-6">{error}</p>
            </div>
          ) : isLoaded ? (
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={8} options={mapOptions}>
                {directions && <DirectionsRenderer directions={directions} options={{ polylineOptions: routeOptions }} />}
              </GoogleMap>
            </div>
          ) : null}

          {/* Datos de distancia y tiempo */}
          {!loading && !error && reserva.distancia && (
            <div className="grid grid-cols-2 gap-4 mt-5">
              <motion.div
                className="relative overflow-hidden rounded-2xl p-5 text-center border border-blue-500/20"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-800/10" />
                <div className="relative z-10">
                  <FaRoute className="text-blue-400 text-2xl mx-auto mb-2" />
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">{isEN ? 'Distance' : 'Distancia'}</p>
                  <p className="text-2xl font-bold text-white mt-1">{reserva.distancia}</p>
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-2xl p-5 text-center border border-purple-500/20"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-800/10" />
                <div className="relative z-10">
                  <FaClock className="text-purple-400 text-2xl mx-auto mb-2" />
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">{isEN ? 'Estimated time' : 'Tiempo estimado'}</p>
                  <p className="text-2xl font-bold text-white mt-1">{reserva.duracion}</p>
                </div>
              </motion.div>
            </div>
          )}

          <p className="text-gray-600 text-[11px] text-center mt-3">
            {isEN ? '* Estimates may vary due to traffic conditions' : '* Los estimados pueden variar por condiciones de tráfico'}
          </p>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button onClick={onBack}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 border border-white/10 font-medium">
              <FaArrowLeft className="text-sm" /> {isEN ? 'Back' : 'Atrás'}
            </button>
            <motion.button onClick={onNext} disabled={loading || !!error}
              className="flex-1 p-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg text-lg flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            >
              {isEN ? 'Choose vehicle' : 'Elegir vehículo'}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
