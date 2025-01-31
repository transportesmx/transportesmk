import React from 'react'
import Formulario from './Formulario'

function Aeropuerto() {
  return (
    <div className='h-[800px] flex flex-col justify-center lg:justify-start items-center lg:items-start'
    style={{backgroundImage: 'url(/assets/images/aeropuerto.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}
    >
      <h1 className='text-[40px] lg:text-[50px] font-bold mb-2'>Traslado a Aeropuerto</h1>
      <p className='text-lg lg:text-xl text-center px-4 mb-6'>Servicio personalizado, rápido y confiable.</p>

      <Formulario/>

    </div>
  )
}

export default Aeropuerto