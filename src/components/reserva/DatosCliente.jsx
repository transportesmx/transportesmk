import React, { useState, useContext } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaArrowRight, FaLock } from 'react-icons/fa';

export default function DatosCliente({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.step4 || {};

  const [nombre, setNombre] = useState(reserva.clienteNombre || '');
  const [email, setEmail] = useState(reserva.clienteEmail || '');
  const [telefono, setTelefono] = useState(reserva.clienteTelefono || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim()) { setError(t.errorName || 'Ingresa tu nombre completo'); return; }
    if (!email.trim() || !email.includes('@')) { setError(t.errorEmail || 'Ingresa un email válido'); return; }
    if (!telefono.trim() || telefono.length < 10) { setError(t.errorPhone || 'Ingresa un teléfono válido (10 dígitos)'); return; }

    dispatch({
      type: 'SET_CLIENTE',
      payload: { clienteNombre: nombre.trim(), clienteEmail: email.trim(), clienteTelefono: telefono.trim() },
    });
    onNext();
  };

  const inputBase = 'w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200';

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {t.title || 'Tus datos'}
        </h2>
        <p className="text-white/80 text-sm mt-1">
          {t.subtitle || 'Necesitamos tu información para confirmar'}
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between text-sm">
          <div className="flex-1 min-w-0">
            <p className="text-white/30 text-[10px] uppercase tracking-wider font-medium mb-1">{t.summary || 'Resumen del servicio'}</p>
            <p className="text-white/60 text-xs truncate">{reserva.origen} → {reserva.destino}</p>
            <div className="flex items-center gap-3 mt-1 text-white/30 text-xs">
              <span>{reserva.fechaIda}</span>
              <span>·</span>
              <span>{reserva.vehiculoNombre}</span>
              <span>·</span>
              <span>{reserva.distancia}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0 pl-4">
            <p className="text-xl font-bold text-white">${reserva.precioTotal?.toLocaleString('es-MX')}</p>
            <p className="text-[10px] text-white/20">MXN</p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/80 mb-1.5 flex items-center gap-1.5">
              <FaUser className="text-[10px]" /> {t.fullName || 'Nombre completo'}
            </label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
              placeholder={t.namePlaceholder || 'Juan Pérez'} className={inputBase} />
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1.5 flex items-center gap-1.5">
              <FaEnvelope className="text-[10px]" /> {t.email || 'Correo electrónico'}
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com" className={inputBase} />
            <p className="text-[11px] text-white/60 mt-1">
              {t.emailNote || 'Aquí recibirás tu confirmación y hoja de servicio'}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1.5 flex items-center gap-1.5">
              <FaPhone className="text-[10px]" /> {t.phone || 'Teléfono'}
            </label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
              placeholder="+52 415 123 4567" className={inputBase} />
          </div>

          <div className="flex items-start gap-2 text-[11px] text-white/60 pt-1">
            <FaLock className="text-emerald-500/50 mt-0.5 flex-shrink-0" />
            <span>{t.privacy || 'Tus datos están protegidos con encriptación SSL. Nunca los compartiremos.'}</span>
          </div>

          {error && (
            <motion.p
              className="text-red-400 text-sm text-center bg-red-500/[0.06] border border-red-500/[0.1] rounded-lg p-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onBack}
              className="px-5 py-3 text-sm text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all flex items-center gap-2">
              <FaArrowLeft className="text-xs" /> {t.back || 'Atrás'}
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-white text-[#0a0a0f] font-semibold rounded-lg text-sm hover:bg-white/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
              {t.next || 'Continuar al pago'}
              <FaArrowRight className="text-xs" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
