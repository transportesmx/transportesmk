import React, { useRef, useContext, useState } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { Autocomplete } from '@react-google-maps/api';
import { autocompleteOptions } from '@/lib/google-maps';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaExchangeAlt, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import Image from 'next/image';

export default function BuscadorServicio({ onNext, isLoaded }) {
  const { reserva, dispatch } = useReserva();
  const { idioma } = useContext(AppContext);
  const isEN = idioma.nombre === 'EN';

  const origenRef = useRef(null);
  const destinoRef = useRef(null);

  const [origenText, setOrigenText] = useState(reserva.origen || '');
  const [destinoText, setDestinoText] = useState(reserva.destino || '');
  const [fechaIda, setFechaIda] = useState(reserva.fechaIda || '');
  const [horaIda, setHoraIda] = useState(reserva.horaIda || '12:00');
  const [numPasajeros, setNumPasajeros] = useState(reserva.numPasajeros || 1);
  const [tipoViaje, setTipoViaje] = useState(reserva.tipoViaje || 'sencillo');
  const [fechaRegreso, setFechaRegreso] = useState(reserva.fechaRegreso || '');
  const [horaRegreso, setHoraRegreso] = useState(reserva.horaRegreso || '12:00');
  const [error, setError] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const onOrigenLoad = (autocomplete) => { origenRef.current = autocomplete; };
  const onDestinoLoad = (autocomplete) => { destinoRef.current = autocomplete; };

  const onOrigenChanged = () => {
    if (origenRef.current) {
      const place = origenRef.current.getPlace();
      if (place?.geometry) {
        setOrigenText(place.formatted_address || place.name);
        dispatch({
          type: 'SET_BUSQUEDA',
          payload: {
            origen: place.formatted_address || place.name,
            origenCoords: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
            origenPlaceId: place.place_id,
          },
        });
      }
    }
  };

  const onDestinoChanged = () => {
    if (destinoRef.current) {
      const place = destinoRef.current.getPlace();
      if (place?.geometry) {
        setDestinoText(place.formatted_address || place.name);
        dispatch({
          type: 'SET_BUSQUEDA',
          payload: {
            destino: place.formatted_address || place.name,
            destinoCoords: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
            destinoPlaceId: place.place_id,
          },
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!reserva.origenCoords || !origenText) {
      setError(isEN ? 'Please select a valid pickup location' : 'Selecciona un lugar de recogida válido');
      return;
    }
    if (!reserva.destinoCoords || !destinoText) {
      setError(isEN ? 'Please select a valid destination' : 'Selecciona un destino válido');
      return;
    }
    if (!fechaIda) {
      setError(isEN ? 'Please select a date' : 'Selecciona una fecha');
      return;
    }
    if (tipoViaje === 'redondo' && !fechaRegreso) {
      setError(isEN ? 'Please select a return date' : 'Selecciona una fecha de regreso');
      return;
    }

    dispatch({
      type: 'SET_BUSQUEDA',
      payload: {
        origen: origenText, destino: destinoText, fechaIda, horaIda,
        numPasajeros, tipoViaje,
        fechaRegreso: tipoViaje === 'redondo' ? fechaRegreso : '',
        horaRegreso: tipoViaje === 'redondo' ? horaRegreso : '',
      },
    });
    onNext();
  };

  const inputClass = 'w-full p-3.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent transition-all duration-300 hover:bg-white/10';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className="rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 p-6 md:p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/images/aeropuerto.png')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-800/95" />
          <div className="relative z-10">
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-2"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {isEN ? 'Book your private transfer' : 'Reserva tu traslado privado'}
            </motion.h2>
            <p className="text-blue-200 text-sm md:text-base">
              {isEN ? 'Instant price • Secure payment • Door-to-door' : 'Precio al instante • Pago seguro • Puerta a puerta'}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 p-6 md:p-8 backdrop-blur-md border border-white/5 border-t-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Origen */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-green-400 text-[10px]" />
                </span>
                {isEN ? 'Pickup location' : 'Lugar de recogida'}
              </label>
              {isLoaded ? (
                <Autocomplete onLoad={onOrigenLoad} onPlaceChanged={onOrigenChanged} options={autocompleteOptions}>
                  <input
                    type="text" value={origenText}
                    onChange={(e) => setOrigenText(e.target.value)}
                    placeholder={isEN ? 'Airport, hotel, address...' : 'Aeropuerto, hotel, dirección...'}
                    className={inputClass}
                  />
                </Autocomplete>
              ) : (
                <input type="text" disabled placeholder={isEN ? 'Loading Google Maps...' : 'Cargando Google Maps...'}
                  className={`${inputClass} opacity-50 cursor-not-allowed`} />
              )}
            </div>

            {/* Destino */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-red-400 text-[10px]" />
                </span>
                {isEN ? 'Destination' : 'Destino'}
              </label>
              {isLoaded ? (
                <Autocomplete onLoad={onDestinoLoad} onPlaceChanged={onDestinoChanged} options={autocompleteOptions}>
                  <input
                    type="text" value={destinoText}
                    onChange={(e) => setDestinoText(e.target.value)}
                    placeholder={isEN ? 'Airport, hotel, address...' : 'Aeropuerto, hotel, dirección...'}
                    className={inputClass}
                  />
                </Autocomplete>
              ) : (
                <input type="text" disabled placeholder="..." className={`${inputClass} opacity-50`} />
              )}
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-400 text-xs" />
                  {isEN ? 'Date' : 'Fecha'}
                </label>
                <input type="date" value={fechaIda} min={minDate}
                  onChange={(e) => setFechaIda(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaClock className="text-yellow-400 text-xs" />
                  {isEN ? 'Time' : 'Hora'}
                </label>
                <input type="time" value={horaIda}
                  onChange={(e) => setHoraIda(e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Pasajeros y tipo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaUsers className="text-purple-400 text-xs" />
                  {isEN ? 'Passengers' : 'Pasajeros'}
                </label>
                <input type="number" min="1" max="50" value={numPasajeros}
                  onChange={(e) => setNumPasajeros(parseInt(e.target.value) || 1)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaExchangeAlt className="text-cyan-400 text-xs" />
                  {isEN ? 'Trip type' : 'Tipo de viaje'}
                </label>
                <select value={tipoViaje} onChange={(e) => setTipoViaje(e.target.value)} className={inputClass}>
                  <option value="sencillo" className="bg-gray-900 text-white">{isEN ? 'One way' : 'Sencillo'}</option>
                  <option value="redondo" className="bg-gray-900 text-white">{isEN ? 'Round trip' : 'Ida y vuelta'}</option>
                </select>
              </div>
            </div>

            {/* Regreso */}
            {tipoViaje === 'redondo' && (
              <motion.div
                className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-400 text-xs" />
                    {isEN ? 'Return date' : 'Fecha regreso'}
                  </label>
                  <input type="date" value={fechaRegreso} min={fechaIda || minDate}
                    onChange={(e) => setFechaRegreso(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <FaClock className="text-orange-400 text-xs" />
                    {isEN ? 'Return time' : 'Hora regreso'}
                  </label>
                  <input type="time" value={horaRegreso}
                    onChange={(e) => setHoraRegreso(e.target.value)} className={inputClass} />
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Botón */}
            <motion.button
              type="submit"
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-blue-500/30 text-lg flex items-center justify-center gap-3 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isEN ? 'View route and prices' : 'Ver ruta y precios'}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
