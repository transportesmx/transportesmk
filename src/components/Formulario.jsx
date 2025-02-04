import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Formulario() {
  const [startDate, setStartDate] = useState(new Date());
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    pasajeros: '',
    origen: '',
    destino: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, telefono, email, pasajeros, origen, destino } = formData;
    if (nombre && telefono && email && pasajeros && origen && destino) {
      const formattedDate = startDate.toLocaleDateString('es-ES');
      const message = `Hola! Soy ${nombre}. mi correo es ${email}, necesito un traslado para el aeropuerto el dia ${formattedDate}, somos ${pasajeros} personas\nOrigen: ${origen}\nDestino: ${destino}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Por favor, complete todos los campos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
        <h2 className="text-center text-2xl font-semibold text-white mb-4">Cotizar</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono (Whatsapp)"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full flex-1 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select a date"
            />
            <input
              type="number"
              name="pasajeros"
              placeholder="Número de pasajeros"
              value={formData.pasajeros}
              onChange={handleChange}
              className="flex-1 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            name="origen"
            placeholder="Origen"
            value={formData.origen}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="destino"
            placeholder="Destino"
            value={formData.destino}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full p-3 mt-4 font-semibold text-white bg-black/70 backdrop-blur-sm hover:bg-gray-700 rounded-lg transition shadow-lg"
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
