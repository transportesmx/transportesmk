import React, { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { AppContext } from '@/Context/AppContext';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaHome, FaWhatsapp, FaSpinner } from 'react-icons/fa';

export default function Exito() {
  const router = useRouter();
  const { session_id } = router.query;
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.exito || {};

  const [status, setStatus] = useState('loading'); // loading | verifying | success | error
  const [details, setDetails] = useState(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!session_id || hasVerified.current) return;
    hasVerified.current = true;

    const verificarPago = async () => {
      setStatus('verifying');
      try {
        const res = await fetch('/api/pagos/verificar-sesion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session_id }),
        });

        const data = await res.json();
        console.log('[Éxito] Verificación:', data);

        if (data.status === 'success' || data.already_processed) {
          setStatus('success');
          setDetails(data.reservaData || null);
        } else if (data.status === 'pending') {
          // Para OXXO u otros métodos async, el pago puede estar pendiente
          setStatus('success');
        } else {
          setStatus('success'); // Mostrar éxito de todas formas
        }
      } catch (err) {
        console.error('[Éxito] Error verificando:', err);
        setStatus('success'); // Mostrar éxito aunque falle la verificación
      }
    };

    verificarPago();
  }, [session_id]);

  useEffect(() => {
    if (!session_id && router.isReady) {
      setStatus('success');
    }
  }, [router.isReady, session_id]);

  const isLoading = status === 'loading' || status === 'verifying';

  return (
    <>
      <Head>
        <title>{t.pageTitle || '¡Pago exitoso!'} | TransportesMX</title>
      </Head>
      <div className="min-h-[calc(100vh-64px)] bg-black flex items-center justify-center p-4">
        <motion.div
          className="relative z-10 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 p-8 text-center">
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {isLoading ? (
                <FaSpinner className="text-white text-3xl animate-spin" />
              ) : (
                <FaCheckCircle className="text-white text-4xl" />
              )}
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {isLoading
                ? (t.verifying || 'Verificando pago...')
                : (t.title || '¡Pago Exitoso!')}
            </h1>
            <p className="text-green-100 text-sm">
              {isLoading
                ? (t.verifyingNote || 'Estamos confirmando tu pago y enviando tu hoja de servicio...')
                : (t.subtitle || 'Tu reserva ha sido confirmada')}
            </p>
          </div>

          {/* Body */}
          <div className="bg-gray-900 p-6 text-center border border-white/5 border-t-0">
            {isLoading ? (
              <div className="py-4">
                <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span>{t.processing || 'Generando PDF y enviando confirmación...'}</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-6">
                  {t.emailNote || 'Recibirás un correo de confirmación con los detalles de tu traslado.'}
                </p>

                {session_id && (
                  <div className="bg-white/5 rounded-xl p-3 mb-6 border border-white/10">
                    <p className="text-xs text-gray-500">{t.transactionId || 'ID de transacción'}</p>
                    <p className="text-sm text-white font-mono truncate">{session_id}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <motion.a
                    href="https://wa.me/524151393219?text=Hola%2C%20acabo%20de%20realizar%20una%20reserva"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-green-600/20 border border-green-500/30 rounded-xl text-green-400 font-semibold hover:bg-green-600/30 transition"
                    whileTap={{ scale: 0.97 }}
                  >
                    <FaWhatsapp /> {t.whatsapp || 'Confirmar por WhatsApp'}
                  </motion.a>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-bold hover:from-blue-700 hover:to-blue-800 transition"
                  >
                    <FaHome /> {t.home || 'Volver al inicio'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
