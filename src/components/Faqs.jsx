import { motion } from 'framer-motion';
import { useState } from 'react';

const faqData = [
  {
    question: '¿Cómo puedo solicitar una cotización?',
    answer:
      'Puedes solicitar una cotización completando el formulario en esta página. Nuestro equipo te responderá a través de WhatsApp en pocos minutos para brindarte todos los detalles.',
  },
  {
    question: '¿Cuánto tiempo tardan en confirmar mi reservación?',
    answer: 'Nuestro equipo confirmará tu reservación dentro de las siguientes 24 horas.',
  },
  {
    question: '¿Qué servicios de transporte ofrecen?',
    answer: 'Ofrecemos transporte privado, grupal y ejecutivo dependiendo de la necesidad del cliente.',
  },
  {
    question: '¿Los vehículos son privados o compartidos?',
    answer: 'Los vehículos son privados, garantizando tu comodidad y privacidad durante el trayecto.',
  },
  {
    question: '¿Con cuánto tiempo de anticipación debo reservar?',
    answer: 'Te recomendamos reservar al menos 48 horas antes de tu viaje para asegurar disponibilidad.',
  },
];

export default function Faqs() {
  const [selectedFaq, setSelectedFaq] = useState(null);

  const toggleFaq = (index) => {
    setSelectedFaq(selectedFaq === index ? null : index);
  };

  return (
    <div className="relative bg-cover bg-center h-[1100px] md:h-[750px] px-6 sm:px-10 lg:px-16 py-10 flex flex-col justify-center" style={{ backgroundImage: 'url(/assets/images/faqs.png)' }}>
      <h2 className="text-4xl font-bold text-center lg:text-left text-white mb-10">Preguntas Frecuentes</h2>
      <div className='flex items-center justify-around gap-4'>
{/* izquierda */}
      <div className="lg:w-2/3 mx-auto">
        {faqData.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-gray-100/15 p-5 mb-4 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-center cursor-pointer gap-6" onClick={() => toggleFaq(index)}>
              <h3 className="text-[22px] font-semibold text-white">{faq.question}</h3>
              <span className="text-white text-[22px]">{selectedFaq === index ? '-' : '+'}</span>
            </div>
            {selectedFaq === index && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-white mt-2 text-[18px]">{faq.answer}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <div>

      </div>
      <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay:  0.2 }}
            className="hidden   h-[435px] w-1/3 bg-gray-100/15 p-5 mb-4 rounded-lg shadow-lg lg:flex flex-col items-center justify-center"
          >
            <img src="/assets/icons/mensaje.png" alt="FAQs" className="w-[67px] h-[68px] object-cover rounded-lg" />
            <h3 className='text-white text-[22px] font-semibold text-center mt-4'>
            ¿Tienes mas preguntas?
            </h3>
            <p className='text-[16px] text-center mt-4'>Estamos para apoyarte en todo momento por favor da click en el boton para comenzar a chatear.</p>
            <button className='px-24 py-2  bg-white/50 hover:bg-gray-700 rounded-lg transition mt-8 font-bold'>
              Chatear
            </button>

          </motion.div>

        </div>
    </div>
  );
}
