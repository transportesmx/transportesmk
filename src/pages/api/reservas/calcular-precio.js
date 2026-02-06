import { calcularPrecio, filtrarVehiculosPorPasajeros } from '@/lib/pricing';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { distanciaMetros, idaYVuelta, numPasajeros, origen, destino } = req.body;

  if (!distanciaMetros || !numPasajeros) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos' });
  }

  try {
    const vehiculosDisponibles = filtrarVehiculosPorPasajeros(numPasajeros);
    const vehiculosConPrecio = vehiculosDisponibles.map((v) => {
      const precio = calcularPrecio({
        vehiculoId: v.id,
        distanciaMetros,
        idaYVuelta,
        origen,
        destino,
      });
      return { ...v, precio };
    });

    return res.status(200).json({ vehiculos: vehiculosConPrecio });
  } catch (error) {
    console.error('Error calculando precio:', error);
    return res.status(500).json({ message: error.message });
  }
}
