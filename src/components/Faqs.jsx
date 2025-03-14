import { motion } from "framer-motion";
import { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../Context/AppContext";



const handlePreguntar = () => {
  const phoneNumber = "524151393219"; // Número de WhatsApp con código de país.
  const message = "Hola, tengo una duda";
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
};

export default function Faqs() {

  const {traduccion} = useContext(AppContext);

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
        {traduccion.faqs.title}
      </motion.h2>
      <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
        {/* Sección Izquierda: Preguntas */}
        <motion.div
          className="lg:w-2/3 mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {traduccion.faqs.questions.map((faq, index) => (
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
