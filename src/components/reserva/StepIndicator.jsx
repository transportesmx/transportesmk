import React, { useContext } from 'react';
import { FaSearch, FaMapMarkedAlt, FaCar, FaUser, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { AppContext } from '@/Context/AppContext';
import { motion } from 'framer-motion';

const pasos = [
  { id: 1, icon: FaSearch, labelES: 'Búsqueda', labelEN: 'Search' },
  { id: 2, icon: FaMapMarkedAlt, labelES: 'Ruta', labelEN: 'Route' },
  { id: 3, icon: FaCar, labelES: 'Vehículo', labelEN: 'Vehicle' },
  { id: 4, icon: FaUser, labelES: 'Datos', labelEN: 'Details' },
  { id: 5, icon: FaCreditCard, labelES: 'Pago', labelEN: 'Payment' },
  { id: 6, icon: FaCheckCircle, labelES: 'Listo', labelEN: 'Done' },
];

export default function StepIndicator({ pasoActual }) {
  const { idioma } = useContext(AppContext);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {pasos.map((paso, index) => {
          const Icon = paso.icon;
          const isActive = pasoActual === paso.id;
          const isCompleted = pasoActual > paso.id;

          return (
            <React.Fragment key={paso.id}>
              <div className="flex flex-col items-center relative">
                <motion.div
                  className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400 text-white shadow-lg shadow-blue-500/40'
                      : isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 text-white'
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isCompleted ? (
                    <FaCheckCircle className="text-xs md:text-base" />
                  ) : (
                    <Icon className="text-xs md:text-base" />
                  )}
                </motion.div>
                <span
                  className={`text-[9px] md:text-[11px] mt-1.5 text-center font-medium tracking-wide ${
                    isActive
                      ? 'text-blue-300'
                      : isCompleted
                      ? 'text-green-400'
                      : 'text-gray-600'
                  }`}
                >
                  {idioma.nombre === 'EN' ? paso.labelEN : paso.labelES}
                </span>
              </div>

              {index < pasos.length - 1 && (
                <div className="flex-1 mx-1 md:mx-2 relative h-0.5 mb-5">
                  <div className="absolute inset-0 bg-white/5 rounded-full" />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: pasoActual > paso.id ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
