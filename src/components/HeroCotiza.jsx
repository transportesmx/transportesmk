import React, { useState } from "react";
import { FaMailBulk } from "react-icons/fa";

const HeroCotiza = () => {
  const [from, setFrom] = useState("Aeropuerto Benito");
  const [to, setTo] = useState("Querétaro");
  const [date, setDate] = useState("02/04/2025");

  const locations = ["Aeropuerto Benito", "Aeropuerto CDMX", "Aeropuerto GDL"];
  const destinations = ["Querétaro", "San Miguel de Allende", "León", "Guanajuato"];

  return (
    <div className="flex items-center justify-between bg-white/15 bg-opacity-80 rounded-2xl px-6 py-8 shadow-lg w-[700px] mx-auto gap-4">
      {/* Dropdown: Desde */}
      <div className="relative">
        <label className="block text-white font-bold text-sm">Desde</label>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown: Hacia */}
      <div className="relative">
        <label className="block text-white font-bold text-sm">Hacia</label>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {destinations.map((destination) => (
            <option key={destination} value={destination}>
              {destination}
            </option>
          ))}
        </select>
      </div>

      {/* Input: Fecha */}
      <div className="relative">
        <label className="block text-white font-bold text-sm">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 bg-white/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button className="ml-4 bg-[#0057A9] hover:bg-blue-700 text-white font-bold rounded-lg p-3 transition shadow-lg">
        <img src="/assets/icons/email.png" className="inline-block mr-2" />
      
      </button>
    </div>
  );
};

export default HeroCotiza;
