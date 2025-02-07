import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const HeroCotiza = () => {
  const [from, setFrom] = useState("Aeropuerto Benito");
  const [to, setTo] = useState("Querétaro");
  const [date, setDate] = useState("2025-04-02");
  const [vehicleType, setVehicleType] = useState("Sedán");
  const [passengerCount, setPassengerCount] = useState(1);
  const [time, setTime] = useState("12:00");

  const locations = ["Aeropuerto AICM", "Aeropuerto AIFA", "Aeropuerto BJX", "Aeropuerto AIQ", "Aeropuerto GDL","Querétaro", "San Miguel de Allende", ];
  const destinations = ["Querétaro", "San Miguel de Allende","Aeropuerto AICM", "Aeropuerto AIFA", "Aeropuerto BJX", "Aeropuerto AIQ", "Aeropuerto GDL",];
  const vehicleTypes = ["Sedán", "SUV", "Van", "Minivan", "Sprinter", "Autobús"];

  const handleCotizar = () => {
    const recipientEmail = "amstrekgrt@gmail.com"; // Reemplaza con tu correo de destino
    const subject = "Solicitud de Cotización de Traslado"; // Asunto del correo
    const body = `Hola, me gustaría cotizar un traslado de ${from} a ${to} el día ${date} a las ${time}.
    
    Tipo de vehículo: ${vehicleType}
    Cantidad de pasajeros: ${passengerCount}`;
  
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
    window.location.href = mailtoUrl; // Abre el cliente de correo del usuario
  };

  return (
    <div className="flex items-center bg-white/15 bg-opacity-80 rounded-2xl px-6 shadow-lg w-[700px] h-[200px] max-w-4xl mx-auto gap-5 ">
      <div className="flex flex-col justify-center gap-4">
    <div className="flex items-center justify-between gap-4 ">
      
      {/* Dropdown: Desde */}
      <div className="relative w-full">
        <label className="block text-white font-bold text-sm">Desde</label>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {locations.map((location) => (
            <option key={location} value={location} className="text-black">{location}</option>
          ))}
        </select>
      </div>

      {/* Dropdown: Hacia */}
      <div className="relative w-full">
        <label className="block text-white font-bold text-sm">Hacia</label>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {destinations.map((destination) => (
            <option key={destination} value={destination} className="text-black">{destination}</option>
          ))}
        </select>
      </div>

      {/* Input: Fecha */}
      <div className="relative w-full">
        <label className="block text-white font-bold text-sm">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      </div>

     
      <div className="flex  items-center justify-between  shadow-lg w-full max-w-3xl mx-auto gap-4">
      {/* Input: Hora y Minuto */}
      <div className="relative w-full">
        <label className="block text-white font-bold text-sm">Hora</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div> 

      {/* Dropdown: Tipo de Vehículo */}
      <div className="relative w-full">
        <label className="block text-white font-bold text-sm">Vehículo</label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {vehicleTypes.map((type) => (
            <option key={type} value={type} className="text-black">{type}</option>
          ))}
        </select>
      </div>

      {/* Input: Número de Pasajeros */}
      <div className="relative w-full">
        <label className="block text-white font-bold text-sm">Pasajeros</label>
        <input
          type="number"
          min="1"
          max="50"
          value={passengerCount}
          onChange={(e) => setPassengerCount(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      </div> 
      </div>
      
      <div className="h-full flex flex-col justify-center items-center">
      {/* Submit Button */}
      <button
        className="bg-[#0057A9] hover:bg-blue-700 text-white font-bold rounded-lg p-3 transition shadow-lg mt-4 md:mt-0"
        onClick={handleCotizar}
      >
        <img src="/assets/icons/email.png" className="text-[30px]" />
      </button>
    </div>
    </div>
  );
};

export default HeroCotiza;
