/**
 * Integración con Google Calendar para TransportesMX
 * Usa OAuth 2.0 con Refresh Token.
 * Soporta español (es) e inglés (en).
 * Crea eventos para viajes sencillos e ida y vuelta.
 *
 * Para notas de venta manuales, Calendar se mantiene como agenda interna.
 * Las confirmaciones al cliente se envían por Brevo con el PDF adjunto.
 * No se agregan asistentes ni se envían invitaciones por correo desde Google.
 */

const calLabels = {
  es: {
    transfer: 'Traslado',
    returnTransfer: 'Regreso',
    pickup: 'Recoger en',
    destination: 'Destino',
    vehicle: 'Vehículo',
    clientName: 'Nombre Cliente',
    flightAndAirline: 'Número de Vuelo y Aerolínea',
    passengers: 'Pasajeros',
    phone: 'Tel',
    email: 'Email',
    total: 'Total',
    distance: 'Distancia',
    duration: 'Duración',
    type: 'Tipo',
    roundTrip: 'Ida y vuelta',
    oneWay: 'Sencillo',
    dateTime: 'Fecha y hora',
  },
  en: {
    transfer: 'Transfer',
    returnTransfer: 'Return',
    pickup: 'Pickup at',
    destination: 'Destination',
    vehicle: 'Vehicle',
    clientName: 'Client Name',
    flightAndAirline: 'Flight Number and Airline',
    passengers: 'Passengers',
    phone: 'Phone',
    email: 'Email',
    total: 'Total',
    distance: 'Distance',
    duration: 'Duration',
    type: 'Type',
    roundTrip: 'Round trip',
    oneWay: 'One way',
    dateTime: 'Date and time',
  },
};

function formatDateDisplay(dateStr) {
  if (!dateStr) return 'N/A';

  const parts = dateStr.split('-');

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return dateStr;
}

// Calcula la hora de término, contemplando cambio de día
function calcularFin(fecha, hora, duracionHoras = 2) {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);

  const fechaUTC = new Date(
    Date.UTC(year, month - 1, day, hours, minutes)
  );

  fechaUTC.setUTCHours(
    fechaUTC.getUTCHours() + duracionHoras
  );

  const nuevaFecha = [
    fechaUTC.getUTCFullYear(),
    String(fechaUTC.getUTCMonth() + 1).padStart(2, '0'),
    String(fechaUTC.getUTCDate()).padStart(2, '0'),
  ].join('-');

  const nuevaHora = [
    String(fechaUTC.getUTCHours()).padStart(2, '0'),
    String(fechaUTC.getUTCMinutes()).padStart(2, '0'),
  ].join(':');

  return {
    fecha: nuevaFecha,
    hora: nuevaHora,
  };
}

export async function crearEventoCalendario(
  reserva,
  lang = 'es'
) {
  if (
    !process.env.GOOGLE_CALENDAR_CLIENT_ID ||
    !process.env.GOOGLE_CALENDAR_CLIENT_SECRET ||
    !process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  ) {
    console.error(
      '[Calendar] OAuth no está configurado'
    );

    return null;
  }

  const t = calLabels[lang] || calLabels.es;

  try {
    const { google } = await import('googleapis');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token:
        process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });

    const { credentials } =
      await oauth2Client.refreshAccessToken();

    oauth2Client.setCredentials(credentials);

    console.log(
      '[Calendar] Access token renovado correctamente'
    );

    const calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });

    const calendarId =
      process.env.GOOGLE_CALENDAR_ID || 'primary';

    const horaIda =
      reserva.horaIda?.length === 5
        ? reserva.horaIda
        : '12:00';

    const finIda = calcularFin(
      reserva.fechaIda,
      horaIda
    );

    // No se agregan asistentes del cliente: evita invitaciones automáticas.
    const flightInfo =
      reserva.aerolinea && reserva.numVuelo
        ? `${reserva.aerolinea} / ${reserva.numVuelo}`
        : reserva.aerolinea ||
          reserva.numVuelo ||
          '';

    const tipoViaje =
      reserva.tipoViaje === 'redondo'
        ? 'redondo'
        : 'sencillo';

    const descripcionBase = [
      `📍 ${t.pickup}: ${reserva.origen || ''}`,
      `📍 ${t.destination}: ${reserva.destino || ''}`,
      `📅 ${t.dateTime}: ${formatDateDisplay(reserva.fechaIda)} ${horaIda} HRS`,
      `👤 ${t.clientName}: ${reserva.clienteNombre || ''}`,
      `🚘 ${t.vehicle}: ${reserva.vehiculoNombre || ''}`,
      flightInfo
        ? `✈️ ${t.flightAndAirline}: ${flightInfo}`
        : '',
      `👥 ${t.passengers}: ${reserva.numPasajeros || ''}`,
      `📞 ${t.phone}: ${reserva.clienteTelefono || ''}`,
      `📧 ${t.email}: ${reserva.clienteEmail || ''}`,
      `💰 ${t.total}: $${reserva.precioTotal || 0} MXN`,
      reserva.distancia
        ? `📏 ${t.distance}: ${reserva.distancia}`
        : '',
      reserva.duracion
        ? `⏱️ ${t.duration}: ${reserva.duracion}`
        : '',
      `${t.type}: ${
        tipoViaje === 'redondo'
          ? t.roundTrip
          : t.oneWay
      }`,
      reserva.observaciones
        ? `📝 Observaciones:\n${reserva.observaciones}`
        : '',
      '',
      'TransportesMX - transportesmx.org',
    ]
      .filter(Boolean)
      .join('\n');

    // EVENTO DE IDA: evento interno, sin correo de invitación a cliente.
    const eventoIda = {
      summary: `🚗 ${t.transfer}: ${reserva.clienteNombre || 'Cliente'}`,
      description: descripcionBase,
      location: reserva.origen || '',
      start: {
        dateTime: `${reserva.fechaIda}T${horaIda}:00`,
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: `${finIda.fecha}T${finIda.hora}:00`,
        timeZone: 'America/Mexico_City',
      },
      colorId: '9',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 120 },
        ],
      },
    };

    const resultIda = await calendar.events.insert({
      calendarId,
      resource: eventoIda,
      sendUpdates: 'none',
    });

    const eventIdIda = resultIda.data.id;

    if (!eventIdIda) {
      throw new Error(
        'Google Calendar no devolvió el ID del evento de ida'
      );
    }

    console.log(
      '[Calendar] Evento de ida creado:',
      eventIdIda
    );

    let eventIdRegreso = null;

    // EVENTO DE REGRESO
    if (
      tipoViaje === 'redondo' &&
      reserva.fechaRegreso
    ) {
      const horaRegreso =
        reserva.horaRegreso?.length === 5
          ? reserva.horaRegreso
          : '12:00';

      const finRegreso = calcularFin(
        reserva.fechaRegreso,
        horaRegreso
      );

      const descripcionRegreso = [
        `📍 ${t.pickup}: ${reserva.destino || ''}`,
        `📍 ${t.destination}: ${reserva.origen || ''}`,
        `📅 ${t.dateTime}: ${formatDateDisplay(reserva.fechaRegreso)} ${horaRegreso} HRS`,
        `👤 ${t.clientName}: ${reserva.clienteNombre || ''}`,
        `🚘 ${t.vehicle}: ${reserva.vehiculoNombre || ''}`,
        flightInfo
          ? `✈️ ${t.flightAndAirline}: ${flightInfo}`
          : '',
        `👥 ${t.passengers}: ${reserva.numPasajeros || ''}`,
        `📞 ${t.phone}: ${reserva.clienteTelefono || ''}`,
        `📧 ${t.email}: ${reserva.clienteEmail || ''}`,
        `💰 ${t.total}: $${reserva.precioTotal || 0} MXN`,
        reserva.observaciones
          ? `📝 Observaciones:\n${reserva.observaciones}`
          : '',
        '',
        'TransportesMX - transportesmx.org',
      ]
        .filter(Boolean)
        .join('\n');

      const eventoRegreso = {
        summary: `🔄 ${t.returnTransfer}: ${reserva.clienteNombre || 'Cliente'}`,
        description: descripcionRegreso,
        location: reserva.destino || '',
        start: {
          dateTime: `${reserva.fechaRegreso}T${horaRegreso}:00`,
          timeZone: 'America/Mexico_City',
        },
        end: {
          dateTime: `${finRegreso.fecha}T${finRegreso.hora}:00`,
          timeZone: 'America/Mexico_City',
        },
        colorId: '6',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'email', minutes: 120 },
          ],
        },
      };

      const resultRegreso =
        await calendar.events.insert({
          calendarId,
          resource: eventoRegreso,
          sendUpdates: 'none',
        });

      eventIdRegreso = resultRegreso.data.id;

      if (!eventIdRegreso) {
        throw new Error(
          'Google Calendar no devolvió el ID del evento de regreso'
        );
      }

      console.log(
        '[Calendar] Evento de regreso creado:',
        eventIdRegreso
      );
    }

    // Devuelve los IDs de ambos eventos
    return {
      eventIdIda,
      eventIdRegreso,
      tipoViaje,
      success: true,
    };
  } catch (error) {
    console.error(
      '[Calendar] Error creando evento:',
      error.message
    );

    throw error;
  }
}
