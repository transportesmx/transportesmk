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
  const returnD = new Date();
  returnD.setDate(returnD.getDate() + 2);

  const [startDate, setStartDate] = useState(tomorrow);
  const [returnDate, setReturnDate] = useState(returnD );
  const [time, setTime] = useState("12:00");
  const [timeR, setTimeR] = useState("12:00");
  const [returnTime, setReturnTime] = useState("12:00");
  const [isRoundTrip, setIsRoundTrip] = useState(false);


  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    pasajeros: '',
    origen: '',
    destino: '',
    vehicleType: '',
    lada: "+52",
    time: '',
    timeR: '',
    });

   

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    
      if (name === 'time') {
        setTime(value);
      }
      if (name === 'timeR') {
        setTimeR(value);
      }
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
    console.log(nombre, telefono, email, pasajeros, origen, destino, vehicleType);
    if (nombre && telefono &&  email  && origen && destino && vehicleType) {
      console.log(startDate)
      const formattedDate = startDate.toLocaleDateString('es-ES');
      const hora = startDate.toLocaleTimeString('es-ES');
      const message = 
      isRoundTrip == true ? `Hola! Soy ${nombre}. mi correo es ${email}, mi telefono es ${telefono} necesito un traslado para el aeropuerto el dia ${formattedDate} a las ${time}\nOrigen: ${origen}\nDestino: ${destino}\nTipo de vehículo: ${vehicleType}\nRegreso: ${returnDate.toLocaleDateString('es-ES')} a las ${timeR}` :
      `Hola! Soy ${nombre}. mi correo es ${email}, mi telefono es ${lada}${telefono} necesito un traslado para el aeropuerto el dia ${formattedDate} a las ${time}\nOrigen: ${origen}\nDestino: ${destino}\nTipo de vehículo: ${vehicleType}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Por favor, complete todos los campos.');
    }
  };

  return (
    <div className="w-full flex items-center justify-center lg:justify-start px-4 sm:px-6 lg:px-0">
      <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
        <h2 className="text-center text-2xl font-semibold  mb-4">Cotizar</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white text-black placeholder-black  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 w-full">
          <PhoneInput
        country={"mx"} // México como predeterminado // Permite buscar país
        value={formData.telefono}
        onChange={handlePhoneChange}    
        inputStyle={{width: "100%"}} // Oculta el input
        containerStyle={{backgroundColor: "rgba(255, 255, 255, 0.2)", width: "100%"}}
        className="text-black"
      />

          {/*   <input
             type="text"
             name="telefono"
             placeholder="Telefono"
             value={formData.telefono}
            onChange={handleChange}
              className="w-2/3 p-3 rounded-lg bg-white text-black placeholder-black  focus:outline-none focus:ring-2 focus:ring-blue-500"
        
            /> */}
          </div>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white text-black placeholder-black  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col  space-y-4 sm:space-y-0 sm:space-x-2">
  {/* Selector de fecha */}
  <DatePicker
    selected={startDate}
    onChange={(date) => setStartDate(date)}
    minDate={tomorrow} // No permite fechas pasadas
    dateFormat="dd/MM/yyyy" // Solo permite elegir fecha
    className="flex-1 p-3 rounded-lg bg-white text-black placeholder-black  focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    placeholderText="Selecciona una fecha"
  />

 
</div>
  <div className="w-full ">


  {/* Selector de hora */}
  <input
              type="time"
              value={time}
              name="time"
              onChange={handleChange}
              className="flex-1 min-w-[235px] w-full p-3 rounded-lg bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />

              </div>
              <div className="flex items-center space-x-2">
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
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              
              <DatePicker
                selected={returnDate}
                onChange={(date) => setReturnDate(date)}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                className="w-full flex-1 p-3 rounded-lg bg-white placeholder-black text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Selecciona una fecha de regreso"
              />
               <input
              type="time"
              value={timeR}
              name="timeR"
              onChange={handleChange}
              className="flex-1 min-w-[235px] w-full  p-3 rounded-lg bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>
          )}
          <div className="relative w-full">
            
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="mt-1 text-black  rounded-lg py-3 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-3 rounded-lg bg-white text-black placeholder-black  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="destino"
            placeholder="Destino"
            value={formData.destino}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white text-black placeholder-black  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            type="submit"
            className="w-full p-3 mt-4 font-semibold  bg-black/70 backdrop-blur-sm hover:bg-gray-700 rounded-lg transition shadow-lg"
          >
            Cotizar
          </button>
          <p className="text-center text-xs  mt-2">
            *Atención personalizada 24/7.
          </p>
        </form>
      </div>
    </div>
  );
}