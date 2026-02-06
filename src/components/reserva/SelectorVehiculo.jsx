import React, { useContext, useMemo } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { vehiculos, calcularPrecio, filtrarVehiculosPorPasajeros } from '@/lib/pricing';
import { motion } from 'framer-motion';
import { FaUsers, FaSuitcase, FaArrowLeft, FaCheck, FaStar, FaWifi, FaSnowflake, FaGem } from 'react-icons/fa';

export default function SelectorVehiculo({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();
  const { idioma } = useContext(AppContext);
  const isEN = idioma.nombre === 'EN';

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
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            {isEN ? 'Choose your vehicle' : 'Elige tu vehículo'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {isEN
              ? `${vehiculosConPrecio.length} vehicles available for ${reserva.numPasajeros} passenger(s) • ${reserva.distancia}`
              : `${vehiculosConPrecio.length} vehículos disponibles para ${reserva.numPasajeros} pasajero(s) • ${reserva.distancia}`}
          </p>
        </div>

        {/* Grid de vehículos */}
        <div className="space-y-4">
          {vehiculosConPrecio.map((vehiculo, index) => {
            const isSelected = reserva.vehiculoId === vehiculo.id;

            return (
              <motion.button
                key={vehiculo.id}
                onClick={() => handleSelect(vehiculo)}
                className={`w-full relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left group ${
                  isSelected
                    ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                    : 'border-white/10 hover:border-blue-400/40 hover:shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                {/* Badge popular */}
                {vehiculo.popular && (
                  <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <FaStar className="text-[10px]" /> {isEN ? 'Most popular' : 'Más popular'}
                  </div>
                )}

                {/* Seleccionado */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-20 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <FaCheck className="text-white text-xs" />
                  </div>
                )}

                <div className="flex flex-col md:flex-row">
                  {/* Imagen del vehículo */}
                  <div className="relative w-full md:w-72 h-48 md:h-52 flex-shrink-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/40" />
                    {/* Reflejo decorativo */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/5 to-transparent" />
                    <img
                      src={vehiculo.imagen}
                      alt={vehiculo.nombre}
                      className="relative z-10 max-h-40 md:max-h-44 w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/assets/images/suburban.png'; }}
                    />
                  </div>

                  {/* Info del vehículo */}
                  <div className="flex-1 p-5 md:p-6 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{vehiculo.nombre}</h3>
                        <p className="text-gray-400 text-sm mb-3">{vehiculo.descripcion}</p>

                        {/* Capacidades */}
                        <div className="flex flex-wrap gap-3 mb-3">
                          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg text-sm">
                            <FaUsers className="text-blue-400 text-xs" />
                            <span className="text-gray-300">{vehiculo.capacidadPasajeros} {isEN ? 'passengers' : 'pasajeros'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg text-sm">
                            <FaSuitcase className="text-yellow-400 text-xs" />
                            <span className="text-gray-300">{vehiculo.capacidadEquipaje} {isEN ? 'bags' : 'maletas'}</span>
                          </div>
                        </div>

                        {/* Características */}
                        <div className="flex flex-wrap gap-2">
                          {vehiculo.caracteristicas.map((c, i) => (
                            <span key={i} className="text-[11px] text-gray-500 flex items-center gap-1">
                              <FaCheck className="text-green-500 text-[8px]" /> {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="md:text-right flex-shrink-0">
                        {vehiculo.precio ? (
                          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 md:min-w-[160px]">
                            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                              {reserva.tipoViaje === 'redondo' ? (isEN ? 'Round trip' : 'Ida y vuelta') : (isEN ? 'One way' : 'Sencillo')}
                            </p>
                            <p className="text-3xl font-extrabold text-green-400 leading-tight">
                              ${vehiculo.precio.precioTotal.toLocaleString('es-MX')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">MXN</p>
                            {reserva.tipoViaje === 'redondo' && (
                              <p className="text-[11px] text-green-400/70 mt-1 flex items-center justify-end gap-1">
                                <FaGem className="text-[8px]" /> {isEN ? '10% discount' : '10% descuento'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm p-4">
                            {isEN ? 'Not available' : 'No disponible'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {vehiculosConPrecio.length === 0 && (
          <div className="text-center text-gray-400 py-12 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-lg mb-2">😕</p>
            <p>{isEN ? 'No vehicles available for the selected number of passengers' : 'No hay vehículos disponibles para los pasajeros seleccionados'}</p>
          </div>
        )}

        {/* Botón atrás */}
        <div className="flex justify-start mt-6">
          <button onClick={onBack}
            className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 border border-white/10 font-medium">
            <FaArrowLeft className="text-sm" /> {isEN ? 'Back' : 'Atrás'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
