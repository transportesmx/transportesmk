import jsPDF from 'jspdf';
import { LOGO_BASE64 } from './logo-base64';
import { VEHICLE_IMAGES } from './vehicle-images-base64';

const COLORS = {
  black: [0, 0, 0],
  dark: [20, 20, 20],
  text: [30, 30, 30],
  textLight: [100, 100, 100],
  blue: [0, 51, 153],
  line: [200, 200, 200],
  lineDark: [120, 120, 120],
  white: [255, 255, 255],
  red: [200, 30, 30],
  bgLight: [245, 245, 245],
};

function generarFolio(reservaId) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hash = reservaId
    ? reservaId.toString().slice(-4).toUpperCase()
    : Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TMX-${yy}${mm}${dd}-${hash}`;
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
    serviceSheet: 'HOJA DE SERVICIO',
    company: 'Grupo Turístico MX',
    rfc: 'RATG900822G16',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    folio: 'Folio',
    date: 'Fecha',
    status: 'Pagado',
    client: 'Cliente',
    clientPhone: 'Teléfono',
    clientEmail: 'Correo',
    transferDesc: 'Descripción del traslado:',
    vehicle: 'Vehículo',
    clientName: 'Nombre de cliente',
    dateTime: 'Fecha y hora',
    pickupAt: 'Recoger en',
    numPassengers: 'Número de Pasajeros',
    numBags: 'Número de Maletas',
    airline: 'Aerolínea',
    flightNumber: 'No. Vuelo',
    destination: 'Destino',
    distance: 'Distancia',
    estTime: 'Tiempo estimado',
    roundTrip: 'Ida y vuelta',
    yes: 'Sí',
    no: 'No',
    returnSection: 'Regreso:',
    returnPickup: 'Recoger en',
    returnDateTime: 'Fecha y hora',
    comments: 'Comentarios',
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Documento generado el',
    siteLabel: 'Sitio web:',
  },
  en: {
    serviceSheet: 'SERVICE SHEET',
    company: 'Grupo Turístico MX',
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
    numPassengers: 'Number of Passengers',
    numBags: 'Number of Bags',
    airline: 'Airline',
    flightNumber: 'Flight No.',
    destination: 'Destination',
    distance: 'Distance',
    estTime: 'Estimated time',
    roundTrip: 'Round trip',
    yes: 'Yes',
    no: 'No',
    returnSection: 'Return:',
    returnPickup: 'Pickup at',
    returnDateTime: 'Date and time',
    comments: 'Comments',
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Document generated on',
    siteLabel: 'Website:',
  },
};

export function generarHojaServicio(reserva, lang = 'es') {
  const t = labels[lang] || labels.es;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pw - margin * 2;

  let y = margin;

  // ── LOGO ──
  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, y, 60, 20);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...COLORS.black);
    doc.text('TRANSPORTES MX', margin, y + 14);
  }

  // ── Empresa info (lado izquierdo, debajo del logo) ──
  y += 24;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  [t.company, t.address, t.phone, t.rfc].forEach((line) => {
    doc.text(line, margin, y);
    y += 5;
  });
  doc.setTextColor(...COLORS.blue);
  doc.textWithLink(t.email, margin, y, { url: `mailto:${t.email}` });
  y += 5;
  doc.setTextColor(...COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.siteLabel}`, margin, y);
  y += 5;
  doc.setTextColor(...COLORS.blue);
  doc.textWithLink(t.website, margin, y, { url: t.website });
  y += 5;

  // ── Folio en RECUADRO ROJO (derecha arriba) ──
  const folio = generarFolio(reserva.id);
  const rightX = pw - margin;
  const folioText = `${t.folio}: ${folio}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const folioW = doc.getStringUnitWidth(folioText) * 12 / doc.internal.scaleFactor + 14;
  const folioH = 10;
  const folioX = rightX - folioW;
  const folioY = margin + 2;

  doc.setFillColor(...COLORS.red);
  doc.roundedRect(folioX, folioY, folioW, folioH, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.text(folioText, folioX + 7, folioY + 7);

  // Fecha y Pagado (debajo del folio, alineado a la derecha)
  const fechaDoc = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.black);
  doc.text(`${t.date}: ${fechaDoc}`, rightX, folioY + folioH + 10, { align: 'right' });
  doc.text(t.status, rightX, folioY + folioH + 18, { align: 'right' });

  // ── Línea separadora después del header ──
  y += 4;
  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pw - margin, y);
  y += 10;

  // ── SECCIÓN 2 COLUMNAS: Cliente (izq) + Vehículo imagen (der) ──
  const clientSectionY = y;
  const fontSize = 14;

  // Columna izquierda: datos del cliente
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.black);
  const clLabel = `${t.client}: `;
  doc.text(clLabel, margin, y);
  const clLabelW = doc.getStringUnitWidth(clLabel) * fontSize / doc.internal.scaleFactor;
  doc.setFont('helvetica', 'bold');
  doc.text(reserva.clienteNombre || 'N/A', margin + clLabelW, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...COLORS.black);
  const telLabel = `${t.clientPhone}: `;
  doc.text(telLabel, margin, y);
  const telLabelW = doc.getStringUnitWidth(telLabel) * fontSize / doc.internal.scaleFactor;
  doc.text(formatearTelefono(reserva.clienteTelefono), margin + telLabelW, y);
  y += 8;

  const emailLabel = `${t.clientEmail}: `;
  doc.text(emailLabel, margin, y);
  const emailLabelW = doc.getStringUnitWidth(emailLabel) * fontSize / doc.internal.scaleFactor;
  doc.setTextColor(...COLORS.blue);
  doc.text(reserva.clienteEmail || 'N/A', margin + emailLabelW, y);
  y += 5;

  // Columna derecha: imagen del vehículo (aspect ratio real ~2:1)
  const colHeight = y - clientSectionY + 2;
  const imgH = colHeight;
  const imgW = imgH * 2;
  const imgX = pw - margin - imgW;
  const vehicleImg = getVehicleImage(reserva.vehiculoId, reserva.vehiculoNombre);
  if (vehicleImg) {
    try {
      doc.addImage(vehicleImg, 'PNG', imgX, clientSectionY - 2, imgW, imgH);
    } catch { /* no image */ }
  }

  y += 10;

  // ── DESCRIPCIÓN DEL TRASLADO ──
  doc.setFillColor(...COLORS.dark);
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.white);
  doc.text(t.transferDesc, margin + 5, y + 7);
  y += 16;

  // Bullet points
  const bulletItems = [
    { label: t.vehicle, value: reserva.vehiculoNombre || 'N/A' },
    { label: t.clientName, value: reserva.clienteNombre || 'N/A' },
    { label: t.dateTime, value: `${reserva.fechaIda || 'N/A'} / ${reserva.horaIda || 'N/A'} hrs` },
    { label: t.pickupAt, value: reserva.origen || 'N/A' },
  ];

  if (reserva.numVuelo && reserva.aerolinea) {
    bulletItems.push({ label: `${t.flightNumber} ${t.airline}`, value: `${reserva.aerolinea} ${reserva.numVuelo}` });
  } else {
    if (reserva.aerolinea) bulletItems.push({ label: t.airline, value: reserva.aerolinea });
    if (reserva.numVuelo) bulletItems.push({ label: t.flightNumber, value: reserva.numVuelo });
  }

  bulletItems.push(
    { label: t.numPassengers, value: `${reserva.numPasajeros || 'N/A'} PAX` },
    { label: t.numBags, value: `${reserva.numMaletas || '0'}` },
    { label: t.clientPhone, value: formatearTelefono(reserva.clienteTelefono) },
    { label: t.destination, value: reserva.destino || 'N/A' },
    { label: t.roundTrip, value: reserva.tipoViaje === 'redondo' ? t.yes : t.no },
  );

  if (reserva.distancia) bulletItems.push({ label: t.distance, value: reserva.distancia });
  if (reserva.duracion) bulletItems.push({ label: t.estTime, value: reserva.duracion });

  const bulletFontSize = 12;
  doc.setFontSize(bulletFontSize);
  bulletItems.forEach((item) => {
    doc.setFillColor(...COLORS.black);
    doc.circle(margin + 4, y - 1.5, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    doc.text(`${item.label}: `, margin + 9, y);

    const labelWidth = doc.getStringUnitWidth(`${item.label}: `) * bulletFontSize / doc.internal.scaleFactor;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.blue);
    const maxW = contentWidth - 9 - labelWidth - 5;
    const lines = doc.splitTextToSize(String(item.value), maxW);
    doc.text(lines, margin + 9 + labelWidth, y);
    y += 8 * lines.length;
  });

  y += 6;

  // ── REGRESO (siempre visible) ──
  doc.setDrawColor(...COLORS.lineDark);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pw - margin, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.black);
  doc.text(t.returnSection, margin, y);
  y += 9;

  const isRoundTrip = reserva.tipoViaje === 'redondo' && reserva.fechaRegreso;
  const returnItems = [
    { label: t.returnPickup, value: isRoundTrip ? (reserva.destino || 'N/A') : '' },
    { label: t.returnDateTime, value: isRoundTrip ? `${reserva.fechaRegreso} / ${reserva.horaRegreso || 'N/A'} hrs` : '' },
  ];

  doc.setFontSize(bulletFontSize);
  returnItems.forEach((item) => {
    doc.setFillColor(...COLORS.black);
    doc.circle(margin + 4, y - 1.5, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    doc.text(`${item.label}: `, margin + 9, y);
    const lw = doc.getStringUnitWidth(`${item.label}: `) * bulletFontSize / doc.internal.scaleFactor;
    doc.setTextColor(...COLORS.blue);
    doc.text(String(item.value), margin + 9 + lw, y);
    y += 8;
  });

  // ── FOOTER ──
  const footerY = ph - 18;
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pw - margin, footerY);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(t.footer, pw / 2, footerY + 5, { align: 'center' });

  const genText = `${t.generated} ${new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}`;
  doc.setFontSize(8);
  doc.text(genText, pw / 2, footerY + 10, { align: 'center' });

  return doc;
}
