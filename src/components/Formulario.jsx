import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";import 'react-phone-input-2/lib/style.css';
import Select from "react-select";
import countryList from "country-codes-list";

const vehicleTypes = ['Sedán 3 pax', 'SUV 4 pax', 'Minivan 6 pax', 'Suburban 6 pax', 'Toyota Hiace 12 pax', 'Sprinter 20 pax', 'Autobús 50 pax'];

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
    lada: "+52"
    });

   

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
          <PhoneInput
        country={"mx"} // México como predeterminado // Permite buscar país
        value={formData.telefono}
        onChange={handlePhoneChange}    
        inputStyle={{width: "100%"}} // Oculta el input
        className="text-black"
      />

          {/*   <input
             type="text"
             name="telefono"
             placeholder="Telefono"
             value={formData.telefono}
            onChange={handleChange}
              className="w-2/3 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        
            /> */}
          </div>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-2">
  {/* Selector de fecha */}
  <DatePicker
    selected={startDate}
    onChange={(date) => setStartDate(date)}
    minDate={tomorrow} // No permite fechas pasadas
    dateFormat="dd/MM/yyyy" // Solo permite elegir fecha
    className="flex-1 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    placeholderText="Selecciona una fecha"
  />

  {/* Selector de hora */}
  <input
    type="time"
    value={time}
    name="time"
    onChange={handleChange}
    className="flex-1 p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
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