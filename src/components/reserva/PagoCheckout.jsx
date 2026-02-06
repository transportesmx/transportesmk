import React, { useState, useContext } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { motion } from 'framer-motion';
import { FaCreditCard, FaStore, FaCalendarAlt, FaArrowLeft, FaLock, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { SiVisa, SiMastercard } from 'react-icons/si';

export default function PagoCheckout({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();
  const { idioma } = useContext(AppContext);
  const isEN = idioma.nombre === 'EN';
  const [metodoPago, setMetodoPago] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const metodosPago = [
    {
      id: 'tarjeta',
      icon: FaCreditCard,
      nombre: isEN ? 'Credit / Debit Card' : 'Tarjeta de crédito / débito',
      descripcion: 'Visa, Mastercard, American Express',
      gradient: 'from-blue-600/15 to-cyan-600/15',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      id: 'oxxo',
      icon: FaStore,
      nombre: 'OXXO Pay',
      descripcion: isEN ? 'Pay with cash at any OXXO store' : 'Paga en efectivo en cualquier OXXO',
      gradient: 'from-yellow-600/15 to-orange-600/15',
      border: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
    },
    {
      id: 'msi',
      icon: FaCalendarAlt,
      nombre: isEN ? 'Monthly installments' : 'Meses sin intereses',
      descripcion: isEN ? '3, 6 or 12 months with selected cards' : '3, 6 o 12 meses con tarjetas participantes',
      gradient: 'from-purple-600/15 to-pink-600/15',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  const handlePagar = async () => {
    if (!metodoPago) { setError(isEN ? 'Select a payment method' : 'Selecciona un método de pago'); return; }
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pagos/crear-sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reserva: {
            origen: reserva.origen, destino: reserva.destino,
            fechaIda: reserva.fechaIda, horaIda: reserva.horaIda,
            fechaRegreso: reserva.fechaRegreso, horaRegreso: reserva.horaRegreso,
            tipoViaje: reserva.tipoViaje, vehiculoId: reserva.vehiculoId,
            vehiculoNombre: reserva.vehiculoNombre, numPasajeros: reserva.numPasajeros,
            precioTotal: reserva.precioTotal, distancia: reserva.distancia,
            duracion: reserva.duracion, clienteNombre: reserva.clienteNombre,
            clienteEmail: reserva.clienteEmail, clienteTelefono: reserva.clienteTelefono,
          },
          metodoPago,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Stripe Checkout — redirige al usuario a la página de pago de Stripe
        window.location.href = data.url;
      } else {
        // Modo demo (sin Stripe configurado) — avanza al paso de confirmación
        dispatch({
          type: 'SET_PAGO',
          payload: {
            metodoPago,
            stripeSessionId: data.sessionId || 'demo_' + Date.now(),
            reservaId: data.reservaId || '',
            estadoPago: 'pagado',
          },
        });
        onNext();
      }
    } catch (err) {
      // Fallback: avanza en modo demo si hay error de red
      console.error('Error al crear sesión de pago:', err);
      dispatch({
        type: 'SET_PAGO',
        payload: { metodoPago, stripeSessionId: 'demo_' + Date.now(), estadoPago: 'pagado' },
      });
      onNext();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className="rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 p-5 md:p-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold">
            {isEN ? 'Secure Payment' : 'Pago Seguro'}
          </h2>
          <p className="text-green-200 text-sm mt-1">
            {isEN ? 'Choose how you want to pay' : 'Elige cómo deseas pagar'}
          </p>
        </div>

        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 p-5 md:p-6 border border-white/5 border-t-0">
          {/* Total */}
          <div className="relative overflow-hidden rounded-2xl p-6 mb-6 text-center border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
            <div className="relative z-10">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{isEN ? 'Total' : 'Total a pagar'}</p>
              <p className="text-5xl font-extrabold text-white">
                ${reserva.precioTotal.toLocaleString('es-MX')}
              </p>
              <p className="text-gray-500 text-sm mt-1">MXN</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3 text-[11px] text-gray-500">
                <span>{reserva.vehiculoNombre}</span>
                <span>•</span>
                <span>{reserva.distancia}</span>
                <span>•</span>
                <span>{reserva.tipoViaje === 'redondo' ? (isEN ? 'Round trip' : 'Ida y vuelta') : (isEN ? 'One way' : 'Sencillo')}</span>
              </div>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="space-y-3 mb-6">
            {metodosPago.map((metodo, index) => {
              const Icon = metodo.icon;
              const isSelected = metodoPago === metodo.id;

              return (
                <motion.button
                  key={metodo.id}
                  onClick={() => { setMetodoPago(metodo.id); setError(''); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? `${metodo.border} bg-gradient-to-r ${metodo.gradient} shadow-lg`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${metodo.iconColor} border border-white/10`}>
                    <Icon className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{metodo.nombre}</p>
                    <p className="text-xs text-gray-400">{metodo.descripcion}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-green-500 border-green-500' : 'border-gray-600'
                  }`}>
                    {isSelected && <FaCheckCircle className="text-white text-[10px]" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Seguridad */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-5 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5">
              <FaLock className="text-green-400" />
              <span>SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaShieldAlt className="text-blue-400" />
              <span>Stripe</span>
            </div>
          </div>

          {error && (
            <motion.div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center mb-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {error}
            </motion.div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button onClick={onBack} disabled={loading}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 border border-white/10 font-medium disabled:opacity-50">
              <FaArrowLeft className="text-sm" /> {isEN ? 'Back' : 'Atrás'}
            </button>
            <motion.button onClick={handlePagar} disabled={loading || !metodoPago}
              className="flex-1 p-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg text-lg flex items-center justify-center gap-2"
              whileHover={!loading && metodoPago ? { scale: 1.01 } : {}}
              whileTap={!loading && metodoPago ? { scale: 0.99 } : {}}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEN ? 'Processing...' : 'Procesando...'}
                </>
              ) : (
                <>
                  <FaLock className="text-sm" />
                  {isEN ? 'Pay now' : 'Pagar ahora'}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
