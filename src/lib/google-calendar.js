/**
 * Integración con Google Calendar para TransportesMX
 * Usa OAuth 2.0 con Refresh Token.
 * Soporta español (es) e inglés (en).
 * Crea eventos para viajes sencillos e ida y vuelta.
 *
 * CONFIGURACIÓN UNIFICADA:
 * - Aplica a Notas de Venta manuales y reservas Stripe.
 * - 1 hora antes (60 minutos).
 * - 4 horas antes (240 minutos).
 * - 930 minutos antes (15 horas y 30 minutos).
 * - Todos mediante notificaciones emergentes (popup).
 * - Sin recordatorios por correo electrónico.
 * - Sin invitaciones automáticas.
 * - La hora REAL del servicio aparece en el título.
 *
 * No modifica pagos, cobros ni confirmaciones de Stripe.
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

/**
 * Formato de fecha para mostrar.
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return 'N/A';

  const parts = dateStr.split('-');

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return dateStr;
}

/**
 * Calcula la hora de término del servicio.
 * Duración predeterminada: 2 horas.
 * Contempla cambio de día.
 */
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

/**
 * RECORDATORIOS UNIFICADOS PARA TODOS LOS SERVICIOS.
 *
 * Se utilizan exclusivamente notificaciones emergentes.
 *
 * 60 minutos  = 1 hora antes.
 * 240 minutos = 4 horas antes.
 * 930 minutos = 15 horas y 30 minutos antes.
 *
 * Sin correo electrónico.
 */
function crearRecordatoriosServicio() {
  return {
    useDefault: false,
    overrides: [
      {
        method: 'popup',
        minutes: 60,
      },
      {
        method: 'popup',
        minutes: 240,
      },
      {
        method: 'popup',
        minutes: 930,
      },
    ],
  };
}

/**
 * Crea eventos de Google Calendar para TransportesMX.
 *
 * Aplica la misma configuración de recordatorios a:
 * - Notas de Venta manuales.
 * - Reservaciones automáticas mediante Stripe.
 *
 * La hora real del servicio se muestra en el título.
 */
export async function crearEventoCalendario(
  reserva,
  lang = 'es',
  opciones = {}
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

    // ==========================================
    // HORA REAL DEL SERVICIO DE IDA
    // ==========================================

    const horaIda =
      reserva.horaIda?.length === 5
        ? reserva.horaIda
        : '12:00';

    const finIda = calcularFin(
      reserva.fechaIda,
      horaIda
    );

    // ==========================================
    // RECORDATORIOS UNIFICADOS
    // PARA NOTAS MANUALES Y STRIPE
    // ==========================================

    const recordatoriosIda =
      crearRecordatoriosServicio();

    // ==========================================
    // INFORMACIÓN DEL VUELO
    // ==========================================

    const flightInfo =
      reserva.aerolinea && reserva.numVuelo
        ? `${reserva.aerolinea} / ${reserva.numVuelo}`
        : reserva.aerolinea ||
          reserva.numVuelo ||
          '';

    // ==========================================
    // TIPO DE VIAJE
    // ==========================================

    const tipoViaje =
      reserva.tipoViaje === 'redondo'
        ? 'redondo'
        : 'sencillo';

    // ==========================================
    // DESCRIPCIÓN DEL EVENTO DE IDA
    // ==========================================

    const descripcionBase = [
      `📍 ${t.pickup}: ${reserva.origen || ''}`,

      `📍 ${t.destination}: ${reserva.destino || ''}`,

      `📅 ${t.dateTime}: ${formatDateDisplay(
        reserva.fechaIda
      )} ${horaIda} HRS`,

      `👤 ${t.clientName}: ${
        reserva.clienteNombre || ''
      }`,

      `🚘 ${t.vehicle}: ${
        reserva.vehiculoNombre || ''
      }`,

      flightInfo
        ? `✈️ ${t.flightAndAirline}: ${flightInfo}`
        : '',

      `👥 ${t.passengers}: ${
        reserva.numPasajeros || ''
      }`,

      `📞 ${t.phone}: ${
        reserva.clienteTelefono || ''
      }`,

      `📧 ${t.email}: ${
        reserva.clienteEmail || ''
      }`,

      `💰 ${t.total}: $${
        reserva.precioTotal || 0
      } MXN`,

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

    // ==========================================
    // EVENTO DE IDA
    // HORA REAL VISIBLE EN EL TÍTULO
    // ==========================================

    const eventoIda = {
      summary: `🚗 ${horaIda} - ${t.transfer}: ${
        reserva.clienteNombre || 'Cliente'
      }`,

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

      reminders: recordatoriosIda,
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

    // ==========================================
    // EVENTO DE REGRESO
    // ==========================================

    let eventIdRegreso = null;

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

      // Mismos recordatorios para el regreso.
      const recordatoriosRegreso =
        crearRecordatoriosServicio();

      // ========================================
      // DESCRIPCIÓN DEL REGRESO
      // ========================================

      const descripcionRegreso = [
        `📍 ${t.pickup}: ${
          reserva.destino || ''
        }`,

        `📍 ${t.destination}: ${
          reserva.origen || ''
        }`,

        `📅 ${t.dateTime}: ${formatDateDisplay(
          reserva.fechaRegreso
        )} ${horaRegreso} HRS`,

        `👤 ${t.clientName}: ${
          reserva.clienteNombre || ''
        }`,

        `🚘 ${t.vehicle}: ${
          reserva.vehiculoNombre || ''
        }`,

        flightInfo
          ? `✈️ ${t.flightAndAirline}: ${flightInfo}`
          : '',

        `👥 ${t.passengers}: ${
          reserva.numPasajeros || ''
        }`,

        `📞 ${t.phone}: ${
          reserva.clienteTelefono || ''
        }`,

        `📧 ${t.email}: ${
          reserva.clienteEmail || ''
        }`,

        `💰 ${t.total}: $${
          reserva.precioTotal || 0
        } MXN`,

        reserva.observaciones
          ? `📝 Observaciones:\n${reserva.observaciones}`
          : '',

        '',

        'TransportesMX - transportesmx.org',
      ]
        .filter(Boolean)
        .join('\n');

      // ========================================
      // EVENTO DE REGRESO
      // HORA REAL VISIBLE EN EL TÍTULO
      // ========================================

      const eventoRegreso = {
        summary: `🔄 ${horaRegreso} - ${
          t.returnTransfer
        }: ${reserva.clienteNombre || 'Cliente'}`,

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

        reminders: recordatoriosRegreso,
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

    // ==========================================
    // RESULTADO
    // ==========================================

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
