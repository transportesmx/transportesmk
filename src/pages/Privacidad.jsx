import { motion } from "framer-motion";
import Link from "next/link";

const Privacidad = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10 px-6 sm:px-12 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Política de Privacidad
        </h1>
        <p className="text-gray-600 mb-6">
          Última actualización: <strong>{new Date().toLocaleDateString()}</strong>
        </p>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            1. Introducción
          </h2>
          <p className="text-gray-600">
            En **Transportes MX**, valoramos la privacidad de nuestros usuarios. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos su información cuando visita nuestro sitio web o utiliza nuestros servicios.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            2. Información que Recopilamos
          </h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>Información personal proporcionada voluntariamente (nombre, correo, teléfono).</li>
            <li>Datos de pago en caso de realizar una reservación.</li>
            <li>Información técnica como dirección IP, navegador, y tiempo de visita.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            3. Uso de la Información
          </h2>
          <p className="text-gray-600">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Procesar y confirmar reservaciones.</li>
            <li>Brindar atención al cliente y asistencia.</li>
            <li>Mejorar nuestros servicios y experiencia del usuario.</li>
            <li>Cumplir con regulaciones legales y de seguridad.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            4. Protección de Datos
          </h2>
          <p className="text-gray-600">
            Implementamos medidas de seguridad para proteger su información personal y prevenir accesos no autorizados. Sin embargo, ningún método de transmisión en Internet es completamente seguro.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            5. Compartición de Información
          </h2>
          <p className="text-gray-600">
            No vendemos ni compartimos su información personal con terceros, excepto en los siguientes casos:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Cuando sea requerido por la ley o autoridad competente.</li>
            <li>Con proveedores de servicios esenciales para la operación del negocio.</li>
            <li>Para proteger nuestros derechos y seguridad.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            6. Cookies y Tecnologías de Seguimiento
          </h2>
          <p className="text-gray-600">
            Utilizamos cookies para mejorar su experiencia de navegación. Puede optar por deshabilitarlas desde la configuración de su navegador.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            7. Derechos del Usuario
          </h2>
          <p className="text-gray-600">
            Usted tiene derecho a:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Solicitar acceso a su información personal.</li>
            <li>Corregir o eliminar datos incorrectos.</li>
            <li>Restringir o limitar el uso de su información.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            8. Cambios en la Política de Privacidad
          </h2>
          <p className="text-gray-600">
            Podemos actualizar esta política de privacidad en cualquier momento. Se recomienda revisarla periódicamente para estar informado sobre posibles cambios.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            9. Contacto
          </h2>
          <p className="text-gray-800 font-semibold mt-2">
            📍 Dirección: San Miguel de Allende, GTO, México <br />
            📞 Teléfono: +52 415 139 3219 <br />
            📧 Email: contacto@transportesmx.org
          </p>
        </motion.section>

        
      </motion.div>
    </div>
  );
};

export default Privacidad;
