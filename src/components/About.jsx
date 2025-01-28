import React from 'react'

function About() {
  return (
    <div className="relative bg-cover bg-center min-h-screen" style={{ backgroundImage: 'url(/assets/images/about.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Section */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Más de 10 años de experiencia ofreciendo transporte turístico y ejecutivo de excelencia.
            </h1>
            <ul className="space-y-4 text-sm sm:text-base md:text-lg">
              <li className="flex items-center">
                <span className="text-xl md:text-2xl mr-2">🕒</span>
                Puntualidad garantizada.
              </li>
              <li className="flex items-center">
                <span className="text-xl md:text-2xl mr-2">🚖</span>
                Choferes altamente capacitados.
              </li>
              <li className="flex items-center">
                <span className="text-xl md:text-2xl mr-2">🚌</span>
                Vehículos en perfectas condiciones.
              </li>
              <li className="flex items-center">
                <span className="text-xl md:text-2xl mr-2">📞</span>
                Atención personalizada 24/7.
              </li>
            </ul>
            <div className="flex space-x-4 mt-6 text-xl md:text-2xl">
              <a href="#" aria-label="Facebook" className="hover:opacity-75">🌐</a>
              <a href="#" aria-label="Instagram" className="hover:opacity-75">📷</a>
              <a href="#" aria-label="TikTok" className="hover:opacity-75">🎥</a>
              <a href="#" aria-label="TripAdvisor" className="hover:opacity-75">🗺</a>
              <a href="#" aria-label="WhatsApp" className="hover:opacity-75">💬</a>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Misión:</h2>
              <p className="text-sm sm:text-base md:text-lg">
                Ofrecer servicios de transporte de calidad, garantizando la mejor experiencia para
                nuestros clientes, con un enfoque en puntualidad, seguridad y atención personalizada.
              </p>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Visión:</h2>
              <p className="text-sm sm:text-base md:text-lg">
                Ser la compañía de transporte más confiable y reconocida, destacándonos por nuestra
                excelencia y profesionalismo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About