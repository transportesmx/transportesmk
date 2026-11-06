
/**
 * Google Calendar - Notas de Venta Transportes MX
 * Integración independiente del sistema de reservaciones y Stripe.
 *
 * Crea eventos de Google Calendar para las notas de venta.
 * Soporta viajes sencillos e ida y vuelta.
 */

import { crearEventoCalendario } from '@/lib/google-calendar';

export default async function handler(req, res) {
  // Solo aceptar solicitudes POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);

    return res.status(405).json({
      success: false,
      message: 'Método no permitido',
    });
  }

  try {
    // Recibir datos de la nota de venta
    const nota = req.body?.nota || req.body;

    if (!nota || typeof nota !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Faltan los datos de la nota de venta',
      });
    }

    // Detectar si el viaje es ida y vuelta
    const idaVueltaTexto = String(
      nota.idaVuelta || nota.tipoViaje || ''
    )
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const esRedondo =
      idaVueltaTexto.includes('si') ||
      idaVueltaTexto.includes('redondo') ||
      idaVueltaTexto.includes('ida y vuelta') ||
      idaVueltaTexto.includes('round trip');

    // Preparar datos para Google Calendar
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

      tipoViaje: esRedondo ? 'redondo' : 'sencillo',

      // Datos del regreso
      fechaRegreso:
        nota.regresoFecha || nota.fechaRegreso || '',

      horaRegreso:
        nota.regresoHora || nota.horaRegreso || '12:00',

      aerolinea:
        nota.aerolinea || '',

      observaciones:
        nota.observaciones || '',

      distancia: '',
      duracion: '',
    };

    // Validar fecha de ida
    if (!reservaCalendar.fechaIda) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de ida es obligatoria',
      });
    }

    // Validar fecha de regreso si es viaje redondo
    if (
      reservaCalendar.tipoViaje === 'redondo' &&
      !reservaCalendar.fechaRegreso
    ) {
      return res.status(400).json({
        success: false,
        message:
          'La fecha de regreso es obligatoria para un viaje de ida y vuelta',
      });
    }

    // Crear evento(s) en Google Calendar
    const eventId = await crearEventoCalendario(
      reservaCalendar
    );

    if (!eventId) {
      return res.status(500).json({
        success: false,
        message:
          'No se pudo crear el evento en Google Calendar',
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      eventId,
      tipoViaje: reservaCalendar.tipoViaje,
      message:
        reservaCalendar.tipoViaje === 'redondo'
          ? 'Viaje de ida y vuelta enviado correctamente a Google Calendar'
          : 'Evento creado correctamente en Google Calendar',
    });
  } catch (error) {
    console.error(
      '[Google Calendar - Notas de Venta]',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Error al crear el evento en Google Calendar',
    });
  }
}
