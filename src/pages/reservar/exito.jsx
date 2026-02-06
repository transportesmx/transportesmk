import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaHome, FaWhatsapp, FaSpinner } from 'react-icons/fa';

export default function Exito() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      console.log('Sesión de pago:', session_id);
      setLoading(false);
    } else if (router.isReady) {
      setLoading(false);
    }
  }, [session_id, router.isReady]);

  return (
    <>
      <Head>
        <title>¡Pago exitoso! | TransportesMX</title>
      </Head>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gradient-to-br from-green-950/40 via-black to-blue-950/40" />

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
              <FaCheckCircle className="text-white text-4xl" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h1>
            <p className="text-green-100 text-sm">Tu reserva ha sido confirmada</p>
          </div>

          {/* Body */}
          <div className="bg-gray-900 p-6 text-center border border-white/5 border-t-0">
            <p className="text-gray-400 text-sm mb-6">
              Recibirás un correo de confirmación con los detalles de tu traslado.
            </p>

            {session_id && (
              <div className="bg-white/5 rounded-xl p-3 mb-6 border border-white/10">
                <p className="text-xs text-gray-500">ID de transacción</p>
                <p className="text-sm text-white font-mono">{session_id}</p>
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
                <FaWhatsapp /> Confirmar por WhatsApp
              </motion.a>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-bold hover:from-blue-700 hover:to-blue-800 transition"
              >
                <FaHome /> Volver al inicio
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
