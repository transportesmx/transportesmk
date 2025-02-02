import React from 'react'
import Formulario from './Formulario'

function Aeropuerto() {
  return (
    <div className='h-[800px]   '
    style={{backgroundImage: 'url(/assets/images/aeropuerto.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}
    >
      <div className='max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 flex flex-col justify-center lg:justify-start items-center lg:items-start'>

      <h1 className='text-[40px] lg:text-[50px] font-bold mb-2'>Traslado a Aeropuerto</h1>
      <p className='text-lg lg:text-xl text-center px-4 mb-6'>Servicio personalizado, rápido y confiable.</p>
      <div className='w-full px-4 flex flex-col justify-center items-center lg:items-start'>
      <Formulario/>
      </div>
      </div>

    </div>
  )
}

export default Aeropuerto