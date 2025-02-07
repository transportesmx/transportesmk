import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import countryList from 'react-select-country-list';

const vehicleTypes = ['Sedán', 'SUV', 'Minivan', 'Autobús'];

export default function Formulario() {

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [startDate, setStartDate] = useState(tomorrow);

  const [time, setTime] = useState("12:00");


  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    pasajeros: '',
    origen: '',
    destino: '',
    vehicleType: '',
  });

  const countryOptions = countryList().getData().map((country) => ({
    label: `${country.label} ${country.value}`,
    value: country.value,
  }));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCountryChange = (selectedOption) => {
    setFormData({
      ...formData,
      pais: selectedOption.value,
    });
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      telefono: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, telefono, lada,  email, pasajeros, origen, destino, vehicleType } = formData;
    if (nombre && telefono && lada && email && pasajeros && origen && destino && vehicleType) {
      console.log(startDate)
      const formattedDate = startDate.toLocaleDateString('es-ES');
      const hora = startDate.toLocaleTimeString('es-ES');
      const message = `Hola! Soy ${nombre}. mi correo es ${email}, mi telefono es ${lada}${telefono} necesito un traslado para el aeropuerto el dia ${formattedDate} a las ${time}, somos ${pasajeros} personas\nOrigen: ${origen}\nDestino: ${destino}\nTipo de vehículo: ${vehicleType}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Por favor, complete todos los campos.');
    }
  };

  return (
    <div className="w-full flex items-center justify-center lg:justify-start px-4 sm:px-6 lg:px-0">
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
          <div className="flex gap-2 w-full">
            <input
               type="text"
               name="lada"
               placeholder="Lada"
               value={formData.lada}
            onChange={handleChange}
              className="w-1/3  p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            
            />
            <input
             type="text"
             name="telefono"
             placeholder="Telefono"
             value={formData.telefono}
            onChange={handleChange}
              className="w-2/3 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        
            />
          </div>
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
              minDate={tomorrow} // No permite fechas pasadas
              dateFormat="dd/MM/yyyy" // Solo permite elegir fecha
              className="w-full flex-1 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Selecciona una fecha"
            />
  <input
          type="time"
          value={time}
            onChange={handleChange}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="relative w-full">
            
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vehicleTypes.map((type) => (
                <option key={type} value={type} className="text-black">{type}</option>
              ))}
            </select>
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