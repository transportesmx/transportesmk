import React, { useRef, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { Autocomplete } from '@react-google-maps/api';
import { autocompleteOptions } from '@/lib/google-maps';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUsers, FaExchangeAlt, FaArrowRight, FaSuitcase, FaPlane, FaHashtag } from 'react-icons/fa';
import { HiSwitchVertical } from 'react-icons/hi';

export default function BuscadorServicio({ onNext, isLoaded }) {
  const router = useRouter();
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.step1 || {};

  const origenRef = useRef(null);
  const destinoRef = useRef(null);

  const [origenText, setOrigenText] = useState(reserva.origen || '');
  const [destinoText, setDestinoText] = useState(reserva.destino || '');

  // Pre-llenar campos simples desde query params (viene del Hero)
  const [fieldsPrefilled, setFieldsPrefilled] = useState(false);
  useEffect(() => {
    if (router.isReady && !fieldsPrefilled) {
      const { origen, destino, fecha, hora, pasajeros, maletas } = router.query;
      if (origen) setOrigenText(decodeURIComponent(origen));
      if (destino) setDestinoText(decodeURIComponent(destino));
      if (fecha) setFechaIda(decodeURIComponent(fecha));
      if (hora) setHoraIda(decodeURIComponent(hora));
      if (pasajeros) setNumPasajeros(parseInt(pasajeros) || 1);
      if (maletas) setNumMaletas(parseInt(maletas) || 0);
      setFieldsPrefilled(true);
    }
  }, [router.isReady]);

  // Geocodificar direcciones del Hero cuando Google Maps esté listo
  const [geoPrefilled, setGeoPrefilled] = useState(false);
  useEffect(() => {
    if (!router.isReady || !isLoaded || geoPrefilled) return;
    const { origen, destino } = router.query;
    if (!origen && !destino) { setGeoPrefilled(true); return; }

    const geocodeAddress = (address) => {
      return new Promise((resolve) => {
        if (!window.google?.maps?.Geocoder) { resolve(null); return; }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve({
              text: results[0].formatted_address,
              coords: {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              },
              placeId: results[0].place_id,
            });
          } else {
            resolve(null);
          }
        });
      });
    };

    const doGeocode = async () => {
      if (origen && !reserva.origenCoords) {
        const geo = await geocodeAddress(decodeURIComponent(origen));
        if (geo) {
          setOrigenText(geo.text);
          dispatch({ type: 'SET_BUSQUEDA', payload: { origen: geo.text, origenCoords: geo.coords, origenPlaceId: geo.placeId } });
        }
      }
      if (destino && !reserva.destinoCoords) {
        const geo = await geocodeAddress(decodeURIComponent(destino));
        if (geo) {
          setDestinoText(geo.text);
          dispatch({ type: 'SET_BUSQUEDA', payload: { destino: geo.text, destinoCoords: geo.coords, destinoPlaceId: geo.placeId } });
        }
      }
      setGeoPrefilled(true);
    };

    doGeocode();
  }, [router.isReady, isLoaded]);
  const [fechaIda, setFechaIda] = useState(reserva.fechaIda || '');
  const [horaIda, setHoraIda] = useState(reserva.horaIda || '12:00');
  const [numPasajeros, setNumPasajeros] = useState(reserva.numPasajeros || 1);
  const [numMaletas, setNumMaletas] = useState(reserva.numMaletas || 1);
  const [aerolinea, setAerolinea] = useState(reserva.aerolinea || '');
  const [numVuelo, setNumVuelo] = useState(reserva.numVuelo || '');
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

  // Intercambiar origen y destino
  const handleSwap = () => {
    const tmpText = origenText;
    const tmpCoords = reserva.origenCoords;
    const tmpPlaceId = reserva.origenPlaceId;

    setOrigenText(destinoText);
    setDestinoText(tmpText);

    dispatch({
      type: 'SET_BUSQUEDA',
      payload: {
        origen: destinoText,
        origenCoords: reserva.destinoCoords,
        origenPlaceId: reserva.destinoPlaceId,
        destino: tmpText,
        destinoCoords: tmpCoords,
        destinoPlaceId: tmpPlaceId,
      },
    });
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
        numPasajeros, numMaletas, aerolinea, numVuelo, tipoViaje,
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
          {/* Origen + Swap + Destino */}
          <div className="flex gap-3">
            {/* Columna izquierda: puntos + swap */}
            <div className="flex flex-col items-center pt-7 gap-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <div className="w-px h-3 bg-white/[0.08]" />
              <button
                type="button"
                onClick={handleSwap}
                className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.15] hover:border-white/25 flex items-center justify-center transition-all duration-200 group flex-shrink-0"
                title={t.swap || 'Intercambiar'}
              >
                <HiSwitchVertical className="text-white/40 group-hover:text-white text-sm transition-colors" />
              </button>
              <div className="w-px h-3 bg-white/[0.08]" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
            </div>

            {/* Columna derecha: inputs */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-medium text-white/40 mb-1.5 block">
                  {t.pickup || 'Recogida'}
                </label>
                {isLoaded ? (
                  <Autocomplete onLoad={onOrigenLoad} onPlaceChanged={onOrigenChanged} options={autocompleteOptions} className="w-full">
                    <input
                      type="text" value={origenText}
                      onChange={(e) => setOrigenText(e.target.value)}
                      placeholder={t.pickupPlaceholder || 'Aeropuerto, hotel, dirección...'}
                      className={inputBase}
                    />
                  </Autocomplete>
                ) : (
                  <input type="text" disabled placeholder={t.loadingMaps || 'Cargando Maps...'} className={`${inputBase} opacity-40`} />
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-white/40 mb-1.5 block">
                  {t.destination || 'Destino'}
                </label>
                {isLoaded ? (
                  <Autocomplete onLoad={onDestinoLoad} onPlaceChanged={onDestinoChanged} options={autocompleteOptions} className="w-full">
                    <input
                      type="text" value={destinoText}
                      onChange={(e) => setDestinoText(e.target.value)}
                      placeholder={t.destinationPlaceholder || 'Aeropuerto, hotel, dirección...'}
                      className={inputBase}
                    />
                  </Autocomplete>
                ) : (
                  <input type="text" disabled placeholder="..." className={`${inputBase} opacity-40`} />
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Fecha y hora */}
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

          {/* Pasajeros, maletas, tipo viaje */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaUsers className="text-[10px]" /> {t.passengers || 'Pasajeros'}
              </label>
              <input type="number" min="1" max="20" value={numPasajeros}
                onChange={(e) => setNumPasajeros(parseInt(e.target.value) || 1)} className={inputBase} />
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaSuitcase className="text-[10px]" /> {t.bags || 'Maletas'}
              </label>
              <input type="number" min="0" max="20" value={numMaletas}
                onChange={(e) => setNumMaletas(parseInt(e.target.value) || 0)} className={inputBase} />
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

          {/* Aerolínea y número de vuelo (opcionales) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaPlane className="text-[10px]" /> {t.airline || 'Aerolínea'}
                <span className="text-white/20 font-normal">({t.optional || 'opcional'})</span>
              </label>
              <input type="text" value={aerolinea}
                onChange={(e) => setAerolinea(e.target.value)}
                placeholder={t.airlinePlaceholder || 'Ej: Volaris, VivaAerobus'}
                className={inputBase} />
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaHashtag className="text-[10px]" /> {t.flightNumber || 'No. Vuelo'}
                <span className="text-white/20 font-normal">({t.optional || 'opcional'})</span>
              </label>
              <input type="text" value={numVuelo}
                onChange={(e) => setNumVuelo(e.target.value)}
                placeholder={t.flightPlaceholder || 'Ej: VB1234'}
                className={inputBase} />
            </div>
          </div>

          {/* Regreso */}
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
