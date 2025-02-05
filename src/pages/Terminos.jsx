import { motion } from "framer-motion";
import Link from "next/link";

const TermsAndConditions = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10 px-6 sm:px-12 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Términos y Condiciones
        </h1>
        <p className="text-gray-600 mb-6">
          Última actualización: <strong>10 de enero de 2025</strong>
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
            Bienvenido a **Transportes MX**. Al acceder y utilizar nuestro sitio web, usted acepta cumplir con estos términos y condiciones. Si no está de acuerdo, le recomendamos que no utilice nuestros servicios.
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
            2. Uso de los Servicios
          </h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>Debe ser mayor de edad para utilizar nuestros servicios.</li>
            <li>No puede usar nuestros servicios para actividades ilegales.</li>
            <li>Los datos proporcionados deben ser verídicos y actualizados.</li>
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
            3. Reservaciones y Pagos
          </h2>
          <p className="text-gray-600">
            Todas las reservaciones deben realizarse con anticipación. Al hacer una reserva, el usuario acepta:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Realizar el pago a través de los métodos autorizados.</li>
            <li>Proporcionar información precisa al momento de la reserva.</li>
            <li>Aceptar nuestras políticas de cancelación y reembolso.</li>
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
            4. Cancelaciones y Reembolsos
          </h2>
          <p className="text-gray-600">
            Si deseas cancelar un servicio, debes hacerlo con al menos **48 horas** de anticipación para recibir un reembolso completo. Cancelaciones con menos de **24 horas** pueden estar sujetas a cargos administrativos.
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
            5. Responsabilidad del Cliente
          </h2>
          <p className="text-gray-600">
            Al utilizar nuestro servicio, usted acepta:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Cumplir con todas las normas de seguridad establecidas.</li>
            <li>Respetar a nuestros conductores y demás pasajeros.</li>
            <li>Ser puntual en los puntos de recogida y destino.</li>
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
            6. Modificaciones a los Términos
          </h2>
          <p className="text-gray-600">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Se recomienda revisar esta página periódicamente.
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
            7. Contacto
          </h2>
          <p className="text-gray-600">
            Para cualquier consulta sobre estos términos, puedes contactarnos en:
          </p>
          <p className="text-gray-800 font-semibold mt-2">
            📍 Dirección: San Miguel de Allende, GTO, México <br />
            📞 Teléfono: +52 415 139 3219 <br />
            📧 Email: contacto@transportesmx.com
          </p>
        </motion.section>

        
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;
