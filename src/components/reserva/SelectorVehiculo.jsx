import React, { useContext, useMemo } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { vehiculos, calcularPrecio, filtrarVehiculosPorPasajeros } from '@/lib/pricing';
import { motion } from 'framer-motion';
import { FaUsers, FaSuitcase, FaArrowLeft, FaCheck, FaStar } from 'react-icons/fa';

export default function SelectorVehiculo({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.step3 || {};

  const vehiculosDisponibles = useMemo(() => {
    return filtrarVehiculosPorPasajeros(reserva.numPasajeros);
  }, [reserva.numPasajeros]);

  const vehiculosConPrecio = useMemo(() => {
    return vehiculosDisponibles.map((v) => {
      try {
        const precio = calcularPrecio({
          vehiculoId: v.id,
          distanciaMetros: reserva.distanciaMetros,
          idaYVuelta: reserva.tipoViaje === 'redondo',
          origen: reserva.origen,
          destino: reserva.destino,
        });
        return { ...v, precio };
      } catch {
        return { ...v, precio: null };
      }
    });
  }, [vehiculosDisponibles, reserva.distanciaMetros, reserva.tipoViaje, reserva.origen, reserva.destino]);

  const handleSelect = (vehiculo) => {
    if (!vehiculo.precio) return;
    dispatch({
      type: 'SET_VEHICULO',
      payload: {
        vehiculoId: vehiculo.id,
        vehiculoNombre: vehiculo.nombre,
        precioIda: vehiculo.precio.precioIda,
        precioTotal: vehiculo.precio.precioTotal,
        desglose: vehiculo.precio.desglose,
      },
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {t.title || 'Selecciona tu vehículo'}
        </h2>
        <p className="text-white/80 text-sm mt-1">
          {vehiculosConPrecio.length} {t.optionsFor || 'opciones para'} {reserva.numPasajeros} {t.passenger || 'pasajero(s)'}
          {reserva.distancia && <span className="text-white/20"> · {reserva.distancia}</span>}
        </p>
      </div>

      <div className="space-y-3">
        {vehiculosConPrecio.map((vehiculo, index) => {
          const isSelected = reserva.vehiculoId === vehiculo.id;

          return (
            <motion.button
              key={vehiculo.id}
              onClick={() => handleSelect(vehiculo)}
              disabled={!vehiculo.precio}
              className={`
                w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group
                ${isSelected
                  ? 'border-blue-500/40 bg-blue-500/[0.06]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]'
                }
                ${!vehiculo.precio ? 'opacity-40 cursor-not-allowed' : ''}
              `}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-56 h-40 sm:h-auto flex-shrink-0 bg-gradient-to-b sm:bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-center p-4 overflow-hidden">
                  {vehiculo.popular && (
                    <div className="absolute top-2 left-2 z-10 bg-amber-500/90 text-[10px] text-black font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <FaStar className="text-[8px]" /> {t.popular || 'Popular'}
                    </div>
                  )}
                  <img
                    src={vehiculo.imagen}
                    alt={vehiculo.nombre}
                    className="max-h-32 sm:max-h-36 w-auto object-contain drop-shadow-lg group-hover:scale-[1.03] transition-transform duration-300"
                    onError={(e) => { e.target.src = '/assets/images/suburban.png'; }}
                  />
                </div>

                <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">{vehiculo.nombre}</h3>
                    <p className="text-white/30 text-sm mt-0.5">{vehiculo.descripcion}</p>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-white/80 text-xs">
                        <FaUsers className="text-[10px]" />
                        <span>{vehiculo.capacidadPasajeros} {t.pax || 'pax'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/80 text-xs">
                        <FaSuitcase className="text-[10px]" />
                        <span>{vehiculo.capacidadEquipaje} {t.bags || 'maletas'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {vehiculo.caracteristicas.map((c, i) => (
                        <span key={i} className="text-[11px] text-white/25 flex items-center gap-1">
                          <FaCheck className="text-emerald-500/60 text-[7px]" /> {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 sm:text-right">
                    {vehiculo.precio ? (
                      <div>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">
                          {reserva.tipoViaje === 'redondo' ? (t.roundTrip || 'Ida y vuelta') : (t.oneWay || 'Sencillo')}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
                          ${vehiculo.precio.precioTotal.toLocaleString('es-MX')}
                        </p>
                        <p className="text-[11px] text-white/20 mt-0.5">MXN</p>
                        {reserva.tipoViaje === 'redondo' && (
                          <p className="text-[11px] text-emerald-400/60 mt-1">
                            {t.discountIncluded || '10% desc. incluido'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-white/20 text-sm">{t.unavailable || 'No disponible'}</p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaCheck className="text-white text-[10px]" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {vehiculosConPrecio.length === 0 && (
        <div className="text-center text-white/30 py-16 bg-white/[0.02] rounded-xl border border-white/[0.06]">
          <p>{t.noVehicles || 'No hay vehículos para este número de pasajeros'}</p>
        </div>
      )}

      <div className="mt-6">
        <button onClick={onBack}
          className="px-5 py-3 text-sm text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all flex items-center gap-2">
          <FaArrowLeft className="text-xs" /> {t.back || 'Atrás'}
        </button>
      </div>
    </div>
  );
}
