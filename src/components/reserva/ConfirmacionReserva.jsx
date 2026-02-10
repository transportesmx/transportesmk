import React, { useContext, useState } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { generarHojaServicio } from '@/lib/pdf-generator';
import { motion } from 'framer-motion';
import { FaFilePdf, FaWhatsapp, FaHome, FaCalendarPlus, FaCheck } from 'react-icons/fa';
import Link from 'next/link';

export default function ConfirmacionReserva() {
  const { reserva, dispatch } = useReserva();
  const { traduccion, idioma } = useContext(AppContext);
  const t = traduccion?.reservar?.step6 || {};
  const [pdfLoading, setPdfLoading] = useState(false);

  const lang = idioma?.nombre === 'EN' ? 'en' : 'es';

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
        estadoPago: reserva.estadoPago || 'pagado',
      }, lang);
      doc.save(`TransportesMX-Reserva-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error PDF:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleNuevaReserva = () => dispatch({ type: 'RESET' });

  const whatsappMsg = encodeURIComponent(
    lang === 'en'
      ? `Hi! I just booked a transfer:\n📍 ${reserva.origen} → ${reserva.destino}\n📅 ${reserva.fechaIda} at ${reserva.horaIda}\n🚗 ${reserva.vehiculoNombre}`
      : `¡Hola! Acabo de reservar un traslado:\n📍 ${reserva.origen} → ${reserva.destino}\n📅 ${reserva.fechaIda} a las ${reserva.horaIda}\n🚗 ${reserva.vehiculoNombre}`
  );

  const reservaNum = reserva.reservaId?.slice(0, 8) || reserva.stripeSessionId?.slice(-8) || String(Date.now()).slice(-8);

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <FaCheck className="text-emerald-400 text-xl" />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t.title || 'Reserva confirmada'}
        </h2>
        <p className="text-white/40 text-sm mt-2">
          {t.subtitle || 'Tu traslado ha sido reservado exitosamente'}
        </p>

        <div className="inline-flex items-center gap-2 mt-4 bg-white/[0.04] border border-white/[0.06] px-4 py-2 rounded-full">
          <span className="text-white/30 text-xs">{t.booking || 'Reserva'}</span>
          <span className="font-mono font-bold text-sm text-white">#{reservaNum}</span>
        </div>
      </motion.div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-0.5 pt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-px h-5 bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-red-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-sm text-white/70 truncate">{reserva.origen}</p>
            <p className="text-sm text-white/70 truncate">{reserva.destino}</p>
          </div>
        </div>

        <div className="h-px bg-white/[0.04]" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.date || 'Fecha'}</p>
            <p className="text-sm text-white/70 mt-0.5">{reserva.fechaIda}</p>
            <p className="text-xs text-white/30">{reserva.horaIda} hrs</p>
          </div>
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.vehicle || 'Vehículo'}</p>
            <p className="text-sm text-white/70 mt-0.5">{reserva.vehiculoNombre}</p>
            <p className="text-xs text-white/30">{reserva.numPasajeros} pax</p>
          </div>
        </div>

        {reserva.tipoViaje === 'redondo' && reserva.fechaRegreso && (
          <>
            <div className="h-px bg-white/[0.04]" />
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.return || 'Regreso'}</p>
              <p className="text-sm text-white/70 mt-0.5">{reserva.fechaRegreso} · {reserva.horaRegreso} hrs</p>
            </div>
          </>
        )}

        <div className="h-px bg-white/[0.04]" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Total</p>
          </div>
          <p className="text-2xl font-bold text-white">
            ${reserva.precioTotal?.toLocaleString('es-MX')}
            <span className="text-xs font-normal text-white/25 ml-1">MXN</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleDescargarPDF}
          disabled={pdfLoading}
          className="flex items-center justify-center gap-2 py-3 text-sm text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all"
        >
          <FaFilePdf className="text-red-400/70" /> PDF
        </button>

        <a
          href={`https://wa.me/524151393219?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 text-sm text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all"
        >
          <FaWhatsapp className="text-emerald-400/70" /> WhatsApp
        </a>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleNuevaReserva}
          className="flex-1 py-3 bg-white text-[#0a0a0f] font-semibold rounded-lg text-sm hover:bg-white/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <FaCalendarPlus className="text-xs" /> {t.newBooking || 'Nueva reserva'}
        </button>
        <Link
          href="/"
          className="px-5 py-3 text-sm text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all flex items-center gap-2"
        >
          <FaHome className="text-xs" /> {t.home || 'Inicio'}
        </Link>
      </div>

      <p className="text-center text-[11px] text-white/15 mt-6">
        {t.emailNote || 'Se envió un correo de confirmación con tu hoja de servicio a tu email.'}
      </p>
    </div>
  );
}
