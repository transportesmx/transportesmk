import React, { useRef, useContext, useState } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { Autocomplete } from '@react-google-maps/api';
import { autocompleteOptions } from '@/lib/google-maps';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUsers, FaExchangeAlt, FaArrowRight } from 'react-icons/fa';

export default function BuscadorServicio({ onNext, isLoaded }) {
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.step1 || {};

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
      setError(t.errorPickup || 'Selecciona un lugar de recogida válido');
      return;
    }
    if (!reserva.destinoCoords || !destinoText) {
      setError(t.errorDestination || 'Selecciona un destino válido');
      return;
    }
    if (!fechaIda) {
      setError(t.errorDate || 'Selecciona una fecha');
      return;
    }
    if (tipoViaje === 'redondo' && !fechaRegreso) {
      setError(t.errorReturnDate || 'Selecciona fecha de regreso');
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

  const inputBase = 'w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/60 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200';

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t.title || 'Reserva tu traslado'}
        </h1>
        <p className="text-white/40 text-sm mt-2">
          {t.subtitle || 'Precio al instante · Pago seguro · Puerta a puerta'}
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-[19px] top-[42px] w-px h-[calc(100%-60px)] bg-white/[0.08]" />

            <div className="relative mb-3">
              <label className="text-xs font-medium text-white/40 mb-1.5 block pl-10">
                {t.pickup || 'Recogida'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 w-10 flex justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                {isLoaded ? (
                  <Autocomplete onLoad={onOrigenLoad} onPlaceChanged={onOrigenChanged} options={autocompleteOptions} className="w-full">
                    <input
                      type="text" value={origenText}
                      onChange={(e) => setOrigenText(e.target.value)}
                      placeholder={t.pickupPlaceholder || 'Aeropuerto, hotel, dirección...'}
                      className={`${inputBase} pl-10`}
                    />
                  </Autocomplete>
                ) : (
                  <input type="text" disabled placeholder={t.loadingMaps || 'Cargando Maps...'} className={`${inputBase} pl-10 opacity-40`} />
                )}
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-medium text-white/40 mb-1.5 block pl-10">
                {t.destination || 'Destino'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 w-10 flex justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                </div>
                {isLoaded ? (
                  <Autocomplete onLoad={onDestinoLoad} onPlaceChanged={onDestinoChanged} options={autocompleteOptions} className="w-full">
                    <input
                      type="text" value={destinoText}
                      onChange={(e) => setDestinoText(e.target.value)}
                      placeholder={t.pickupPlaceholder || 'Aeropuerto, hotel, dirección...'}
                      className={`${inputBase} pl-10`}
                    />
                  </Autocomplete>
                ) : (
                  <input type="text" disabled placeholder="..." className={`${inputBase} pl-10 opacity-40`} />
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaCalendarAlt className="text-[10px]" /> {t.date || 'Fecha'}
              </label>
              <input type="date" value={fechaIda} min={minDate}
                onChange={(e) => setFechaIda(e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaClock className="text-[10px]" /> {t.time || 'Hora'}
              </label>
              <input type="time" value={horaIda}
                onChange={(e) => setHoraIda(e.target.value)} className={inputBase} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaUsers className="text-[10px]" /> {t.passengers || 'Pasajeros'}
              </label>
              <input type="number" min="1" max="50" value={numPasajeros}
                onChange={(e) => setNumPasajeros(parseInt(e.target.value) || 1)} className={inputBase} />
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaExchangeAlt className="text-[10px]" /> {t.tripType || 'Tipo'}
              </label>
              <select value={tipoViaje} onChange={(e) => setTipoViaje(e.target.value)}
                className={`${inputBase} appearance-none`}>
                <option value="sencillo" className="bg-[#0a0a0f]">{t.oneWay || 'Sencillo'}</option>
                <option value="redondo" className="bg-[#0a0a0f]">{t.roundTrip || 'Ida y vuelta'}</option>
              </select>
            </div>
          </div>

          {tipoViaje === 'redondo' && (
            <motion.div
              className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-blue-500/[0.04] border border-blue-500/[0.1]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <label className="text-xs font-medium text-white/40 mb-1.5 block">
                  {t.returnDate || 'Fecha regreso'}
                </label>
                <input type="date" value={fechaRegreso} min={fechaIda || minDate}
                  onChange={(e) => setFechaRegreso(e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className="text-xs font-medium text-white/40 mb-1.5 block">
                  {t.returnTime || 'Hora regreso'}
                </label>
                <input type="time" value={horaRegreso}
                  onChange={(e) => setHoraRegreso(e.target.value)} className={inputBase} />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.p
              className="text-red-400 text-sm text-center bg-red-500/[0.06] border border-red-500/[0.1] rounded-lg p-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-white text-[#0a0a0f] font-semibold rounded-lg text-sm hover:bg-white/90 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
          >
            {t.submit || 'Ver ruta y precios'}
            <FaArrowRight className="text-xs" />
          </button>
        </form>
      </div>
    </div>
  );
}
