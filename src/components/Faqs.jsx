import { motion } from 'framer-motion';

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
  return (
    <div className="relative bg-cover bg-center h-[1200px] md:h-[1050px] px-6 sm:px-10 lg:px-16 py-10" style={{ backgroundImage: 'url(/assets/images/faqs.png)' }}>
      <h2 className="text-4xl font-bold text-center lg:text-left text-white mb-10">Preguntas Frecuentes</h2>
      <div className='flex justify-around gap-4'>
{/* izquierda */}
      <div className="w-2/3 mx-auto">
        {faqData.map((faq, index) => (
          <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="bg-gray-100/15 p-5 mb-4 rounded-lg shadow-lg"
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="border-b border-gray-300"
              >
              <h3 className="text-[22px] font-semibold text-white">{faq.question}</h3>
              <p className="text-white mt-2 text-[18px]">{faq.answer}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div>

      </div>
      <div className='hidden lg:block   bg-red-500 h-[800px] w-1/3'>

      </div>
        </div>
    </div>
  );
}
