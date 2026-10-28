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

function getVehicleImage(vehiculoId, vehiculoNombre) {
  if (vehiculoId && VEHICLE_IMAGES[vehiculoId]) return VEHICLE_IMAGES[vehiculoId];
  const nombre = (vehiculoNombre || '').toLowerCase();
  if (nombre.includes('sedan')) return VEHICLE_IMAGES.sedan;
  if (nombre.includes('suburban')) return VEHICLE_IMAGES.suburban;
  if (nombre.includes('minivan') || nombre.includes('van')) return VEHICLE_IMAGES.minivan;
  if (nombre.includes('hiace')) return VEHICLE_IMAGES.hiace;
  if (nombre.includes('sprinter')) return VEHICLE_IMAGES.sprinter;
  return null;
}

const labels = {
  es: {
    company: 'Grupo Turístico MX S. de R.L',
    rfc: 'RATG900822G16',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    siteLabel: 'Sitio Web:',
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
    comments: 'Comentarios',
    returnSection: 'Regreso:',
    returnPickup: 'Recoger en',
    returnDateTime: 'Fecha y hora',
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Documento generado el',
  },
  en: {
    company: 'Grupo Turístico MX S. de R.L',
    rfc: 'RATG900822G16',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    siteLabel: 'Website:',
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
    comments: 'Comments',
    returnSection: 'Return:',
    returnPickup: 'Pickup at',
    returnDateTime: 'Date and time',
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

export function generarHojaServicio(reserva, lang = 'es') {
  const t = labels[lang] || labels.es;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pw - margin * 2;
  const rightX = pw - margin;

  let y = margin;

  // Calculate logo width to match company name text width
  const companyFontSize = 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(companyFontSize);
  const companyTextW = doc.getStringUnitWidth(t.company) * companyFontSize / doc.internal.scaleFactor;
  const logoW = companyTextW;
  const logoH = logoW / 4.56;

  // ── LOGO ──
  try {
    doc.addImage(LOGOPDF_BASE64, 'PNG', margin, y, logoW, logoH);
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
    doc.addImage(QRPDF_BASE64, 'PNG', qrX, y - 3, qrSize, qrSize);
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
  doc.setFont('helvetica', 'bold');
  doc.text(t.status, folioBoxX, y + folioH + 12);

  // ── Company info ──
  y += logoH + 8;
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
  doc.setTextColor(...COLORS.black);
  doc.setFont('helvetica', 'normal');
  const siteStr = `${t.siteLabel} `;
  doc.text(siteStr, margin, y);
  const siteLabelW = doc.getStringUnitWidth(siteStr) * companyFontSize / doc.internal.scaleFactor;
  doc.setTextColor(...COLORS.blue);
  doc.textWithLink(t.website, margin + siteLabelW, y, { url: t.website });

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

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.black);
  const clLabel = `${t.client}: `;
  doc.text(clLabel, margin, y);
  const clLabelW = doc.getStringUnitWidth(clLabel) * clientFontSize / doc.internal.scaleFactor;
  doc.setFont('helvetica', 'bold');
  doc.text(reserva.clienteNombre || 'N/A', margin + clLabelW, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  const telLabel = `${t.clientPhone}: `;
  doc.text(telLabel, margin, y);
  const telLabelW = doc.getStringUnitWidth(telLabel) * clientFontSize / doc.internal.scaleFactor;
  doc.setFont('helvetica', 'bold');
  doc.text(formatearTelefono(reserva.clienteTelefono), margin + telLabelW, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  const emLabel = `${t.clientEmail}: `;
  doc.text(emLabel, margin, y);
  const emLabelW = doc.getStringUnitWidth(emLabel) * clientFontSize / doc.internal.scaleFactor;
  doc.setTextColor(...COLORS.blue);
  doc.setFont('helvetica', 'bold');
  doc.text(reserva.clienteEmail || 'N/A', margin + emLabelW, y);
  y += 4;

  // ── Vehicle image (right column) ──
  const vehicleImg = getVehicleImage(reserva.vehiculoId, reserva.vehiculoNombre);
  if (vehicleImg) {
    const finalW = 55;
    const finalH = finalW / 2;
    const imgX = rightX - finalW;
    const imgY = clientStartY - 2;
    try {
      doc.addImage(vehicleImg, 'PNG', imgX, imgY, finalW, finalH);
    } catch { /* no image */ }
  }

  y += 10;

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

  // ── COMMENTS (optional) ──
  if (reserva.comentarios) {
    y += 4;
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(margin, y, rightX, y);
    y += 8;

    drawEmoji(doc, 'comment', margin + 1, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(bulletFontSize);
    doc.setTextColor(...COLORS.black);
    const comLabel = `${t.comments}: `;
    doc.text(comLabel, textIndent, y);
    const comLabelW = doc.getStringUnitWidth(comLabel) * bulletFontSize / doc.internal.scaleFactor;
    doc.setTextColor(...COLORS.blue);
    y = drawWrappedValue(doc, reserva.comentarios, textIndent + comLabelW, y, contentWidth - (textIndent - margin) - comLabelW, bulletLineH);
    y += bulletLineH;
  }

  y += 6;

  // ── RETURN SECTION ──
  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(0.5);
  doc.line(margin, y, rightX, y);
  y += 10;

  drawEmoji(doc, 'checkmark', margin + 1, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.black);
  doc.text(t.returnSection, textIndent, y);
  y += 9;

  const isRoundTrip = reserva.tipoViaje === 'redondo' && reserva.fechaRegreso;

  const returnItems = [
    { emoji: 'location', label: t.returnPickup, value: isRoundTrip ? (reserva.destino || 'N/A') : '' },
    { emoji: 'calendar', label: t.returnDateTime, value: isRoundTrip ? `${reserva.fechaRegreso} / ${reserva.horaRegreso || 'N/A'} hrs` : '' },
  ];

  doc.setFontSize(bulletFontSize);
  returnItems.forEach((item) => {
    drawEmoji(doc, item.emoji, margin + 1, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    const labelStr = `${item.label}: `;
    doc.text(labelStr, textIndent, y);

    const lw = doc.getStringUnitWidth(labelStr) * bulletFontSize / doc.internal.scaleFactor;
    doc.setTextColor(...COLORS.blue);
    doc.setFont('helvetica', 'bold');
    const maxW = contentWidth - (textIndent - margin) - lw;
    y = drawWrappedValue(doc, item.value, textIndent + lw, y, maxW, bulletLineH);
    y += bulletLineH;
  });

  // ── FOOTER ──
  const footerY = ph - 16;
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, rightX, footerY);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.footerGray);
  doc.setFont('helvetica', 'normal');
  doc.text(t.footer, pw / 2, footerY + 5, { align: 'center' });

  const genText = `${t.generated} ${new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}`;
  doc.setFontSize(8);
  doc.text(genText, pw / 2, footerY + 10, { align: 'center' });

  return doc;
}
