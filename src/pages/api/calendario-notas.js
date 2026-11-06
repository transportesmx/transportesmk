
/**
 * Google Calendar - Notas de Venta Transportes MX
 * Integración independiente del sistema de reservaciones y Stripe.
 *
 * Este archivo crea eventos de Google Calendar
 * exclusivamente para las notas de venta.
 */

import { crearEventoCalendario } from '@/lib/google-calendar';

export default async function handler(req, res) {
  // Solo aceptar solicitudes POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);

    return res.status(405).json({
      message: 'Método no permitido',
    });
  }

  try {
    // Recibir los datos de la nota de venta
    const nota = req.body?.nota || req.body;

    if (!nota) {
      return res.status(400).json({
        message: 'Faltan los datos de la nota de venta',
      });
    }

    // Adaptar los datos de la nota al formato de Google Calendar
    const reservaCalendar = {
      clienteNombre:
        nota.cliente || nota.clienteNombre || '',

      clienteTelefono:
        nota.telefono || nota.clienteTelefono || '',

      clienteEmail:
        nota.email || nota.clienteEmail || '',

      fechaIda:
        nota.fecha || nota.fechaIda || '',

      horaIda:
        nota.hora || nota.horaIda || '12:00',

      origen:
        nota.origen || '',

      destino:
        nota.destino || '',

      vehiculoNombre:
        nota.unidad || nota.vehiculoNombre || '',

      numPasajeros:
        nota.pasajeros || nota.numPasajeros || '',

      precioTotal:
        nota.importe || nota.precioTotal || 0,

      tipoViaje: 'sencillo',

      distancia: '',
      duracion: '',
    };

    // Validar que exista la fecha
    if (!reservaCalendar.fechaIda) {
      return res.status(400).json({
        message: 'La fecha de la nota de venta es obligatoria',
      });
    }

    // Crear evento en Google Calendar
    const eventId = await crearEventoCalendario(
      reservaCalendar
    );

    if (!eventId) {
      return res.status(500).json({
        message:
          'No se pudo crear el evento en Google Calendar',
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      eventId,
      message:
        'Evento creado correctamente en Google Calendar',
    });

  } catch (error) {
    console.error(
      '[Google Calendar - Notas de Venta]',
      error
    );

    return res.status(500).json({
      message:
        'Error al crear el evento en Google Calendar',
    });
  }
}
