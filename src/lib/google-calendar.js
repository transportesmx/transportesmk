/**
 * Integración con Google Calendar para TransportesMX
 * Usa OAuth 2.0 con Refresh Token.
 * Soporta español (es) e inglés (en).
 */

const calLabels = {
  es: {
    transfer: 'Traslado',
    returnTransfer: 'Regreso',
    pickup: 'Recoger en',
    destination: 'Destino',
    vehicle: 'Vehículo',
    clientName: 'Nombre Cliente',
    flightAndAirline: 'Numero de Vuelo y Aerolínea',
    passengers: 'Pasajeros',
    phone: 'Tel',
    email: 'Email',
    total: 'Total',
    distance: 'Distancia',
    duration: 'Duración',
    type: 'Tipo',
    roundTrip: 'Ida y vuelta',
    oneWay: 'Sencillo',
    returnTrip: 'Viaje de regreso',
    dateTime: 'Fecha y hora',
    returnDateTime: 'Regreso',
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
    returnTrip: 'Return trip',
    dateTime: 'Date and time',
    returnDateTime: 'Return',
  },
};

function formatDateDisplay(dateStr) {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

/**
 * @param {Object} reserva - datos de la reserva
 * @param {string} lang - 'es' o 'en'
 */
export async function crearEventoCalendario(reserva, lang = 'es') {
  if (
    !process.env.GOOGLE_CALENDAR_CLIENT_ID ||
    !process.env.GOOGLE_CALENDAR_CLIENT_SECRET ||
    !process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  ) {
    console.log('[Calendar] OAuth no configurado — omitiendo');
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
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });

    // Forzar refresh del access token antes de hacer la llamada
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      console.log('[Calendar] ✅ Access token renovado correctamente');
    } catch (refreshError) {
      console.error('[Calendar] ❌ Error renovando token:', refreshError.message);
      console.error('[Calendar] ⚠️ Es necesario generar un nuevo Refresh Token en https://developers.google.com/oauthplayground');
      console.error('[Calendar] Asegúrate de: 1) Usar tu Client ID/Secret en el engrane (⚙️), 2) Autorizar el scope https://www.googleapis.com/auth/calendar, 3) Copiar el nuevo refresh_token a GOOGLE_CALENDAR_REFRESH_TOKEN en .env.local');
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const horaIda = reserva.horaIda?.length === 5 ? reserva.horaIda : '12:00';
    const fechaInicioStr = `${reserva.fechaIda}T${horaIda}:00`;
    const [hh, mm] = horaIda.split(':').map(Number);
    const finHH = String((hh + 2) % 24).padStart(2, '0');
    const fechaFinStr = `${reserva.fechaIda}T${finHH}:${String(mm).padStart(2, '0')}:00`;

    // Asistentes: cliente
    const attendees = [];
    if (reserva.clienteEmail) {
      attendees.push({ email: reserva.clienteEmail, displayName: reserva.clienteNombre });
    }

    const flightInfo = (reserva.aerolinea && reserva.numVuelo)
      ? `${reserva.aerolinea}/ ${reserva.numVuelo}`
      : (reserva.aerolinea || reserva.numVuelo || '');

    const descripcion = [
      `📍 ${t.pickup}: ${reserva.origen}`,
      `📍 ${t.destination}: ${reserva.destino}`,
      `📅 ${t.dateTime}: ${formatDateDisplay(reserva.fechaIda)}  ${reserva.horaIda || ''} HRS`,
      `👤 ${t.clientName}: ${reserva.clienteNombre}`,
      `🚘 ${t.vehicle}: ${reserva.vehiculoNombre}`,
      flightInfo ? `✈️ ${t.flightAndAirline}: ${flightInfo}` : '',
      `👥 ${t.passengers}: ${reserva.numPasajeros}`,
      `📞 ${t.phone}: ${reserva.clienteTelefono}`,
      `📧 ${t.email}: ${reserva.clienteEmail}`,
      `💰 ${t.total}: $${reserva.precioTotal} MXN`,
      reserva.distancia ? `📏 ${t.distance}: ${reserva.distancia}` : '',
      reserva.duracion ? `⏱️ ${t.duration}: ${reserva.duracion}` : '',
      `${t.type}: ${reserva.tipoViaje === 'redondo' ? t.roundTrip : t.oneWay}`,
      reserva.tipoViaje === 'redondo' && reserva.fechaRegreso
        ? `${t.returnDateTime}: ${formatDateDisplay(reserva.fechaRegreso)} ${reserva.horaRegreso || ''} HRS`
        : '',
      '',
      'TransportesMX - transportesmx.org',
    ].filter(Boolean).join('\n');

    const evento = {
      summary: `🚗 ${t.transfer}: ${reserva.clienteNombre}`,
      description: descripcion,
      location: reserva.origen || '',
      start: { dateTime: fechaInicioStr, timeZone: 'America/Mexico_City' },
      end: { dateTime: fechaFinStr, timeZone: 'America/Mexico_City' },
      colorId: '9',
      attendees,
      organizer: {
        displayName: 'TransportesMX',
        self: true,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 120 },
        ],
      },
    };

    const result = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      resource: evento,
      sendUpdates: 'all',
    });

    console.log('[Calendar] ✅ Evento creado:', result.data.id);

    // Evento de regreso si es viaje redondo
    if (reserva.tipoViaje === 'redondo' && reserva.fechaRegreso && reserva.horaRegreso) {
      const horaRegreso = reserva.horaRegreso?.length === 5 ? reserva.horaRegreso : '12:00';
      const fechaRegresoStr = `${reserva.fechaRegreso}T${horaRegreso}:00`;
      const [hhR, mmR] = horaRegreso.split(':').map(Number);
      const finHHR = String((hhR + 2) % 24).padStart(2, '0');
      const fechaFinRegresoStr = `${reserva.fechaRegreso}T${finHHR}:${String(mmR).padStart(2, '0')}:00`;

      const descripcionRegreso = [
        `📍 ${t.pickup}: ${reserva.destino}`,
        `📍 ${t.destination}: ${reserva.origen}`,
        `📅 ${t.dateTime}: ${formatDateDisplay(reserva.fechaRegreso)}  ${reserva.horaRegreso || ''} HRS`,
        `👤 ${t.clientName}: ${reserva.clienteNombre}`,
        `🚘 ${t.vehicle}: ${reserva.vehiculoNombre}`,
        flightInfo ? `✈️ ${t.flightAndAirline}: ${flightInfo}` : '',
        `👥 ${t.passengers}: ${reserva.numPasajeros}`,
        `📞 ${t.phone}: ${reserva.clienteTelefono}`,
        `📧 ${t.email}: ${reserva.clienteEmail}`,
        `💰 ${t.total}: $${reserva.precioTotal} MXN`,
        reserva.distancia ? `📏 ${t.distance}: ${reserva.distancia}` : '',
        reserva.duracion ? `⏱️ ${t.duration}: ${reserva.duracion}` : '',
        '',
        'TransportesMX - transportesmx.org',
      ].filter(Boolean).join('\n');

      const eventoRegreso = {
        ...evento,
        summary: `🔄 ${t.returnTransfer}: ${reserva.clienteNombre}`,
        description: descripcionRegreso,
        location: reserva.destino || '',
        start: { dateTime: fechaRegresoStr, timeZone: 'America/Mexico_City' },
        end: { dateTime: fechaFinRegresoStr, timeZone: 'America/Mexico_City' },
        colorId: '6',
      };

      const resultRegreso = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: eventoRegreso,
        sendUpdates: 'all',
      });
      console.log('[Calendar] ✅ Evento regreso creado:', resultRegreso.data.id);
    }

    return result.data.id;
  } catch (error) {
    console.error('[Calendar] ❌ Error:', error.message);
    return null;
  }
}
