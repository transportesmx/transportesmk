import React, { useState, useRef, useContext } from "react";
import { useRouter } from "next/router";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { autocompleteOptions } from "@/lib/google-maps";
import { AppContext } from "../Context/AppContext";
import { FaArrowRight, FaCalendarAlt, FaClock, FaUsers, FaSuitcase } from "react-icons/fa";
import { HiSwitchVertical } from "react-icons/hi";

const libraries = ['places'];

const HeroCotiza = () => {
  const router = useRouter();
  const { traduccion, idioma } = useContext(AppContext);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const origenRef = useRef(null);
  const destinoRef = useRef(null);
  const [origenText, setOrigenText] = useState('');
  const [destinoText, setDestinoText] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('12:00');
  const [pasajeros, setPasajeros] = useState(1);
  const [maletas, setMaletas] = useState(1);

  const onOrigenLoad = (autocomplete) => { origenRef.current = autocomplete; };
  const onDestinoLoad = (autocomplete) => { destinoRef.current = autocomplete; };

  const onOrigenChanged = () => {
    if (origenRef.current) {
      const place = origenRef.current.getPlace();
      if (place?.formatted_address) setOrigenText(place.formatted_address);
      else if (place?.name) setOrigenText(place.name);
    }
  };

  const onDestinoChanged = () => {
    if (destinoRef.current) {
      const place = destinoRef.current.getPlace();
      if (place?.formatted_address) setDestinoText(place.formatted_address);
      else if (place?.name) setDestinoText(place.name);
    }
  };

  const handleSwap = () => {
    const tmp = origenText;
    setOrigenText(destinoText);
    setDestinoText(tmp);
  };

  const handleReservar = () => {
    const params = new URLSearchParams();
    if (origenText) params.set('origen', origenText);
    if (destinoText) params.set('destino', destinoText);
    if (fecha) params.set('fecha', fecha);
    if (hora) params.set('hora', hora);
    params.set('pasajeros', String(pasajeros));
    params.set('maletas', String(maletas));
    const query = params.toString();
    router.push(`/reservar${query ? '?' + query : ''}`);
  };

  const inputStyle = "bg-white/20 backdrop-blur-sm text-white rounded-lg py-3 px-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/50 text-sm";

  const isEN = idioma.nombre === 'EN';

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-2xl px-4 py-4 sm:px-5 sm:py-4 lg:px-6 lg:py-5 shadow-2xl w-full sm:w-[85%] md:w-[75%] lg:w-[65%] mx-auto lg:mx-0 border border-white/10">
      {/* Desktop: 3 columnas en fila | Mobile/Tablet: stacked */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        {/* Columna 1: Origen + Destino */}
        <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Puntos + swap */}
          <div className="flex flex-col items-center justify-center gap-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <div className="w-px h-3 bg-white/20" />
            <button
              type="button"
              onClick={handleSwap}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all flex-shrink-0 group"
              title="Swap"
            >
              <HiSwitchVertical className="text-white/50 group-hover:text-white text-sm transition-colors" />
            </button>
            <div className="w-px h-3 bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
          </div>

          {/* Inputs origen/destino */}
          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
            <div>
              <label className="block text-white/60 font-medium text-xs mb-1">
                {traduccion?.heroCotiza?.from || 'Recogida'}
              </label>
              {isLoaded ? (
                <Autocomplete onLoad={onOrigenLoad} onPlaceChanged={onOrigenChanged} options={autocompleteOptions}>
                  <input
                    type="text"
                    value={origenText}
                    onChange={(e) => setOrigenText(e.target.value)}
                    placeholder={isEN ? 'Airport, hotel, address...' : 'Aeropuerto, hotel, dirección...'}
                    className={inputStyle}
                  />
                </Autocomplete>
              ) : (
                <input type="text" disabled placeholder="..." className={`${inputStyle} opacity-40`} />
              )}
            </div>
            <div>
              <label className="block text-white/60 font-medium text-xs mb-1">
                {traduccion?.heroCotiza?.to || 'Destino'}
              </label>
              {isLoaded ? (
                <Autocomplete onLoad={onDestinoLoad} onPlaceChanged={onDestinoChanged} options={autocompleteOptions}>
                  <input
                    type="text"
                    value={destinoText}
                    onChange={(e) => setDestinoText(e.target.value)}
                    placeholder={isEN ? 'Airport, hotel, address...' : 'Aeropuerto, hotel, dirección...'}
                    className={inputStyle}
                  />
                </Autocomplete>
              ) : (
                <input type="text" disabled placeholder="..." className={`${inputStyle} opacity-40`} />
              )}
            </div>
          </div>
        </div>

        {/* Columna 2 + 3: solo visible en desktop */}
        <div className="hidden lg:flex gap-4">
          {/* Fecha + Hora */}
          <div className="flex-1 lg:w-40 lg:flex-none space-y-2 sm:space-y-3">
            <div className="min-w-0 overflow-hidden">
              <label className="block text-white/60 font-medium text-xs mb-1 flex items-center gap-1.5">
                <FaCalendarAlt className="text-[10px]" />
                {isEN ? 'Date' : 'Fecha'}
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                min={new Date().toISOString().split('T')[0]}
                className={inputStyle}
              />
            </div>
            <div className="min-w-0 overflow-hidden">
              <label className="block text-white/60 font-medium text-xs mb-1 flex items-center gap-1.5">
                <FaClock className="text-[10px]" />
                {isEN ? 'Time' : 'Hora'}
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Pasajeros + Maletas */}
          <div className="flex-1 lg:w-32 lg:flex-none space-y-2 sm:space-y-3">
            <div>
              <label className="block text-white/60 font-medium text-xs mb-1 flex items-center gap-1.5">
                <FaUsers className="text-[10px]" />
                {isEN ? 'Passengers' : 'Pasajeros'}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={pasajeros}
                onChange={(e) => setPasajeros(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                onBlur={() => setPasajeros((v) => { const n = parseInt(v); return (!n || n < 1) ? 1 : Math.min(n, 20); })}
                className={inputStyle}
              />
            </div>
            <div>
              <label className="block text-white/60 font-medium text-xs mb-1 flex items-center gap-1.5">
                <FaSuitcase className="text-[10px]" />
                {isEN ? 'Bags' : 'Maletas'}
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={maletas}
                onChange={(e) => setMaletas(e.target.value === '' ? '' : parseInt(e.target.value) ?? '')}
                onBlur={() => setMaletas((v) => { const n = parseInt(v); return (isNaN(n) || n < 0) ? 0 : Math.min(n, 20); })}
                className={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón Reservar */}
      <button
        onClick={handleReservar}
        className="mt-3 lg:mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
      >
        {isEN ? 'Book now' : 'Reservar'}
        <FaArrowRight className="text-xs" />
      </button>
    </div>
  );
};

export default HeroCotiza;
