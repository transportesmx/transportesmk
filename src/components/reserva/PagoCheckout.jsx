import React, { useState, useContext } from 'react';
import { useReserva } from '@/Context/ReservaContext';
import { AppContext } from '@/Context/AppContext';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaLock, FaShieldAlt, FaCreditCard, FaStore } from 'react-icons/fa';

export default function PagoCheckout({ onNext, onBack }) {
  const { reserva, dispatch } = useReserva();
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.step5 || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePagar = async () => {
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
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        dispatch({
          type: 'SET_PAGO',
          payload: {
            metodoPago: 'demo',
            stripeSessionId: data.sessionId || 'demo_' + Date.now(),
            reservaId: data.reservaId || '',
            estadoPago: 'pagado',
          },
        });
        onNext();
      }
    } catch (err) {
      console.error('Error al crear sesión de pago:', err);
      setError(t.errorConnection || 'Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {t.title || 'Confirmar y pagar'}
        </h2>
        <p className="text-white/40 text-sm mt-1">
          {t.subtitle || 'Revisa tu reserva antes de pagar'}
        </p>
      </div>

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

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.date || 'Fecha'}</p>
            <p className="text-white/60 mt-0.5">{reserva.fechaIda} · {reserva.horaIda}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.vehicle || 'Vehículo'}</p>
            <p className="text-white/60 mt-0.5">{reserva.vehiculoNombre}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.passengers || 'Pasajeros'}</p>
            <p className="text-white/60 mt-0.5">{reserva.numPasajeros}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.trip || 'Viaje'}</p>
            <p className="text-white/60 mt-0.5">
              {reserva.tipoViaje === 'redondo' ? (t.roundTrip || 'Ida y vuelta') : (t.oneWay || 'Sencillo')}
            </p>
          </div>
        </div>

        {reserva.tipoViaje === 'redondo' && reserva.fechaRegreso && (
          <>
            <div className="h-px bg-white/[0.04]" />
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.return || 'Regreso'}</p>
              <p className="text-sm text-white/60 mt-0.5">{reserva.fechaRegreso} · {reserva.horaRegreso}</p>
            </div>
          </>
        )}

        <div className="h-px bg-white/[0.04]" />

        <div className="grid grid-cols-1 gap-1 text-sm">
          <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t.contact || 'Contacto'}</p>
          <p className="text-white/60">{reserva.clienteNombre}</p>
          <p className="text-white/40 text-xs">{reserva.clienteEmail} · {reserva.clienteTelefono}</p>
        </div>

        <div className="h-px bg-white/[0.04]" />

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Total</p>
          <p className="text-2xl font-bold text-white">
            ${reserva.precioTotal?.toLocaleString('es-MX')}
            <span className="text-xs font-normal text-white/25 ml-1">MXN</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px] text-white/20 mb-5">
        <div className="flex items-center gap-1.5">
          <FaCreditCard className="text-xs" />
          <span>{t.cards || 'Tarjetas'}</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <FaStore className="text-xs" />
          <span>OXXO</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <FaLock className="text-emerald-500/50 text-xs" />
          <span>SSL</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <FaShieldAlt className="text-blue-400/50 text-xs" />
          <span>Stripe</span>
        </div>
      </div>

      {error && (
        <motion.p
          className="text-red-400 text-sm text-center bg-red-500/[0.06] border border-red-500/[0.1] rounded-lg p-3 mb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading}
          className="px-5 py-3 text-sm text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all flex items-center gap-2 disabled:opacity-30">
          <FaArrowLeft className="text-xs" /> {t.back || 'Atrás'}
        </button>
        <button onClick={handlePagar} disabled={loading}
          className="flex-1 py-3 bg-white text-[#0a0a0f] font-semibold rounded-lg text-sm hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0a0a0f]/20 border-t-[#0a0a0f] rounded-full animate-spin" />
              {t.redirecting || 'Redirigiendo...'}
            </>
          ) : (
            <>
              <FaLock className="text-xs" />
              {t.payNow || 'Pagar ahora'}
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-white/15 mt-4">
        {t.redirectNote || 'Serás redirigido a Stripe para completar el pago de forma segura.'}
      </p>
    </div>
  );
}
