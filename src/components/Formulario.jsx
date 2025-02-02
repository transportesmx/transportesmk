import React from 'react';

export default function Formulario() {
  return (
    <div className="flex items-center justify-center  ">
      <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
        <h2 className="text-center text-2xl font-semibold text-white mb-4">Cotizar</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Teléfono (Whatsapp)"
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="date"
              className="flex-1 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Número de pasajeros"
              className="flex-1 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            placeholder="Origen"
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Destino"
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full p-3 mt-4 font-semibold text-white bg-white/40 backdrop-blur-sm hover:bg-gray-700 rounded-lg transition shadow-lg"
          >
            Cotizar
          </button>
          
          <p className="text-center text-xs text-white mt-2">
            *Atención personalizada 24/7.
          </p>
        </form>
      </div>
    </div>
  );
}
