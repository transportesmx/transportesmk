import React, { useContext, useState, useEffect } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { generarHojaServicio } from '@/lib/pdf-generator';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaFilePdf, FaWhatsapp, FaHome, FaCalendarPlus, FaMapMarkerAlt, FaCar, FaCreditCard } from 'react-icons/fa';
import Link from 'next/link';

export default function ConfirmacionReserva() {
  const { reserva, dispatch } = useReserva();
  const { idioma } = useContext(AppContext);
  const isEN = idioma.nombre === 'EN';
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDescargarPDF = () => {
    setPdfLoading(true);
    try {
      const doc = generarHojaServicio({
        id: reserva.reservaId || reserva.stripeSessionId?.slice(-8) || 'N/A',
        clienteNombre: reserva.clienteNombre,
        clienteEmail: reserva.clienteEmail,
        clienteTelefono: reserva.clienteTelefono,
        origen: reserva.origen,
        destino: reserva.destino,
        fechaIda: reserva.fechaIda,
        horaIda: reserva.horaIda,
        tipoViaje: reserva.tipoViaje,
        fechaRegreso: reserva.fechaRegreso,
        horaRegreso: reserva.horaRegreso,
        distancia: reserva.distancia,
        duracion: reserva.duracion,
        vehiculoNombre: reserva.vehiculoNombre,
        numPasajeros: reserva.numPasajeros,
        precioTotal: reserva.precioTotal,
        metodoPago: reserva.metodoPago,
        estadoPago: reserva.estadoPago,
      });
      doc.save(`TransportesMX-Reserva-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error PDF:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleNuevaReserva = () => dispatch({ type: 'RESET' });

  const whatsappMsg = encodeURIComponent(
    `¡Hola! Acabo de reservar un traslado:\n📍 ${reserva.origen} → ${reserva.destino}\n📅 ${reserva.fechaIda} a las ${reserva.horaIda}\n🚗 ${reserva.vehiculoNombre}`
  );

  const reservaNum = reserva.reservaId || reserva.stripeSessionId?.slice(-8) || String(Date.now()).slice(-8);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className="rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {/* Header con éxito */}
        <div className="relative bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 p-8 md:p-10 text-center overflow-hidden">
          {/* Círculos decorativos */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <FaCheckCircle className="text-white text-4xl" />
            </motion.div>

            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isEN ? 'Reservation confirmed!' : '¡Reserva confirmada!'}
            </motion.h2>
            <motion.p
              className="text-green-100 text-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {isEN
                ? 'Your transfer has been booked successfully'
                : 'Tu traslado ha sido reservado exitosamente'}
            </motion.p>

            {/* Número de reserva */}
            <motion.div
              className="inline-block mt-4 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-xs text-green-200">Reserva</span>
              <span className="ml-2 font-mono font-bold text-white">#{reservaNum}</span>
            </motion.div>
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 p-5 md:p-6 border border-white/5 border-t-0">
          {/* Grid de detalles */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaMapMarkerAlt className="text-blue-400 text-xs" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{isEN ? 'Route' : 'Ruta'}</p>
                <p className="text-sm text-white font-medium truncate">{reserva.origen}</p>
                <p className="text-xs text-gray-500">→</p>
                <p className="text-sm text-white font-medium truncate">{reserva.destino}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <FaCalendarPlus className="text-yellow-400 text-xs" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{isEN ? 'Date' : 'Fecha'}</p>
                  <p className="text-sm text-white font-medium">{reserva.fechaIda}</p>
                  <p className="text-xs text-gray-400">{reserva.horaIda} hrs</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <FaCar className="text-green-400 text-xs" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{isEN ? 'Vehicle' : 'Vehículo'}</p>
                  <p className="text-sm text-white font-medium">{reserva.vehiculoNombre}</p>
                  <p className="text-xs text-gray-400">{reserva.numPasajeros} {isEN ? 'pax' : 'pax'}</p>
                </div>
              </div>
            </div>

            {reserva.tipoViaje === 'redondo' && (
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/20">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <FaCalendarPlus className="text-orange-400 text-xs" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{isEN ? 'Return' : 'Regreso'}</p>
                  <p className="text-sm text-white font-medium">{reserva.fechaRegreso} - {reserva.horaRegreso} hrs</p>
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-green-400" />
              <div>
                <span className="text-gray-400 text-sm font-medium">Total</span>
                <p className="text-[11px] text-gray-500 capitalize">{reserva.metodoPago}</p>
              </div>
            </div>
            <span className="text-3xl font-extrabold text-green-400">
              ${reserva.precioTotal.toLocaleString('es-MX')}
              <span className="text-sm font-normal text-gray-500 ml-1">MXN</span>
            </span>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <motion.button
              onClick={handleDescargarPDF}
              disabled={pdfLoading}
              className="flex items-center justify-center gap-2 p-3.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl transition text-red-400 font-semibold text-sm"
              whileTap={{ scale: 0.97 }}
            >
              <FaFilePdf /> {isEN ? 'Download PDF' : 'Descargar PDF'}
            </motion.button>

            <motion.a
              href={`https://wa.me/524151393219?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3.5 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 rounded-xl transition text-green-400 font-semibold text-sm"
              whileTap={{ scale: 0.97 }}
            >
              <FaWhatsapp /> WhatsApp
            </motion.a>
          </div>

          {/* Botones finales */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleNuevaReserva}
              className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition text-white font-bold"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            >
              <FaCalendarPlus /> {isEN ? 'New reservation' : 'Nueva reserva'}
            </motion.button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 border border-white/10"
            >
              <FaHome /> {isEN ? 'Home' : 'Inicio'}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
