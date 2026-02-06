/**
 * Motor de cálculo de precios para TransportesMX
 */

// Vehículos disponibles con sus características
export const vehiculos = [
  {
    id: 'sedan',
    nombre: 'Sedán Ejecutivo',
    descripcion: 'Toyota Camry o similar',
    capacidadPasajeros: 3,
    capacidadEquipaje: 2,
    imagen: '/assets/images/camry.png',
    precioPorKm: 12,
    precioBase: 350,
    precioMinimo: 500,
    caracteristicas: ['Aire acondicionado', 'Asientos de piel', 'WiFi disponible'],
    popular: false,
  },
  {
    id: 'suv',
    nombre: 'SUV Premium',
    descripcion: 'Chevrolet Suburban',
    capacidadPasajeros: 6,
    capacidadEquipaje: 5,
    imagen: '/assets/images/suburban.png',
    precioPorKm: 16,
    precioBase: 500,
    precioMinimo: 700,
    caracteristicas: ['Máximo confort', 'Amplio equipaje', 'Ideal para familias'],
    popular: true,
  },
  {
    id: 'minivan',
    nombre: 'Minivan',
    descripcion: 'Honda Odyssey o similar',
    capacidadPasajeros: 6,
    capacidadEquipaje: 4,
    imagen: '/assets/images/odissey.png',
    precioPorKm: 14,
    precioBase: 450,
    precioMinimo: 650,
    caracteristicas: ['Espacio amplio', 'Viaje cómodo', 'Ideal grupos pequeños'],
    popular: false,
  },
  {
    id: 'sprinter',
    nombre: 'Sprinter VIP',
    descripcion: 'Mercedes Sprinter 20 pax',
    capacidadPasajeros: 20,
    capacidadEquipaje: 20,
    imagen: '/assets/images/sprinter.png',
    precioPorKm: 28,
    precioBase: 1200,
    precioMinimo: 2000,
    caracteristicas: ['Grupos grandes', 'Bodas y eventos', 'Máxima capacidad'],
    popular: false,
  },
  {
    id: 'autobus',
    nombre: 'Autobús de Lujo',
    descripcion: 'Autobús 50 pasajeros',
    capacidadPasajeros: 50,
    capacidadEquipaje: 50,
    imagen: '/assets/images/autobus.png',
    precioPorKm: 45,
    precioBase: 3000,
    precioMinimo: 5000,
    caracteristicas: ['Convenciones', 'Tours grupales', 'Entretenimiento a bordo'],
    popular: false,
  },
];

// Zonas de precio especial (aeropuertos, etc.)
export const zonasEspeciales = {
  'Aeropuerto AICM': { recargo: 200 },
  'Aeropuerto AIFA': { recargo: 200 },
  'Aeropuerto BJX': { recargo: 150 },
  'Aeropuerto AIQ': { recargo: 150 },
  'Aeropuerto GDL': { recargo: 200 },
};

/**
 * Calcula el precio del servicio
 */
export function calcularPrecio({ vehiculoId, distanciaMetros, idaYVuelta, origen = '', destino = '' }) {
  const vehiculo = vehiculos.find(v => v.id === vehiculoId);
  if (!vehiculo) throw new Error('Vehículo no encontrado');

  const distanciaKm = distanciaMetros / 1000;

  let precioIda = vehiculo.precioBase + (distanciaKm * vehiculo.precioPorKm);

  let recargoZona = 0;
  for (const [zona, config] of Object.entries(zonasEspeciales)) {
    if (origen.toLowerCase().includes(zona.toLowerCase()) || 
        destino.toLowerCase().includes(zona.toLowerCase())) {
      recargoZona += config.recargo;
    }
  }
  precioIda += recargoZona;

  precioIda = Math.max(precioIda, vehiculo.precioMinimo);
  precioIda = Math.ceil(precioIda / 50) * 50;

  const precioIdaVuelta = idaYVuelta ? Math.ceil((precioIda * 2 * 0.9) / 50) * 50 : null;
  const precioTotal = idaYVuelta ? precioIdaVuelta : precioIda;

  return {
    precioIda,
    precioTotal,
    moneda: 'MXN',
    desglose: {
      tarifaBase: vehiculo.precioBase,
      distanciaKm: Math.round(distanciaKm * 10) / 10,
      precioPorKm: vehiculo.precioPorKm,
      costoDistancia: Math.round(distanciaKm * vehiculo.precioPorKm),
      recargoZona,
      descuentoIdaVuelta: idaYVuelta ? Math.round(precioIda * 2 * 0.1) : 0,
      vehiculo: vehiculo.nombre,
    },
  };
}

/**
 * Filtra vehículos según número de pasajeros
 */
export function filtrarVehiculosPorPasajeros(numPasajeros) {
  return vehiculos.filter(v => v.capacidadPasajeros >= numPasajeros);
}
