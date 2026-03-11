import React, { useContext, useMemo, useState } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { vehiculos, calcularPrecio, filtrarVehiculosPorCapacidad, medidasMaleta } from '@/lib/pricing';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaSuitcase, FaArrowLeft, FaCheck, FaStar, FaTimesCircle, FaSuitcaseRolling, FaRulerCombined } from 'react-icons/fa';

export default function SelectorVehiculo({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.step3 || {};
  const [luggageOpen, setLuggageOpen] = useState(null);

  const vehiculosDisponibles = useMemo(() => {
    return filtrarVehiculosPorCapacidad(reserva.numPasajeros, reserva.numMaletas || 0);
  }, [reserva.numPasajeros, reserva.numMaletas]);

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
          const isLuggageOpen = luggageOpen === vehiculo.id;

          return (
            <motion.div
              key={vehiculo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.2 }}
            >
              <button
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
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Imagen del vehículo */}
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

                  {/* Contenido */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white">{vehiculo.nombre}</h3>
                      <p className="text-white/50 text-sm mt-0.5">{vehiculo.descripcion}</p>

                      {/* Capacidades */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-white/80 text-xs">
                          <FaUsers className="text-[10px]" />
                          <span>{vehiculo.capacidadPasajeros} {t.pax || 'pax'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80 text-xs">
                          <FaSuitcase className="text-[10px]" />
                          <span>{vehiculo.capacidadEquipaje} {t.bags || 'maletas'}</span>
                        </div>
                        {/* Botón tamaño maleta */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLuggageOpen(isLuggageOpen ? null : vehiculo.id);
                          }}
                          className="flex items-center gap-1 text-blue-400/70 hover:text-blue-400 text-xs transition-colors"
                        >
                          <FaRulerCombined className="text-[9px]" />
                          <span className="underline decoration-dotted underline-offset-2">{t.luggageSize || 'Medidas'}</span>
                        </button>
                      </div>

                      {/* Cancelación gratis + características */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 font-medium">
                          <FaCheck className="text-[7px]" /> {t.freeCancellation || 'Cancelación gratis'}
                        </span>
                        {vehiculo.caracteristicas.map((c, i) => (
                          <span key={i} className="text-[11px] text-white/70 flex items-center gap-1">
                            <FaCheck className="text-emerald-500/60 text-[7px]" /> {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="flex-shrink-0 sm:text-right">
                      {vehiculo.precio ? (
                        <div>
                          <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium">
                            {reserva.tipoViaje === 'redondo' ? (t.roundTrip || 'Ida y vuelta') : (t.oneWay || 'Sencillo')}
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
                            ${vehiculo.precio.precioTotal.toLocaleString('es-MX')}
                          </p>
                          <p className="text-[11px] text-white/50 mt-0.5">MXN</p>
                          {/* Desglose oculto — descomentar para debug
                          {vehiculo.precio.desglose && (
                            <div className="mt-2 text-left space-y-0.5 border-t border-white/[0.06] pt-2">
                              {vehiculo.precio.desglose.map((item, i) => {
                                const isTotal = item.concepto === 'TOTAL' || item.concepto === 'PRECIO IDA';
                                const isSeparator = item.concepto.startsWith('───');
                                return (
                                  <div key={i} className={`flex justify-between gap-3 text-[10px] ${isTotal ? 'font-bold text-white border-t border-white/[0.1] pt-1 mt-1' : isSeparator ? 'text-white/20 mt-1' : 'text-white/40'}`}>
                                    <span>{item.concepto}</span>
                                    {item.monto !== null && <span className="tabular-nums">${item.monto.toLocaleString('es-MX')}</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          */}
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
              </button>

              {/* Medidas de maleta (inline en desktop) */}
              <AnimatePresence>
                {isLuggageOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden hidden sm:block"
                  >
                    <div className="mx-2 mt-1 mb-2 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-row items-center gap-4">
                      <div className="flex items-center gap-3">
                        <FaSuitcaseRolling className="text-blue-400/60 text-2xl" />
                        <div>
                          <p className="text-xs font-semibold text-white/80">
                            {t.luggageSizeTitle || 'Tamaño máximo de maleta'}
                          </p>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            {t.luggageFits || 'Caben'} {vehiculo.capacidadEquipaje} {t.bagsInVehicle || 'maletas en este vehículo'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-center">
                        <div className="bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                          <p className="text-lg font-bold text-white">{medidasMaleta.alto}</p>
                          <p className="text-[10px] text-white/40 uppercase">{t.height || 'alto'} (cm)</p>
                        </div>
                        <div className="bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                          <p className="text-lg font-bold text-white">{medidasMaleta.ancho}</p>
                          <p className="text-[10px] text-white/40 uppercase">{t.width || 'ancho'} (cm)</p>
                        </div>
                        <div className="bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                          <p className="text-lg font-bold text-white">{medidasMaleta.profundidad}</p>
                          <p className="text-[10px] text-white/40 uppercase">{t.depth || 'prof.'} (cm)</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
          className="px-5 py-3 text-sm text-white/50 hover:text-black bg-white/[0.04] hover:bg-amber-500/90 border border-white/[0.06] hover:border-amber-500 rounded-lg transition-all flex items-center gap-2 hover:font-bold">
          <FaArrowLeft className="text-xs" /> {t.back || 'Atrás'}
        </button>
      </div>

      {/* Modal de medidas de maleta — solo móvil */}
      <AnimatePresence>
        {luggageOpen !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:hidden"
            onClick={() => setLuggageOpen(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-[#14141f] border border-white/[0.1] rounded-2xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLuggageOpen(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <FaTimesCircle className="text-sm" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <FaSuitcaseRolling className="text-blue-400/70 text-2xl" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {t.luggageSizeTitle || 'Tamaño máximo de maleta'}
                  </p>
                  {(() => {
                    const v = vehiculosConPrecio.find((v) => v.id === luggageOpen);
                    return v ? (
                      <p className="text-xs text-white/40 mt-0.5">
                        {t.luggageFits || 'Caben'} {v.capacidadEquipaje} {t.bagsInVehicle || 'maletas en este vehículo'}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <div className="flex-1 bg-white/[0.04] rounded-xl py-3 border border-white/[0.06] text-center">
                  <p className="text-2xl font-bold text-white">{medidasMaleta.alto}</p>
                  <p className="text-[10px] text-white/40 uppercase mt-1">{t.height || 'alto'} (cm)</p>
                </div>
                <div className="flex-1 bg-white/[0.04] rounded-xl py-3 border border-white/[0.06] text-center">
                  <p className="text-2xl font-bold text-white">{medidasMaleta.ancho}</p>
                  <p className="text-[10px] text-white/40 uppercase mt-1">{t.width || 'ancho'} (cm)</p>
                </div>
                <div className="flex-1 bg-white/[0.04] rounded-xl py-3 border border-white/[0.06] text-center">
                  <p className="text-2xl font-bold text-white">{medidasMaleta.profundidad}</p>
                  <p className="text-[10px] text-white/40 uppercase mt-1">{t.depth || 'prof.'} (cm)</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
