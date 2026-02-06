/**
 * Integración con Google Calendar para TransportesMX
 * Usa OAuth 2.0 con Refresh Token para crear eventos automáticamente.
 */

export async function crearEventoCalendario(reserva) {
  // Validar que tengamos las credenciales OAuth configuradas
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

    // Crear cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    // Establecer el refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const fechaInicio = new Date(`${reserva.fechaIda}T${reserva.horaIda}:00`);
    const fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000); // +2 horas

    const evento = {
      summary: `🚗 Traslado: ${reserva.clienteNombre}`,
      description: [
        `📍 Ruta: ${reserva.origen} → ${reserva.destino}`,
        `🚘 Vehículo: ${reserva.vehiculoNombre}`,
        `👥 Pasajeros: ${reserva.numPasajeros}`,
        `📞 Teléfono: ${reserva.clienteTelefono}`,
        `📧 Email: ${reserva.clienteEmail}`,
        `💰 Total: $${reserva.precioTotal} MXN`,
        `📏 Distancia: ${reserva.distancia}`,
        `⏱️ Duración: ${reserva.duracion}`,
        ``,
        `Tipo de viaje: ${reserva.tipoViaje === 'redondo' ? 'Ida y vuelta' : 'Sencillo'}`,
        reserva.tipoViaje === 'redondo' ? `Regreso: ${reserva.fechaRegreso} a las ${reserva.horaRegreso}` : '',
      ].filter(Boolean).join('\n'),
      start: { dateTime: fechaInicio.toISOString(), timeZone: 'America/Mexico_City' },
      end: { dateTime: fechaFin.toISOString(), timeZone: 'America/Mexico_City' },
      colorId: '9', // Azul
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 120 },
        ],
      },
    };

    // Si es viaje redondo, agregar un segundo evento para el regreso
    const result = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      resource: evento,
    });

    console.log('[Calendar] ✅ Evento creado:', result.data.id);

    // Crear evento de regreso si es viaje redondo
    if (reserva.tipoViaje === 'redondo' && reserva.fechaRegreso && reserva.horaRegreso) {
      const fechaRegreso = new Date(`${reserva.fechaRegreso}T${reserva.horaRegreso}:00`);
      const fechaFinRegreso = new Date(fechaRegreso.getTime() + 2 * 60 * 60 * 1000);

      const eventoRegreso = {
        ...evento,
        summary: `🔄 Regreso: ${reserva.clienteNombre}`,
        description: `Viaje de regreso\n${evento.description}`,
        start: { dateTime: fechaRegreso.toISOString(), timeZone: 'America/Mexico_City' },
        end: { dateTime: fechaFinRegreso.toISOString(), timeZone: 'America/Mexico_City' },
        colorId: '6', // Naranja
      };

      const resultRegreso = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: eventoRegreso,
      });
      console.log('[Calendar] ✅ Evento regreso creado:', resultRegreso.data.id);
    }

    return result.data.id;
  } catch (error) {
    console.error('[Calendar] ❌ Error:', error.message);
    return null;
  }
}
