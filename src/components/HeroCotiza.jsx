
import React, { useState, useRef, useContext } from "react";
import { useRouter } from "next/router";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { autocompleteOptions } from "@/lib/google-maps";
import { AppContext } from "../Context/AppContext";
import { FaArrowRight } from "react-icons/fa";
import { HiSwitchVertical } from "react-icons/hi";

const libraries = ["places"];

const HeroCotiza = () => {
  const router = useRouter();
  const { traduccion, idioma } = useContext(AppContext);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const origenRef = useRef(null);
  const destinoRef = useRef(null);

  const [origenText, setOrigenText] = useState("");
  const [destinoText, setDestinoText] = useState("");

  const onOrigenLoad = (autocomplete) => {
    origenRef.current = autocomplete;
  };

  const onDestinoLoad = (autocomplete) => {
    destinoRef.current = autocomplete;
  };

  const onOrigenChanged = () => {
    if (origenRef.current) {
      const place = origenRef.current.getPlace();

      if (place?.formatted_address) {
        setOrigenText(place.formatted_address);
      } else if (place?.name) {
        setOrigenText(place.name);
      }
    }
  };

  const onDestinoChanged = () => {
    if (destinoRef.current) {
      const place = destinoRef.current.getPlace();

      if (place?.formatted_address) {
        setDestinoText(place.formatted_address);
      } else if (place?.name) {
        setDestinoText(place.name);
      }
    }
  };

  const handleSwap = () => {
    const tmp = origenText;
    setOrigenText(destinoText);
    setDestinoText(tmp);
  };

  const handleReservar = () => {
    const params = new URLSearchParams();

    if (origenText.trim()) {
      params.set("origen", origenText.trim());
    }

    if (destinoText.trim()) {
      params.set("destino", destinoText.trim());
    }

    const query = params.toString();

    router.push(`/reservar${query ? "?" + query : ""}`);
  };

  const inputStyle =
    "bg-white/[0.08] backdrop-blur-sm text-white rounded-lg py-3 px-4 sm:px-6 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/50 text-sm border border-white/[0.12]";

  const isEN = idioma?.nombre === "EN";

  return (
    <div className="bg-white/[0.06] backdrop-blur-sm rounded-2xl px-4 py-4 sm:px-5 sm:py-5 lg:px-6 shadow-2xl w-full sm:w-[85%] md:w-[75%] lg:w-[65%] mx-auto lg:mx-0 border border-white/[0.15]">
      <div className="flex gap-2 sm:gap-3 min-w-0">
        {/* Indicadores de origen y destino */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />

          <div className="w-px h-3 bg-white/20" />

          <button
            type="button"
            onClick={handleSwap}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all group"
            title={isEN ? "Swap locations" : "Intercambiar ubicaciones"}
            aria-label={isEN ? "Swap locations" : "Intercambiar ubicaciones"}
          >
            <HiSwitchVertical className="text-white/50 group-hover:text-white text-sm transition-colors" />
          </button>

          <div className="w-px h-3 bg-white/20" />

          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        </div>

        {/* Únicamente origen y destino de Google Maps */}
        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <label className="block text-white/60 font-medium text-xs mb-1">
              {traduccion?.heroCotiza?.from ||
                (isEN ? "From" : "Origen")}
            </label>

            {isLoaded ? (
              <Autocomplete
                onLoad={onOrigenLoad}
                onPlaceChanged={onOrigenChanged}
                options={autocompleteOptions}
              >
                <input
                  type="text"
                  value={origenText}
                  onChange={(e) => setOrigenText(e.target.value)}
                  placeholder={
                    isEN
                      ? "Airport, hotel, address..."
                      : "Aeropuerto, hotel, dirección..."
                  }
                  className={inputStyle}
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                disabled
                placeholder={isEN ? "Loading Maps..." : "Cargando Maps..."}
                className={`${inputStyle} opacity-40`}
              />
            )}
          </div>

          <div>
            <label className="block text-white/60 font-medium text-xs mb-1">
              {traduccion?.heroCotiza?.to ||
                (isEN ? "To" : "Destino")}
            </label>

            {isLoaded ? (
              <Autocomplete
                onLoad={onDestinoLoad}
                onPlaceChanged={onDestinoChanged}
                options={autocompleteOptions}
              >
                <input
                  type="text"
                  value={destinoText}
                  onChange={(e) => setDestinoText(e.target.value)}
                  placeholder={
                    isEN
                      ? "Airport, hotel, address..."
                      : "Aeropuerto, hotel, dirección..."
                  }
                  className={inputStyle}
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                disabled
                placeholder={isEN ? "Loading Maps..." : "Cargando Maps..."}
                className={`${inputStyle} opacity-40`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Se conserva el botón para continuar a reservas */}
      <button
        type="button"
        onClick={handleReservar}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
      >
        {isEN ? "Book now" : "Reservar"}
        <FaArrowRight className="text-xs" />
      </button>
    </div>
  );
};

export default HeroCotiza;
