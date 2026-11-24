import jsPDF from 'jspdf';
import { LOGOPDF_BASE64 } from './logopdf-base64';
import { QRPDF_BASE64 } from './qrpdf-base64';
import { VEHICLE_IMAGES } from './vehicle-images-base64';
import { EMOJI_ICONS } from './emoji-icons-base64';

const COLORS = {
  black: [0, 0, 0],
  dark: [20, 20, 20],
  blue: [0, 51, 153],
  line: [200, 200, 200],
  white: [255, 255, 255],
  red: [200, 30, 30],
  footerGray: [120, 120, 120],
};

function generarFolio(reservaId) {
  if (reservaId) {
    const clean = String(reservaId).replace(/\D/g, '');
    if (clean.length >= 4) return `MX${clean.slice(-6).padStart(6, '0')}`;
  }
  const n = Math.floor(100000 + Math.random() * 900000);
  return `MX${n}`;
}

function formatearTelefono(tel) {
  if (!tel) return 'N/A';
  const limpio = tel.replace(/\D/g, '');
  if (limpio.length === 12 && limpio.startsWith('52')) {
    return `+${limpio.slice(0, 2)} ${limpio.slice(2, 5)} ${limpio.slice(5, 8)} ${limpio.slice(8)}`;
  }
  if (limpio.length === 13 && limpio.startsWith('521')) {
    return `+${limpio.slice(0, 2)} ${limpio.slice(3, 6)} ${limpio.slice(6, 9)} ${limpio.slice(9)}`;
  }
  if (limpio.length === 10) {
    return `+52 ${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
  }
  if (limpio.length === 11 && limpio.startsWith('1')) {
    return `+1 ${limpio.slice(1, 4)} ${limpio.slice(4, 7)} ${limpio.slice(7)}`;
  }
  if (limpio.length > 10) {
    const countryLen = limpio.length <= 12 ? 2 : 3;
    const country = limpio.slice(0, countryLen);
    const rest = limpio.slice(countryLen);
    const parts = rest.match(/.{1,3}/g) || [];
    return `+${country} ${parts.join(' ')}`;
  }
  return tel;
}

function formatearFechaRegreso(fecha) {
  if (!fecha) return '';
  const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(fecha);
}

function formatearHoraRegreso(hora) {
  if (!hora) return '';
  const match = String(hora).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(hora);
  const hour = Number(match[1]);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${match[2]} ${suffix}`;
}

function getVehicleImage(vehiculoId, vehiculoNombre) {
  if (vehiculoId && VEHICLE_IMAGES[vehiculoId]) return VEHICLE_IMAGES[vehiculoId];
  const nombre = (vehiculoNombre || '').toLowerCase();
  if (nombre.includes('sedan')) return VEHICLE_IMAGES.sedan;
  if (nombre.includes('suburban')) return VEHICLE_IMAGES.suburban;
  if (nombre.includes('minivan') || nombre.includes('van') || nombre.includes('odyssey')) return VEHICLE_IMAGES.minivan;
  if (nombre.includes('hiace')) return VEHICLE_IMAGES.hiace;
  if (nombre.includes('sprinter')) return VEHICLE_IMAGES.sprinter;
  return null;
}

const labels = {
  es: {
    company: 'Grupo Turístico MX S. de R.L. de C.V.',
    rfc: 'RATG900822G16',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    folio: 'Folio',
    date: 'Fecha',
    status: 'Pagado',
    client: 'Cliente',
    clientPhone: 'Telefono',
    clientEmail: 'Correo',
    transferDesc: 'Descripcion del traslado:',
    vehicle: 'Vehiculo',
    clientName: 'Nombre de cliente',
    dateTime: 'Fecha y hora',
    pickupAt: 'Recoger en',
    flightAndAirline: 'Numero de vuelo y aerolinea',
    airline: 'Aerolinea',
    flightNumber: 'No. Vuelo',
    numPassengers: 'Numero de Pasajeros',
    numBags: 'Numero de maletas',
    destination: 'Destino',
    roundTrip: 'Ida y vuelta',
    distance: 'Distancia',
    estTime: 'Tiempo estimado',
    yes: 'Si',
    no: 'No',
    observations: 'Observaciones',
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Documento generado el',
  },
  en: {
    company: 'Grupo Turístico MX S. de R.L. de C.V.',
    rfc: 'RATG900822G16',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    folio: 'Folio',
    date: 'Date',
    status: 'Paid',
    client: 'Client',
    clientPhone: 'Phone',
    clientEmail: 'Email',
    transferDesc: 'Transfer description:',
    vehicle: 'Vehicle',
    clientName: 'Client name',
    dateTime: 'Date and time',
    pickupAt: 'Pickup at',
    flightAndAirline: 'Flight number and airline',
    airline: 'Airline',
    flightNumber: 'Flight No.',
    numPassengers: 'Number of Passengers',
    numBags: 'Number of bags',
    destination: 'Destination',
    roundTrip: 'Round trip',
    distance: 'Distance',
    estTime: 'Estimated time',
    yes: 'Yes',
    no: 'No',
    observations: 'Notes',
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Document generated on',
  },
};

const EMOJI_SIZE = 4.5;

function drawEmoji(doc, emojiKey, x, y) {
  const icon = EMOJI_ICONS[emojiKey];
  if (icon) {
    try {
      doc.addImage(icon, 'PNG', x, y - EMOJI_SIZE + 0.5, EMOJI_SIZE, EMOJI_SIZE);
      return;
    } catch { /* fallback below */ }
  }
  doc.setFillColor(...COLORS.black);
  doc.circle(x + EMOJI_SIZE / 2, y - EMOJI_SIZE / 2 + 0.5, 1.3, 'F');
}

function drawWrappedValue(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  doc.text(lines, x, y);
  return y + lineHeight * (lines.length - 1);
}

// Dibuja cualquier imagen dentro de un recuadro conservando su proporcion original.
function addImageContain(doc, imageData, x, y, maxW, maxH, format = 'PNG') {
  if (!imageData) return null;
  const props = doc.getImageProperties(imageData);
  const ratio = props.width / props.height;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  const drawX = x + (maxW - w) / 2;
  const drawY = y + (maxH - h) / 2;
  doc.addImage(imageData, format, drawX, drawY, w, h);
  return { x: drawX, y: drawY, w, h };
}

export function generarHojaServicio(reserva, lang = 'es') {
  const t = labels[lang] || labels.es;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pw - margin * 2;
  const rightX = pw - margin;

  let y = margin;

  // Logo incrustado: ajustar al espacio disponible sin alterar su proporcion.
  const companyFontSize = 10;
  const logoMaxW = 64;
  const logoMaxH = 23;
  let logoW = logoMaxW;
  let logoH = logoMaxH;

  // ── LOGO ──
  try {
    const logoProps = doc.getImageProperties(LOGOPDF_BASE64);
    const logoRatio = logoProps.width / logoProps.height;
    logoH = Math.min(logoMaxH, logoMaxW / logoRatio);
    logoW = logoH * logoRatio;
    doc.addImage(LOGOPDF_BASE64, 'JPEG', margin, y, logoW, logoH);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.black);
    doc.text('TRANSPORTES MX', margin, y + 12);
  }

  // ── QR CODE (centered between logo and folio) ──
  const qrSize = 36;
  const qrLeftEdge = margin + logoW + 6;
  const qrRightEdge = rightX - 50;
  const qrX = qrLeftEdge + (qrRightEdge - qrLeftEdge - qrSize) / 2;
  try {
    addImageContain(doc, QRPDF_BASE64, qrX, y - 3, qrSize, qrSize, 'PNG');
  } catch { /* QR not available */ }

  // ── FOLIO box (top right, RED) ──
  const folio = generarFolio(reserva.id);
  const folioText = `${t.folio}: ${folio}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const folioTextW = doc.getStringUnitWidth(folioText) * 11 / doc.internal.scaleFactor + 12;
  const folioH = 9;
  const folioBoxX = rightX - folioTextW;

  doc.setFillColor(...COLORS.red);
  doc.roundedRect(folioBoxX, y, folioTextW, folioH, 1.5, 1.5, 'F');
  doc.setTextColor(...COLORS.white);
  doc.text(folioText, folioBoxX + 6, y + 6.5);

  // Date and Status (left-aligned to folio box)
  const fechaDoc = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.black);
  doc.text(`${t.date}: ${fechaDoc}`, folioBoxX, y + folioH + 6);
  // Debajo del folio se deja espacio en blanco, como en el diseño solicitado.

  // ── Company info ──
  y += logoH + 8;
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(companyFontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text(t.company, margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(t.address, margin, y);
  y += 4.5;
  doc.text(t.phone, margin, y);
  y += 4.5;
  doc.setTextColor(...COLORS.blue);
  doc.textWithLink(t.email, margin, y, { url: `mailto:${t.email}` });
  y += 4.5;
  doc.setTextColor(...COLORS.blue);
  doc.textWithLink(t.website, margin, y, { url: t.website });

  y += 8;

  // ── Separator line ──
  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(1.2);
  doc.line(margin, y, rightX, y);
  y += 10;

  // ── CLIENT SECTION ──
  const clientStartY = y;
  const clientFontSize = 13;
  doc.setFontSize(clientFontSize);

  // Cliente: etiqueta negra en negrita y valor azul en negrita.
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  const clLabel = `${t.client}: `;
  doc.text(clLabel, margin, y);
  const clLabelW = doc.getStringUnitWidth(clLabel) * clientFontSize / doc.internal.scaleFactor;
  doc.setTextColor(...COLORS.blue);
  doc.text(reserva.clienteNombre || 'N/A', margin + clLabelW, y);
  y += 7;

  // Teléfono: etiqueta negra en negrita y valor azul en negrita.
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  const telLabel = `${t.clientPhone}: `;
  doc.text(telLabel, margin, y);
  const telLabelW = doc.getStringUnitWidth(telLabel) * clientFontSize / doc.internal.scaleFactor;
  doc.setTextColor(...COLORS.blue);
  doc.text(formatearTelefono(reserva.clienteTelefono), margin + telLabelW, y);
  y += 7;

  // Correo: etiqueta negra en negrita y valor azul en negrita.
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  const emLabel = `${t.clientEmail}: `;
  doc.text(emLabel, margin, y);
  const emLabelW = doc.getStringUnitWidth(emLabel) * clientFontSize / doc.internal.scaleFactor;
  doc.setTextColor(...COLORS.blue);
  doc.text(reserva.clienteEmail || 'N/A', margin + emLabelW, y);

  // Sello de pago debajo del correo del cliente.
  const paidText = lang === 'en' ? 'PAID' : 'PAGADO';
  const paidBoxW = lang === 'en' ? 25 : 31;
  const paidBoxH = 8;
  const paidBoxY = y + 4;
  doc.setFillColor(0, 166, 81);
  doc.roundedRect(margin, paidBoxY, paidBoxW, paidBoxH, 1.2, 1.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text(paidText, margin + paidBoxW / 2, paidBoxY + 5.4, { align: 'center' });

  // ── Vehicle image (right column) ──
  const vehicleImg = getVehicleImage(reserva.vehiculoId, reserva.vehiculoNombre);
  if (vehicleImg) {
    const boxW = 55;
    const boxH = 29;
    const imgX = rightX - boxW;
    const imgY = clientStartY - 3;
    try {
      addImageContain(doc, vehicleImg, imgX, imgY, boxW, boxH, 'PNG');
    } catch { /* no image */ }
  }

  // Separación equivalente a un renglón normal entre PAGADO y descripción.
  // El sello termina en paidBoxY + paidBoxH. Se dejan 7 mm de separación.
  y = paidBoxY + paidBoxH + 7;

  // ── DESCRIPTION BAR ──
  const barH = 11;
  doc.setFillColor(...COLORS.black);
  doc.rect(margin, y, contentWidth, barH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.white);
  doc.text(t.transferDesc, margin + 5, y + 8);
  y += barH + 8;

  // ── BULLET ITEMS (with emoji icons) ──
  const bulletItems = [
    { emoji: 'vehicle', label: t.vehicle, value: reserva.vehiculoNombre || 'N/A' },
    { emoji: 'person', label: t.clientName, value: reserva.clienteNombre || 'N/A' },
    { emoji: 'calendar', label: t.dateTime, value: `${reserva.fechaIda || 'N/A'} / ${reserva.horaIda || 'N/A'} hrs` },
    { emoji: 'location', label: t.pickupAt, value: reserva.origen || 'N/A' },
  ];

  if (reserva.numVuelo && reserva.aerolinea) {
    bulletItems.push({ emoji: 'flight', label: t.flightAndAirline, value: `${reserva.aerolinea} ${reserva.numVuelo}` });
  } else {
    if (reserva.aerolinea) bulletItems.push({ emoji: 'flight', label: t.airline, value: reserva.aerolinea });
    if (reserva.numVuelo) bulletItems.push({ emoji: 'flight', label: t.flightNumber, value: reserva.numVuelo });
  }

  bulletItems.push(
    { emoji: 'passengers', label: t.numPassengers, value: `${reserva.numPasajeros || 'N/A'} PAX` },
    { emoji: 'bags', label: t.numBags, value: `${reserva.numMaletas || '0'}` },
    { emoji: 'phone', label: t.clientPhone, value: formatearTelefono(reserva.clienteTelefono) },
    { emoji: 'location', label: t.destination, value: reserva.destino || 'N/A' },
    { emoji: 'checkmark', label: t.roundTrip, value: reserva.tipoViaje === 'redondo' ? t.yes : t.no },
  );

  if (reserva.distancia) bulletItems.push({ emoji: 'distance', label: t.distance, value: reserva.distancia });
  if (reserva.duracion) bulletItems.push({ emoji: 'time', label: t.estTime, value: reserva.duracion });

  const bulletFontSize = 13;
  const bulletLineH = 8;
  const textIndent = margin + EMOJI_SIZE + 3;
  doc.setFontSize(bulletFontSize);

  bulletItems.forEach((item) => {
    drawEmoji(doc, item.emoji, margin + 1, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    const labelStr = `${item.label}: `;
    doc.text(labelStr, textIndent, y);

    const labelWidth = doc.getStringUnitWidth(labelStr) * bulletFontSize / doc.internal.scaleFactor;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.blue);
    const maxW = contentWidth - (textIndent - margin) - labelWidth - 2;
    y = drawWrappedValue(doc, item.value, textIndent + labelWidth, y, maxW, bulletLineH);
    y += bulletLineH;
  });

  // ── RETURN (single line below estimated time) ──
  const isRoundTrip = reserva.tipoViaje === 'redondo' && reserva.fechaRegreso;
  if (isRoundTrip) {
    y += 2;
    const returnDate = formatearFechaRegreso(reserva.fechaRegreso);
    const returnTime = formatearHoraRegreso(reserva.horaRegreso);
    const returnText = `Regreso: ${returnDate}${returnTime ? `  ${returnTime}` : ''}`;
    drawEmoji(doc, 'checkmark', margin + 1, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(bulletFontSize);
    doc.setTextColor(...COLORS.black);
    doc.text(returnText, textIndent, y);
    y += bulletLineH + 2;
  }

  // ── OBSERVATIONS (FIXED SIZE/POSITION MATCHING NOTA DE VENTA MX177) ──
  const observacionesTexto = String(
    reserva.observaciones ??
    reserva.notas ??
    reserva.notes ??
    reserva.observations ??
    reserva.comentarios ??
    ''
  ).trim();

  // Footer line stays fixed. Observation box sits just above it,
  // matching the reference Nota de Venta MX177 in size and spacing.
  const footerY = ph - 22;
  const obsBoxHeight = 18; // mm: fixed box height, like the reference PDF
  const obsBoxX = margin;
  const obsBoxWidth = contentWidth;
  const obsY = footerY - obsBoxHeight - 5; // 5 mm above the footer line
  const obsPaddingX = 5;

  // Box: white fill, gray outline, rounded corners
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.5);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(
    obsBoxX,
    obsY,
    obsBoxWidth,
    obsBoxHeight,
    5,
    5,
    'FD'
  );

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text(`${t.observations}:`, obsBoxX + obsPaddingX, obsY + 6);

  // Text: wrap and fit inside the fixed-height box. For multiple lines,
  // reduce the font size slightly as needed to prevent clipping.
  if (observacionesTexto) {
    const obsTextWidth = obsBoxWidth - obsPaddingX * 2;
    let obsFontSize = 9;
    let obsLines = doc.splitTextToSize(observacionesTexto, obsTextWidth);
    const availableTextHeight = obsBoxHeight - 12;
    while (obsLines.length * 4.2 > availableTextHeight && obsFontSize > 6) {
      obsFontSize -= 0.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(obsFontSize);
      obsLines = doc.splitTextToSize(observacionesTexto, obsTextWidth);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(obsFontSize);
    doc.setTextColor(40, 40, 40);
    doc.text(obsLines, obsBoxX + obsPaddingX, obsY + 12);
  }

  // ── FOOTER ON EVERY PAGE ──
  const fechaHoraActual = new Date();

  const fechaFooter = fechaHoraActual.toLocaleDateString(
    lang === 'en' ? 'en-US' : 'es-MX',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );

  const horaFooter = fechaHoraActual.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const footerInfo =
    `San Miguel de Allende, Guanajuato · Documento Generado: ${fechaFooter} · Hora: ${horaFooter}`;

  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    // Línea superior del pie
    doc.setDrawColor(...COLORS.black);
    doc.setLineWidth(1.2);
    doc.line(margin, footerY, rightX, footerY);

    // Fecha, hora y lugar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.footerGray);

    doc.text(footerInfo, pw / 2, footerY + 6, {
      align: 'center',
    });

    // Empresa
    doc.text(
      'Grupo Turístico MX S. de R.L. de C.V.',
      pw / 2,
      footerY + 12,
      {
        align: 'center',
      }
    );
  }

  return doc;
}
