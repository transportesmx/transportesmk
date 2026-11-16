import React, { useRef, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { Autocomplete } from '@react-google-maps/api';
import { autocompleteOptions } from '@/lib/google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUsers, FaExchangeAlt, FaArrowRight, FaSuitcase, FaPlane, FaHashtag, FaWhatsapp, FaTimesCircle } from 'react-icons/fa';
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
  const [show24hModal, setShow24hModal] = useState(false);

  // Fecha mínima local: hoy (evita desfases de UTC en México).
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Fecha predeterminada: primera fecha que permite al menos 24 horas
  // de anticipación con la hora predeterminada del servicio (12:00).
  useEffect(() => {
    if (!fechaIda && !router.query.fecha && !reserva.fechaIda) {
      const ahora = new Date();
      const fechaMinimaServicio = new Date(ahora);
      fechaMinimaServicio.setHours(fechaMinimaServicio.getHours() + 24);

      // Si el día siguiente a las 12:00 todavía queda antes del límite,
      // usar el día posterior. En caso contrario, usar mañana.
      const mananaAlMediodia = new Date(ahora);
      mananaAlMediodia.setDate(mananaAlMediodia.getDate() + 1);
      mananaAlMediodia.setHours(12, 0, 0, 0);

      const fechaDefault = mananaAlMediodia.getTime() >= fechaMinimaServicio.getTime()
        ? mananaAlMediodia
        : new Date(mananaAlMediodia);

      if (fechaDefault.getTime() < fechaMinimaServicio.getTime()) {
        fechaDefault.setDate(fechaDefault.getDate() + 1);
      }

      const year = fechaDefault.getFullYear();
      const month = String(fechaDefault.getMonth() + 1).padStart(2, '0');
      const day = String(fechaDefault.getDate()).padStart(2, '0');
      setFechaIda(`${year}-${month}-${day}`);
    }
  }, [fechaIda, router.query.fecha, reserva.fechaIda]);

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

  const CIUDADES_PERMITIDAS = [
    'san miguel de allende', 'san miguel', 'dolores hidalgo',
    'guanajuato', 'querétaro', 'queretaro', 'león', 'leon',
  ];

  const esCiudadPermitida = (texto) => {
    const lower = texto.toLowerCase();
    return CIUDADES_PERMITIDAS.some((c) => lower.includes(c));
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
    if (!esCiudadPermitida(origenText) && !esCiudadPermitida(destinoText)) {
      setError(t.errorCityNotAllowed || 'El origen o destino debe estar en San Miguel de Allende, Dolores Hidalgo, Guanajuato, Querétaro o León.');
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
    if (!aerolinea.trim()) {
      setError(t.errorAirline || 'Ingresa la aerolínea o escribe N/A si no aplica');
      return;
    }
    if (aerolinea.trim().toUpperCase() !== 'N/A' && !numVuelo.trim()) {
      setError(t.errorFlightNumber || 'Ingresa el número de vuelo');
      return;
    }

    const hora = horaIda?.length === 5 ? horaIda : '12:00';
    const servicioDate = new Date(`${fechaIda}T${hora}:00`);
    const horasRestantes = (servicioDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (horasRestantes < 24) {
      setShow24hModal(true);
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

  const inputBase = 'w-full px-3 py-3 rounded-lg bg-white/[0.04] border border-white/[0.30] text-white placeholder-white/60 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200 min-w-0';

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
            <div className="min-w-0 overflow-hidden">
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaCalendarAlt className="text-[10px] " /> {t.date || 'Fecha'}
              </label>
              <input type="date" value={fechaIda} min={minDate}
                onClick={(e) => e.target.showPicker?.()}
                onChange={(e) => setFechaIda(e.target.value)} className={inputBase} />
            </div>
            <div className="min-w-0 overflow-hidden">
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaClock className="text-[10px]" /> {t.time || 'Hora'}
              </label>
              <input type="time" value={horaIda}
                onClick={(e) => e.target.showPicker?.()}
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
                onChange={(e) => setNumPasajeros(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                onBlur={() => setNumPasajeros((v) => { const n = parseInt(v); return (!n || n < 1) ? 1 : Math.min(n, 20); })}
                className={inputBase} />
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaSuitcase className="text-[10px]" /> {t.bags || 'Maletas'}
              </label>
              <input type="number" min="0" max="20" value={numMaletas}
                onChange={(e) => setNumMaletas(e.target.value === '' ? '' : parseInt(e.target.value) ?? '')}
                onBlur={() => setNumMaletas((v) => { const n = parseInt(v); return (isNaN(n) || n < 0) ? 0 : Math.min(n, 20); })}
                className={inputBase} />
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

          {/* Aerolínea y número de vuelo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaPlane className="text-[10px]" /> {t.airline || 'Aerolínea'}
                <span className="text-red-400">*</span>
              </label>
              <input type="text" value={aerolinea}
                onChange={(e) => {
                  setAerolinea(e.target.value);
                  if (e.target.value.trim().toUpperCase() === 'N/A') setNumVuelo('');
                }}
                placeholder={t.airlinePlaceholder || 'Ej: Volaris, VivaAerobus o N/A'}
                className={inputBase} />
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1.5">
                <FaHashtag className="text-[10px]" /> {t.flightNumber || 'No. Vuelo'}
                <span className="text-red-400">*</span>
              </label>
              <input type="text" value={numVuelo}
                onChange={(e) => setNumVuelo(e.target.value)}
                placeholder={t.flightPlaceholder || 'Ej: VB1234'}
                className={inputBase}
                disabled={aerolinea.trim().toUpperCase() === 'N/A'} />
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
              <div className="min-w-0 overflow-hidden">
                <label className="text-xs font-medium text-white/40 mb-1.5 block">
                  {t.returnDate || 'Fecha regreso'}
                </label>
                <input type="date" value={fechaRegreso} min={fechaIda || minDate}
                  onClick={(e) => e.target.showPicker?.()}
                  onChange={(e) => setFechaRegreso(e.target.value)} className={inputBase} />
              </div>
              <div className="min-w-0 overflow-hidden">
                <label className="text-xs font-medium text-white/40 mb-1.5 block">
                  {t.returnTime || 'Hora regreso'}
                </label>
                <input type="time" value={horaRegreso}
                  onClick={(e) => e.target.showPicker?.()}
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

      {/* Modal: servicio con menos de 24 horas de anticipación */}
      <AnimatePresence>
        {show24hModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShow24hModal(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-sm bg-[#14141f] border border-white/[0.1] rounded-2xl p-6 shadow-2xl text-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShow24hModal(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors z-20"
                aria-label="Cerrar aviso"
              >
                <FaTimesCircle className="text-sm" />
              </button>

              {/* Operadora: archivo en public/assets/images/operadora-tmx.png */}
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.9 }}
                animate={{ opacity: 1, y: [0, -5, 0], scale: [1, 1.02, 1] }}
                transition={{
                  opacity: { duration: 0.5 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
                className="relative mx-auto mb-3 flex h-44 w-full max-w-[220px] items-center justify-center"
              >
                <img
                  src="/assets/images/operadora-tmx.png"
                  alt="Asesora de atención de Transportes MX con audífonos y micrófono"
                  className="block h-full w-full object-contain object-bottom"
                  loading="eager"
                  style={{ opacity: 1, visibility: 'visible' }}
                />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4"
              >
                <FaClock className="text-amber-400 text-xl" />
              </motion.div>

              <h3 className="text-lg font-bold text-white mb-2">
                ¡Atención personalizada!
              </h3>

              <p className="text-white/70 text-sm mb-3 leading-relaxed">
                El límite para realizar una reservación en línea es de 24 horas de anticipación.
              </p>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                ¿Necesitas un servicio con menos de 24 horas? Podemos ayudarte. Contáctanos de manera urgente para verificar disponibilidad y coordinar tu traslado manualmente, con atención personalizada en el momento.
              </p>

              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 mb-5">
                <p className="text-white font-semibold text-sm">
                  ¿Tienes algún evento o servicio especial?
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Estamos listos para ayudarte a organizar tu traslado.
                </p>
              </div>

              <motion.a
                href="https://wa.me/524151393219?text=Hola%2C%20necesito%20un%20traslado%20urgente%20con%20menos%20de%2024%20horas%20de%20anticipaci%C3%B3n.%20Me%20gustar%C3%ADa%20verificar%20disponibilidad."
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.035 }}
                whileTap={{ scale: 0.96 }}
                animate={{
                  backgroundColor: ["#047857", "#059669", "#047857"],
                  boxShadow: [
                    "0 0 0 2px rgba(16,185,129,0.55), 0 0 12px rgba(16,185,129,0.25)",
                    "0 0 0 7px rgba(16,185,129,0), 0 0 22px rgba(16,185,129,0.55)",
                    "0 0 0 2px rgba(16,185,129,0.55), 0 0 12px rgba(16,185,129,0.25)",
                  ],
                }}
                transition={{
                  backgroundColor: { duration: 2.1, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 2.1, repeat: Infinity, ease: "easeOut" },
                  scale: { duration: 0.18 },
                }}
                className="flex items-center justify-center gap-2 w-full py-3 text-white font-bold rounded-xl border-2 border-emerald-400/70 transition-colors"
                style={{ backgroundColor: '#047857' }}
              >
                <motion.span
                  animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center justify-center"
                >
                  <FaWhatsapp className="text-2xl" />
                </motion.span>
                Contactar por WhatsApp
              </motion.a>

              <button
                type="button"
                onClick={() => setShow24hModal(false)}
                className="mt-3 text-white/30 hover:text-white/60 text-xs transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
