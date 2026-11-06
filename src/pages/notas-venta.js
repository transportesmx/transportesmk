
/**
 * Google Calendar - Notas de Venta Transportes MX
 * API exclusiva para notas de venta.
 * Soporta viajes sencillos e ida y vuelta.
 */

import { crearEventoCalendario } from '@/lib/google-calendar';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);

    return res.status(405).json({
      success: false,
      message: 'Método no permitido',
    });
  }

  try {
    const nota = req.body?.nota || req.body;

    if (!nota || typeof nota !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Faltan los datos de la nota de venta',
      });
    }

    // Detectar viaje sencillo o redondo
    const idaVueltaTexto = String(
      nota.idaVuelta || nota.tipoViaje || ''
    )
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const esRedondo = [
      'si',
      'sí',
      'redondo',
      'ida y vuelta',
      'round trip',
    ].some((valor) => idaVueltaTexto === valor ||
      idaVueltaTexto.includes(valor));

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

      fechaRegreso:
        nota.regresoFecha || nota.fechaRegreso || '',

      horaRegreso:
        nota.regresoHora || nota.horaRegreso || '12:00',

      aerolinea:
        nota.aerolinea || '',

      numVuelo:
        nota.numVuelo || '',

      observaciones:
        nota.observaciones || '',

      distancia: '',
      duracion: '',
    };

    if (!reservaCalendar.fechaIda) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de ida es obligatoria',
      });
    }

    if (
      reservaCalendar.tipoViaje === 'redondo' &&
      !reservaCalendar.fechaRegreso
    ) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de regreso es obligatoria',
      });
    }

    // Crear eventos en Google Calendar
    const resultado = await crearEventoCalendario(
      reservaCalendar
    );

    if (!resultado) {
      return res.status(500).json({
        success: false,
        message:
          'Google Calendar no pudo crear el evento. Revisa las variables OAuth.',
      });
    }

    // Compatibilidad con la versión anterior que devolvía un string
    const eventIdIda =
      typeof resultado === 'string'
        ? resultado
        : resultado.eventIdIda;

    const eventIdRegreso =
      typeof resultado === 'object'
        ? resultado.eventIdRegreso || null
        : null;

    if (!eventIdIda) {
      return res.status(500).json({
        success: false,
        message: 'No se recibió el ID del evento de ida',
      });
    }

    if (
      reservaCalendar.tipoViaje === 'redondo' &&
      !eventIdRegreso
    ) {
      return res.status(500).json({
        success: false,
        message:
          'Se creó la ida, pero no se confirmó el evento de regreso',
        eventIdIda,
      });
    }

    return res.status(200).json({
      success: true,
      eventIdIda,
      eventIdRegreso,
      tipoViaje: reservaCalendar.tipoViaje,
      message:
        reservaCalendar.tipoViaje === 'redondo'
          ? 'Eventos de ida y regreso creados correctamente'
          : 'Evento de ida creado correctamente',
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
        'Error al crear los eventos en Google Calendar',
    });
  }
}
