import { motion } from "framer-motion";
import { useState } from "react";

const faqData = [
  {
    question: "¿Cómo puedo solicitar una cotización?",
    answer:
      "Puedes solicitar una cotización completando el formulario en esta página. Nuestro equipo te responderá a través de WhatsApp en pocos minutos para brindarte todos los detalles.",
  },
  {
    question: "¿Cuánto tiempo tardan en confirmar mi reservación?",
    answer:
      "Nuestro equipo confirmará tu reservación dentro de las siguientes 24 horas.",
  },
  {
    question: "¿Qué servicios de transporte ofrecen?",
    answer:
      "Ofrecemos transporte privado, grupal y ejecutivo dependiendo de la necesidad del cliente.",
  },
  {
    question: "¿Los vehículos son privados o compartidos?",
    answer:
      "Los vehículos son privados, garantizando tu comodidad y privacidad durante el trayecto.",
  },
  {
    question: "¿Con cuánto tiempo de anticipación debo reservar?",
    answer:
      "Te recomendamos reservar al menos 48 horas antes de tu viaje para asegurar disponibilidad.",
  },
  {
    question: "¿Qué métodos de pago se aceptan?",
    answer:
      "Aceptamos pagos con tarjeta de crédito y débito, transferencias bancarias y pagos en efectivo.",
  },
  {
    question: "¿Emiten factura?",
    answer:
      "Sí, emitimos factura. Solo proporciona tus datos fiscales al momento de la reserva.",
  },
];

const handlePreguntar = () => {
  const phoneNumber = "524151393219"; // Número de WhatsApp con código de país.
  const message = "Hola, tengo una duda";
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
};

export default function Faqs() {
  const [selectedFaq, setSelectedFaq] = useState(null);

  const toggleFaq = (index) => {
    setSelectedFaq(selectedFaq === index ? null : index);
  };

  return (
    <motion.div
      className="relative bg-cover bg-center min-h-screen px-6 sm:px-10 lg:px-16 py-10 flex flex-col justify-center"
      style={{ backgroundImage: "url(/assets/images/faqs.png)" }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.h2
        className="text-4xl font-bold text-center lg:text-left text-white mb-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Preguntas Frecuentes
      </motion.h2>
      <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
        {/* Sección Izquierda: Preguntas */}
        <motion.div
          className="lg:w-2/3 mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-gray-100/15 p-5 mb-4 rounded-lg shadow-lg"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <h3 className="text-[22px] font-semibold text-white pr-10">
                  {faq.question}
                </h3>
                <span className="text-white text-[22px]">
                  {selectedFaq === index ? "-" : "+"}
                </span>
              </div>
              {selectedFaq === index && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-white mt-2 text-[18px]">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Sección Derecha: Botón de Chat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden lg:flex h-[435px] w-1/3 bg-gray-100/15 p-5 rounded-lg shadow-lg flex-col items-center justify-center"
        >
          <img
            src="/assets/icons/mensaje.png"
            alt="FAQs"
            className="w-[67px] h-[68px] object-cover rounded-lg"
          />
          <h3 className="text-white text-[22px] font-semibold text-center mt-4">
            ¿Tienes más preguntas?
          </h3>
          <p className="text-[16px] text-center mt-4">
            Estamos para apoyarte en todo momento. Da click en el botón para
            comenzar a chatear.
          </p>
          <button
            className="px-24 py-2 bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8 font-bold"
            onClick={handlePreguntar}
          >
            Chatear
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
