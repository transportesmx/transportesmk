import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const HeroCotiza = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const returnD = new Date();
  returnD.setDate(returnD.getDate() + 2);

  const [from, setFrom] = useState("Aeropuerto Benito");
  const [to, setTo] = useState("Querétaro");
  const [date, setDate] = useState("2025-04-02");
  const [vehicleType, setVehicleType] = useState("Sedán");
  const [passengerCount, setPassengerCount] = useState(1);
  const [time, setTime] = useState("12:00");
  const [returnTime, setReturnTime] = useState("12:00");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [startDate, setStartDate] = useState(tomorrow);
  const [timeR, setTimeR] = useState("12:00");

  const [returnDate, setReturnDate] = useState(returnD );


  const locations = ["Aeropuerto AICM", "Aeropuerto AIFA", "Aeropuerto BJX GTO", "Aeropuerto AIQ QRO", "Aeropuerto GDL","Ciudad Querétaro", "San Miguel de Allende", "Ciudad Guanajuato" ];
  const destinations = ["Ciudad Querétaro", "San Miguel de Allende","Ciudad Guanajuato","Aeropuerto AICM", "Aeropuerto AIFA", "Aeropuerto BJX GTO", "Aeropuerto AIQ QRO", "Aeropuerto GDL",];
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
    <div className="flex items-center bg-white/15 bg-opacity-80 rounded-2xl px-6 shadow-lg w-[700px] h-[270px] max-w-4xl mx-auto gap-5 ">
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
      <div className="w-full flex justify-between items-center space-x-2">
        <div className="w-1/3 flex items-center space-x-2">
            <input
              type="checkbox"
              id="roundTrip"
              checked={isRoundTrip}
              onChange={() => setIsRoundTrip(!isRoundTrip)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              
            />
            <label htmlFor="roundTrip" className="text-white">Ida y vuelta</label>
            </div>
            {isRoundTrip && (
  <div className="w-2/3 flex space-x-4">
    <div className="w-full">
    <label className="block text-white font-bold text-sm">Fecha Regreso</label>

      <DatePicker
        selected={returnDate}
        onChange={(date) => setReturnDate(date)}
        minDate={startDate}
        dateFormat="dd/MM/yyyy"
        className="bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholderText="Selecciona una fecha de regreso"
      />
    </div>
    <div className="w-full">
    <label className="block text-white font-bold text-sm">Hora regreso</label>

      <input
        type="time"
        value={timeR}
        name="timeR"
        onChange={(e) => setTimeR(e.target.value)}
        className="bg-white/30 text-white rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
)}
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
