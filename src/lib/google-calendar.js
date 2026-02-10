/**
 * Integración con Google Calendar para TransportesMX
 * Usa OAuth 2.0 con Refresh Token.
 * Invita al cliente como asistente para que reciba el evento en su calendario.
 */

export async function crearEventoCalendario(reserva) {
  if (
    !process.env.GOOGLE_CALENDAR_CLIENT_ID ||
    !process.env.GOOGLE_CALENDAR_CLIENT_SECRET ||
    !process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  ) {
    console.log('[Calendar] OAuth no configurado — omitiendo');
    return null;
  }

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

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const fechaInicio = new Date(`${reserva.fechaIda}T${reserva.horaIda}:00`);
    const fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000);

    // Asistentes: dueño + cliente
    const attendees = [];
    if (reserva.clienteEmail) {
      attendees.push({ email: reserva.clienteEmail, displayName: reserva.clienteNombre });
    }

    const descripcion = [
      `📍 Ruta: ${reserva.origen} → ${reserva.destino}`,
      `🚘 Vehículo: ${reserva.vehiculoNombre}`,
      `👥 Pasajeros: ${reserva.numPasajeros}`,
      `📞 Tel: ${reserva.clienteTelefono}`,
      `📧 Email: ${reserva.clienteEmail}`,
      `💰 Total: $${reserva.precioTotal} MXN`,
      reserva.distancia ? `📏 Distancia: ${reserva.distancia}` : '',
      reserva.duracion ? `⏱️ Duración: ${reserva.duracion}` : '',
      '',
      `Tipo: ${reserva.tipoViaje === 'redondo' ? 'Ida y vuelta' : 'Sencillo'}`,
      reserva.tipoViaje === 'redondo' && reserva.fechaRegreso
        ? `Regreso: ${reserva.fechaRegreso} a las ${reserva.horaRegreso}`
        : '',
    ].filter(Boolean).join('\n');

    const evento = {
      summary: `🚗 Traslado: ${reserva.clienteNombre}`,
      description: descripcion,
      start: { dateTime: fechaInicio.toISOString(), timeZone: 'America/Mexico_City' },
      end: { dateTime: fechaFin.toISOString(), timeZone: 'America/Mexico_City' },
      colorId: '9',
      attendees,
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
      sendUpdates: 'all', // Envía invitación por email al cliente
    });

    console.log('[Calendar] ✅ Evento creado:', result.data.id);

    // Evento de regreso si es viaje redondo
    if (reserva.tipoViaje === 'redondo' && reserva.fechaRegreso && reserva.horaRegreso) {
      const fechaRegreso = new Date(`${reserva.fechaRegreso}T${reserva.horaRegreso}:00`);
      const fechaFinRegreso = new Date(fechaRegreso.getTime() + 2 * 60 * 60 * 1000);

      const eventoRegreso = {
        ...evento,
        summary: `🔄 Regreso: ${reserva.clienteNombre}`,
        description: `Viaje de regreso\n${descripcion}`,
        start: { dateTime: fechaRegreso.toISOString(), timeZone: 'America/Mexico_City' },
        end: { dateTime: fechaFinRegreso.toISOString(), timeZone: 'America/Mexico_City' },
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
