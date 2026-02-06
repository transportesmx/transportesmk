import React, { useState, useContext } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaShieldAlt, FaArrowRight, FaMapMarkerAlt, FaCar, FaCalendarAlt, FaLock } from 'react-icons/fa';

export default function DatosCliente({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();
  const { idioma } = useContext(AppContext);
  const isEN = idioma.nombre === 'EN';

  const [nombre, setNombre] = useState(reserva.clienteNombre || '');
  const [email, setEmail] = useState(reserva.clienteEmail || '');
  const [telefono, setTelefono] = useState(reserva.clienteTelefono || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim()) { setError(isEN ? 'Enter your full name' : 'Ingresa tu nombre completo'); return; }
    if (!email.trim() || !email.includes('@')) { setError(isEN ? 'Enter a valid email' : 'Ingresa un email válido'); return; }
    if (!telefono.trim() || telefono.length < 10) { setError(isEN ? 'Enter a valid phone number' : 'Ingresa un teléfono válido'); return; }

    dispatch({
      type: 'SET_CLIENTE',
      payload: { clienteNombre: nombre.trim(), clienteEmail: email.trim(), clienteTelefono: telefono.trim() },
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
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 p-5 md:p-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold">
            {isEN ? 'Contact details' : 'Datos de contacto'}
          </h2>
          <p className="text-blue-200 text-sm mt-1">
            {isEN ? 'We need your info to confirm the reservation' : 'Necesitamos tu información para confirmar la reserva'}
          </p>
        </div>

        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 p-5 md:p-6 border border-white/5 border-t-0">
          {/* Resumen mini */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <FaMapMarkerAlt className="text-blue-400 mx-auto mb-1 text-sm" />
              <p className="text-[10px] text-gray-500 uppercase">{isEN ? 'Route' : 'Ruta'}</p>
              <p className="text-xs text-white font-medium truncate">{reserva.distancia}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <FaCar className="text-green-400 mx-auto mb-1 text-sm" />
              <p className="text-[10px] text-gray-500 uppercase">{isEN ? 'Vehicle' : 'Vehículo'}</p>
              <p className="text-xs text-white font-medium truncate">{reserva.vehiculoNombre}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <FaCalendarAlt className="text-yellow-400 mx-auto mb-1 text-sm" />
              <p className="text-[10px] text-gray-500 uppercase">{isEN ? 'Date' : 'Fecha'}</p>
              <p className="text-xs text-white font-medium">{reserva.fechaIda}</p>
            </div>
          </div>

          {/* Total destacado */}
          <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">{isEN ? 'Total:' : 'Total a pagar:'}</span>
            <span className="text-2xl font-extrabold text-green-400">${reserva.precioTotal.toLocaleString('es-MX')} <span className="text-sm font-normal text-gray-500">MXN</span></span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FaUser className="text-blue-400 text-[10px]" />
                </span>
                {isEN ? 'Full name' : 'Nombre completo'}
              </label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                placeholder={isEN ? 'John Doe' : 'Juan Pérez'} className={inputClass} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FaEnvelope className="text-green-400 text-[10px]" />
                </span>
                {isEN ? 'Email' : 'Correo electrónico'}
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com" className={inputClass} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <FaPhone className="text-yellow-400 text-[10px]" />
                </span>
                {isEN ? 'Phone' : 'Teléfono'}
              </label>
              <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                placeholder="+52 415 123 4567" className={inputClass} />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 p-3 rounded-xl border border-white/5">
              <FaLock className="text-green-400 flex-shrink-0" />
              {isEN ? 'Your personal data is protected with 256-bit SSL encryption.' : 'Tus datos personales están protegidos con encriptación SSL de 256 bits.'}
            </div>

            {error && (
              <motion.div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onBack}
                className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 border border-white/10 font-medium">
                <FaArrowLeft className="text-sm" /> {isEN ? 'Back' : 'Atrás'}
              </button>
              <motion.button type="submit"
                className="flex-1 p-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all shadow-lg text-lg flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                {isEN ? 'Continue to payment' : 'Continuar al pago'}
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
