/**
 * Motor de cálculo de precios para TransportesMX
 * Tarifa base: $800 para todos los vehículos
 * Recargo aeropuerto: $200
 * Distancia máxima: 90 km desde San Miguel de Allende
 */

// Medidas de maleta (iguales para todos los vehículos)
export const medidasMaleta = {
  alto: 63,
  ancho: 36,
  profundidad: 21,
  unidad: 'cm',
};

// Vehículos disponibles con sus características
export const vehiculos = [
  {
    id: 'sedan',
    nombre: 'Sedán Ejecutivo',
    descripcion: 'Toyota Camry o similar',
    capacidadPasajeros: 3,
    capacidadEquipaje: 3,
    imagen: '/assets/images/camry.png',
    precioPorKm: 21,
    precioBase: 800,
    caracteristicas: ['Aire acondicionado', 'Asientos de piel', 'WiFi disponible'],
    popular: false,
    disponibleReservacion: true,
  },
  {
    id: 'suv',
    nombre: 'Suburban',
    descripcion: 'Chevrolet Suburban',
    capacidadPasajeros: 6,
    capacidadEquipaje: 8,
    imagen: '/assets/images/suburban.png',
    precioPorKm: 40,
    precioBase: 800,
    caracteristicas: ['Máximo confort', 'Amplio equipaje', 'Ideal para familias'],
    popular: true,
    disponibleReservacion: true,
  },
  {
    id: 'minivan',
    nombre: 'Minivan',
    descripcion: 'Honda Odyssey o similar',
    capacidadPasajeros: 6,
    capacidadEquipaje: 8,
    imagen: '/assets/images/odissey.png',
    precioPorKm: 32,
    precioBase: 800,
    caracteristicas: ['Espacio amplio', 'Viaje cómodo', 'Ideal grupos pequeños'],
    popular: false,
    disponibleReservacion: true,
  },
  {
    id: 'hiace',
    nombre: 'Toyota Hiace',
    descripcion: 'Toyota Hiace 8 pax',
    capacidadPasajeros: 8,
    capacidadEquipaje: 10,
    imagen: '/assets/images/hiace.png',
    precioPorKm: 49,
    precioBase: 800,
    caracteristicas: ['Grupos medianos', 'Gran capacidad equipaje', 'Cómoda y espaciosa'],
    popular: false,
    disponibleReservacion: true,
  },
  {
    id: 'sprinter',
    nombre: 'Sprinter VIP',
    descripcion: 'Mercedes Sprinter 20 pax',
    capacidadPasajeros: 20,
    capacidadEquipaje: 20,
    imagen: '/assets/images/sprinter.png',
    precioPorKm: 73,
    precioBase: 800,
    caracteristicas: ['Grupos grandes', 'Bodas y eventos', 'Máxima capacidad'],
    popular: false,
    disponibleReservacion: true, // No disponible hasta definir precio/km
  },
];

// Distancia máxima permitida (en km)
export const DISTANCIA_MAXIMA_KM = 90;

// Recargos por zona (aeropuertos, etc.)
export const zonasEspeciales = {
  'aeropuerto': { recargo: 200 },
  'airport': { recargo: 200 },
  'BJX': { recargo: 200 },
  'AIQ': { recargo: 200 },
  'AICM': { recargo: 200 },
  'AIFA': { recargo: 200 },
  'GDL': { recargo: 200 },
};

/**
 * Calcula el precio del servicio
 * Fórmula: Tarifa base ($800) + (distancia × precio/km) + recargos
 */
export function calcularPrecio({ vehiculoId, distanciaMetros, idaYVuelta, origen = '', destino = '' }) {
  const vehiculo = vehiculos.find(v => v.id === vehiculoId);
  if (!vehiculo) throw new Error('Vehículo no encontrado');
  if (!vehiculo.disponibleReservacion) throw new Error('Vehículo no disponible para reservación');

  const distanciaKm = distanciaMetros / 1000;

  // Verificar distancia máxima
  if (distanciaKm > DISTANCIA_MAXIMA_KM) {
    throw new Error(`Distancia máxima permitida: ${DISTANCIA_MAXIMA_KM} km`);
  }

  let precioIda = vehiculo.precioBase + (distanciaKm * vehiculo.precioPorKm);

  // Recargos por zona (aeropuertos)
  let recargoZona = 0;
  const textoCompleto = `${origen} ${destino}`.toLowerCase();
  for (const [zona, config] of Object.entries(zonasEspeciales)) {
    if (textoCompleto.includes(zona.toLowerCase())) {
      recargoZona = config.recargo; // Solo un recargo, no acumulativo
      break;
    }
  }
  precioIda += recargoZona;

  // Redondear al múltiplo de 50 más cercano hacia arriba
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
 * Filtra vehículos según número de pasajeros Y/O maletas (solo los disponibles para reservación)
 */
export function filtrarVehiculosPorCapacidad(numPasajeros, numMaletas = 0) {
  return vehiculos.filter(v =>
    v.disponibleReservacion &&
    v.capacidadPasajeros >= numPasajeros &&
    v.capacidadEquipaje >= numMaletas
  );
}

// Alias de compatibilidad
export function filtrarVehiculosPorPasajeros(numPasajeros) {
  return filtrarVehiculosPorCapacidad(numPasajeros, 0);
}
