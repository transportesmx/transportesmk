/**
 * Motor de cálculo de precios para TransportesMX
 * Sistema de banderazos por distancia + precio por km escalonado
 */

export const medidasMaleta = {
  alto: 63,
  ancho: 36,
  profundidad: 21,
  unidad: 'cm',
};

export const vehiculos = [
  {
    id: 'sedan',
    nombre: 'Sedán Ejecutivo',
    descripcion: 'Toyota Camry o similar',
    capacidadPasajeros: 3,
    capacidadEquipaje: 3,
    imagen: '/assets/images/camry.png',
    kmMinimo: 10,
    precioPorKm: 22,
    tarifas: [
      { hastaKm: 150, precioPorKm: 22 },
      { hastaKm: Infinity, precioPorKm: 21 },
    ],
    banderazos: [
      { hastaKm: 50, monto: 500 },
    ],
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
    kmMinimo: 20,
    precioPorKm: 40,
    tarifas: [
      { hastaKm: 150, precioPorKm: 40 },
      { hastaKm: Infinity, precioPorKm: 32 },
    ],
    banderazos: [
      { hastaKm: 35, monto: 1800 },
      { hastaKm: 50, monto: 1000 },
      { hastaKm: 60, monto: 600 },
      { hastaKm: 70, monto: 300 },
    ],
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
    kmMinimo: 20,
    precioPorKm: 32,
    tarifas: [
      { hastaKm: 150, precioPorKm: 32 },
      { hastaKm: Infinity, precioPorKm: 30 },
    ],
    banderazos: [
      { hastaKm: 35, monto: 1800 },
      { hastaKm: 50, monto: 1000 },
      { hastaKm: 60, monto: 600 },
      { hastaKm: 70, monto: 300 },
    ],
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
    kmMinimo: 20,
    precioPorKm: 52,
    tarifas: [
      { hastaKm: 150, precioPorKm: 52 },
      { hastaKm: Infinity, precioPorKm: 38 },
    ],
    banderazos: [
      { hastaKm: 35, monto: 1800 },
      { hastaKm: 50, monto: 1000 },
      { hastaKm: 60, monto: 600 },
      { hastaKm: 70, monto: 300 },
    ],
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
    kmMinimo: 20,
    precioPorKm: 75,
    tarifas: [
      { hastaKm: 80, precioPorKm: 75 },
      { hastaKm: 150, precioPorKm: 65 },
      { hastaKm: Infinity, precioPorKm: 60 },
    ],
    banderazos: [
      { hastaKm: 60, monto: 1800 },
      { hastaKm: 70, monto: 1500 },
      { hastaKm: 80, monto: 800 },
    ],
    caracteristicas: ['Grupos grandes', 'Bodas y eventos', 'Máxima capacidad'],
    popular: false,
    disponibleReservacion: true,
  },
];

/**
 * Calcula el precio por km usando tarifas escalonadas.
 * Cada tramo cobra su tarifa solo por los km de ese tramo.
 * Retorna { total, detalleTramos }
 */
function calcularPrecioDistancia(km, tarifas) {
  let restante = km;
  let total = 0;
  let prevLimit = 0;
  const detalleTramos = [];

  for (const tramo of tarifas) {
    const kmEnTramo = Math.min(restante, tramo.hastaKm - prevLimit);
    if (kmEnTramo <= 0) break;
    const montoTramo = kmEnTramo * tramo.precioPorKm;
    total += montoTramo;
    detalleTramos.push({
      concepto: `${kmEnTramo.toFixed(1)} km × $${tramo.precioPorKm}/km`,
      monto: Math.round(montoTramo),
    });
    restante -= kmEnTramo;
    prevLimit = tramo.hastaKm;
    if (restante <= 0) break;
  }

  return { total, detalleTramos };
}

/**
 * Determina el banderazo aplicable según la distancia.
 * Solo aplica si la distancia es menor o igual al máximo banderazo.
 */
function calcularBanderazo(km, banderazos) {
  if (!banderazos || banderazos.length === 0) return 0;
  const maxBanderazoKm = Math.max(...banderazos.map(b => b.hastaKm));
  if (km > maxBanderazoKm) return 0;
  const sorted = [...banderazos].sort((a, b) => a.hastaKm - b.hastaKm);
  for (const b of sorted) {
    if (km <= b.hastaKm) return b.monto;
  }
  return 0;
}

/**
 * Calcula el precio total del servicio
 */
export function calcularPrecio({ vehiculoId, distanciaMetros, idaYVuelta }) {
  const vehiculo = vehiculos.find(v => v.id === vehiculoId);
  if (!vehiculo) throw new Error('Vehículo no encontrado');
  if (!vehiculo.disponibleReservacion) throw new Error('Vehículo no disponible para reservación');

  const distanciaKm = Math.round((distanciaMetros / 1000) * 10) / 10;

  if (distanciaKm < vehiculo.kmMinimo) {
    throw new Error(`Distancia mínima para ${vehiculo.nombre}: ${vehiculo.kmMinimo} km`);
  }

  const desglose = [];

  // 1. Precio por distancia (escalonado)
  const { total: precioDistancia, detalleTramos } = calcularPrecioDistancia(distanciaKm, vehiculo.tarifas);
  desglose.push(...detalleTramos);

  // 2. Banderazo
  const banderazo = calcularBanderazo(distanciaKm, vehiculo.banderazos);
  if (banderazo > 0) {
    desglose.push({ concepto: `Banderazo (≤${Math.ceil(distanciaKm)} km)`, monto: banderazo });
  }

  let precioIda = Math.round(precioDistancia + banderazo);

  // Redondear al múltiplo de 50 más cercano
  precioIda = Math.ceil(precioIda / 50) * 50;

  let precioTotal = precioIda;
  if (idaYVuelta) {
    precioTotal = precioIda * 2;
    desglose.push({ concepto: 'Ida y vuelta (×2)', monto: precioTotal });
  }

  desglose.push({ concepto: 'TOTAL', monto: precioTotal });

  return {
    precioIda,
    precioTotal,
    moneda: 'MXN',
    desglose,
    detalle: {
      distanciaKm,
      vehiculo: vehiculo.nombre,
      banderazo,
    },
  };
}

/**
 * Filtra vehículos según número de pasajeros Y/O maletas
 */
export function filtrarVehiculosPorCapacidad(numPasajeros, numMaletas = 0) {
  return vehiculos.filter(v =>
    v.disponibleReservacion &&
    v.capacidadPasajeros >= numPasajeros &&
    v.capacidadEquipaje >= numMaletas
  );
}

export function filtrarVehiculosPorPasajeros(numPasajeros) {
  return filtrarVehiculosPorCapacidad(numPasajeros, 0);
}
