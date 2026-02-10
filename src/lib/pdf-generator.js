import jsPDF from 'jspdf';

const COLORS = {
  primary: [0, 50, 100],       // Azul oscuro
  accent: [30, 100, 200],      // Azul medio
  dark: [20, 20, 25],          // Negro suave
  text: [40, 40, 50],          // Texto principal
  textLight: [100, 110, 120],  // Texto secundario
  value: [30, 80, 180],        // Valores resaltados (azul)
  line: [180, 190, 200],       // Líneas separadoras
  white: [255, 255, 255],
  greenBg: [230, 245, 230],
  greenText: [30, 130, 50],
};

const labels = {
  es: {
    serviceSheet: 'HOJA DE SERVICIO',
    company: 'Grupo Turístico MX',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    folio: 'Folio',
    date: 'Fecha',
    paid: 'Pagado',
    pending: 'Pendiente',
    client: 'Cliente',
    clientPhone: 'Teléfono',
    clientEmail: 'Correo',
    transferDesc: 'Descripción del traslado:',
    vehicle: 'Vehículo',
    clientName: 'Nombre de cliente',
    dateTime: 'Fecha y hora',
    pickupAt: 'Recoger en',
    numPassengers: 'Número de Pasajeros',
    numBags: 'Equipaje',
    destination: 'Destino',
    distance: 'Distancia',
    estTime: 'Tiempo estimado',
    roundTrip: 'Ida y vuelta',
    yes: 'Sí',
    no: 'No',
    returnSection: 'Regreso:',
    returnPickup: 'Recoger en',
    returnDateTime: 'Fecha y hora',
    total: 'Total',
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Documento generado el',
  },
  en: {
    serviceSheet: 'SERVICE SHEET',
    company: 'Grupo Turístico MX',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    folio: 'Folio',
    date: 'Date',
    paid: 'Paid',
    pending: 'Pending',
    client: 'Client',
    clientPhone: 'Phone',
    clientEmail: 'Email',
    transferDesc: 'Transfer description:',
    vehicle: 'Vehicle',
    clientName: 'Client name',
    dateTime: 'Date and time',
    pickupAt: 'Pickup at',
    numPassengers: 'Number of Passengers',
    numBags: 'Luggage',
    destination: 'Destination',
    distance: 'Distance',
    estTime: 'Estimated time',
    roundTrip: 'Round trip',
    yes: 'Yes',
    no: 'No',
    returnSection: 'Return:',
    returnPickup: 'Pickup at',
    returnDateTime: 'Date and time',
    total: 'Total',
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Document generated on',
  },
};

/**
 * Genera una hoja de servicio PDF profesional similar al ejemplo de TransportesMX
 * @param {Object} reserva - datos de la reserva
 * @param {string} lang - 'es' o 'en'
 */
export function generarHojaServicio(reserva, lang = 'es') {
  const t = labels[lang] || labels.es;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pw - margin * 2;

  let y = margin;

  // ──────────────────────────────────────────────────
  // HEADER: Logo/marca + Info empresa (izq) | Folio + Fecha (der)
  // ──────────────────────────────────────────────────

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.primary);
  doc.text('TMX', margin, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(t.company, margin, y + 18);
  doc.text(t.address, margin, y + 23);
  doc.text(t.phone, margin, y + 28);
  doc.text(t.email, margin, y + 33);
  doc.setTextColor(...COLORS.accent);
  doc.text(t.website, margin, y + 38);

  // Folio y fecha (derecha)
  const rightX = pw - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  const folioNum = reserva.id ? String(reserva.id).slice(0, 8).toUpperCase() : 'N/A';
  doc.text(`${t.folio}: ${folioNum}`, rightX, y + 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const fechaDoc = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  doc.text(`${t.date}: ${fechaDoc}`, rightX, y + 17, { align: 'right' });

  // Status badge
  const isPaid = reserva.estadoPago === 'pagado';
  const statusText = isPaid ? t.paid : t.pending;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  if (isPaid) {
    doc.setTextColor(...COLORS.greenText);
  } else {
    doc.setTextColor(200, 100, 0);
  }
  doc.text(statusText, rightX, y + 24, { align: 'right' });

  y += 44;

  // Línea separadora azul
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pw - margin, y);
  y += 10;

  // ──────────────────────────────────────────────────
  // DATOS DEL CLIENTE
  // ──────────────────────────────────────────────────

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text(`${t.client}: `, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text(reserva.clienteNombre || 'N/A', margin + doc.getStringUnitWidth(`${t.client}: `) * 11 / doc.internal.scaleFactor, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(`${t.clientPhone}: ${reserva.clienteTelefono || 'N/A'}`, margin, y);
  y += 6;

  doc.text(`${t.clientEmail}: ${reserva.clienteEmail || 'N/A'}`, margin, y);
  y += 12;

  // ──────────────────────────────────────────────────
  // DESCRIPCIÓN DEL TRASLADO (barra negra)
  // ──────────────────────────────────────────────────

  doc.setFillColor(...COLORS.dark);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text(t.transferDesc, margin + 4, y + 6.5);
  y += 15;

  // Bullet points
  const bulletItems = [
    { label: t.vehicle, value: reserva.vehiculoNombre || 'N/A' },
    { label: t.clientName, value: reserva.clienteNombre || 'N/A' },
    { label: t.dateTime, value: `${reserva.fechaIda || 'N/A'} / ${reserva.horaIda || 'N/A'} hrs` },
    { label: t.pickupAt, value: reserva.origen || 'N/A' },
    { label: t.numPassengers, value: `${reserva.numPasajeros || 'N/A'} PAX` },
    { label: t.clientPhone, value: reserva.clienteTelefono || 'N/A' },
    { label: t.destination, value: reserva.destino || 'N/A' },
  ];

  if (reserva.distancia) {
    bulletItems.push({ label: t.distance, value: reserva.distancia });
  }
  if (reserva.duracion) {
    bulletItems.push({ label: t.estTime, value: reserva.duracion });
  }

  bulletItems.push({
    label: t.roundTrip,
    value: reserva.tipoViaje === 'redondo' ? t.yes : t.no,
  });

  doc.setFontSize(10);
  bulletItems.forEach((item) => {
    // Bullet
    doc.setFillColor(...COLORS.text);
    doc.circle(margin + 4, y - 1.2, 1.2, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(`${item.label}: `, margin + 8, y);

    // Value
    const labelWidth = doc.getStringUnitWidth(`${item.label}: `) * 10 / doc.internal.scaleFactor;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.value);

    // Handle long values by splitting
    const maxValueWidth = contentWidth - 8 - labelWidth - 5;
    const valueLines = doc.splitTextToSize(String(item.value), maxValueWidth);
    doc.text(valueLines, margin + 8 + labelWidth, y);

    y += 7 * valueLines.length;
  });

  y += 5;

  // ──────────────────────────────────────────────────
  // TOTAL
  // ──────────────────────────────────────────────────

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pw - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.text);
  doc.text(`${t.total}: `, margin, y);

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(16);
  const totalFormatted = `$${Number(reserva.precioTotal || 0).toLocaleString('es-MX')} MXN`;
  const totalLabelWidth = doc.getStringUnitWidth(`${t.total}: `) * 13 / doc.internal.scaleFactor;
  doc.text(totalFormatted, margin + totalLabelWidth, y);
  y += 12;

  // ──────────────────────────────────────────────────
  // REGRESO (si aplica)
  // ──────────────────────────────────────────────────

  if (reserva.tipoViaje === 'redondo' && reserva.fechaRegreso) {
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pw - margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.primary);
    doc.text(t.returnSection, margin, y);
    y += 8;

    const returnItems = [
      { label: t.returnPickup, value: reserva.destino || 'N/A' },
      { label: t.returnDateTime, value: `${reserva.fechaRegreso} / ${reserva.horaRegreso || 'N/A'} hrs` },
    ];

    doc.setFontSize(10);
    returnItems.forEach((item) => {
      doc.setFillColor(...COLORS.text);
      doc.circle(margin + 4, y - 1.2, 1.2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text(`${item.label}: `, margin + 8, y);

      const lw = doc.getStringUnitWidth(`${item.label}: `) * 10 / doc.internal.scaleFactor;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.value);
      doc.text(String(item.value), margin + 8 + lw, y);

      y += 7;
    });
  }

  // ──────────────────────────────────────────────────
  // FOOTER
  // ──────────────────────────────────────────────────

  const footerY = 275;
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pw - margin, footerY);

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');

  const footerW = doc.getStringUnitWidth(t.footer) * 8 / doc.internal.scaleFactor;
  doc.text(t.footer, (pw - footerW) / 2, footerY + 6);

  const genText = `${t.generated} ${new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}`;
  const genW = doc.getStringUnitWidth(genText) * 7 / doc.internal.scaleFactor;
  doc.setFontSize(7);
  doc.text(genText, (pw - genW) / 2, footerY + 11);

  return doc;
}
