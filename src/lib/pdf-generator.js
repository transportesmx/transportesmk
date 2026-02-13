import jsPDF from 'jspdf';
import { LOGO_BASE64 } from './logo-base64';

const COLORS = {
  black: [0, 0, 0],
  dark: [20, 20, 20],
  text: [30, 30, 30],
  textLight: [100, 100, 100],
  line: [180, 180, 180],
  white: [255, 255, 255],
  red: [200, 30, 30],
};

/**
 * Genera un folio único y fácil de rastrear
 * Formato: TMX-YYMMDD-XXXX (ej: TMX-260212-A3F8)
 */
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

/**
 * Formatea teléfono con lada y espacios
 * Ej: "4151393219" → "+52 415 139 3219"
 */
function formatearTelefono(tel) {
  if (!tel) return 'N/A';
  const limpio = tel.replace(/\D/g, '');
  if (limpio.length === 10) {
    return `+52 ${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
  }
  if (limpio.length === 12 && limpio.startsWith('52')) {
    return `+${limpio.slice(0, 2)} ${limpio.slice(2, 5)} ${limpio.slice(5, 8)} ${limpio.slice(8)}`;
  }
  if (limpio.length === 13 && limpio.startsWith('521')) {
    return `+${limpio.slice(0, 2)} ${limpio.slice(3, 6)} ${limpio.slice(6, 9)} ${limpio.slice(9)}`;
  }
  return tel;
}

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
    footer: 'TransportesMX | transportesmx.org | +52 415 139 3219',
    generated: 'Document generated on',
  },
};

/**
 * Genera una hoja de servicio PDF profesional
 * - Solo color negro (sin azul)
 * - Sin precios
 * - Folio en recuadro rojo con letras blancas
 * - Teléfonos formateados con lada
 * - Incluye aerolínea y número de vuelo
 */
export function generarHojaServicio(reserva, lang = 'es') {
  const t = labels[lang] || labels.es;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pw - margin * 2;

  let y = margin;

  // ── LOGO ──
  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, y, 44, 15);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.black);
    doc.text('TRANSPORTES MX', margin, y + 10);
  }

  // Info empresa
  y += 18;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(t.company, margin, y);
  doc.text(t.address, margin, y + 4);
  doc.text(t.phone, margin, y + 8);
  doc.text(t.email, margin, y + 12);
  doc.text(t.website, margin, y + 16);

  // Folio en RECUADRO ROJO
  const folio = generarFolio(reserva.id);
  const rightX = pw - margin;
  const folioText = `${t.folio}: ${folio}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const folioW = doc.getStringUnitWidth(folioText) * 10 / doc.internal.scaleFactor + 12;
  const folioH = 9;
  const folioX = rightX - folioW;
  const folioY = margin + 2;

  // Recuadro rojo
  doc.setFillColor(...COLORS.red);
  doc.roundedRect(folioX, folioY, folioW, folioH, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.text(folioText, folioX + 6, folioY + 6.5);

  // Fecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const fechaDoc = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  doc.text(`${t.date}: ${fechaDoc}`, rightX, margin + 20, { align: 'right' });

  y += 22;

  // Línea separadora
  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pw - margin, y);
  y += 10;

  // ── DATOS DEL CLIENTE ──
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);

  doc.setFont('helvetica', 'normal');
  doc.text(`${t.client}: `, margin, y);
  doc.setFont('helvetica', 'bold');
  const clW = doc.getStringUnitWidth(`${t.client}: `) * 11 / doc.internal.scaleFactor;
  doc.text(reserva.clienteNombre || 'N/A', margin + clW, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(`${t.clientPhone}: ${formatearTelefono(reserva.clienteTelefono)}`, margin, y);
  y += 6;
  doc.text(`${t.clientEmail}: ${reserva.clienteEmail || 'N/A'}`, margin, y);
  y += 12;

  // ── DESCRIPCIÓN DEL TRASLADO ──
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
    { label: t.numBags, value: `${reserva.numMaletas || '0'}` },
    { label: t.clientPhone, value: formatearTelefono(reserva.clienteTelefono) },
    { label: t.destination, value: reserva.destino || 'N/A' },
  ];

  // Aerolínea y vuelo (si aplica)
  if (reserva.aerolinea) {
    bulletItems.push({ label: t.airline, value: reserva.aerolinea });
  }
  if (reserva.numVuelo) {
    bulletItems.push({ label: t.flightNumber, value: reserva.numVuelo });
  }

  if (reserva.distancia) bulletItems.push({ label: t.distance, value: reserva.distancia });
  if (reserva.duracion) bulletItems.push({ label: t.estTime, value: reserva.duracion });
  bulletItems.push({ label: t.roundTrip, value: reserva.tipoViaje === 'redondo' ? t.yes : t.no });

  doc.setFontSize(10);
  bulletItems.forEach((item) => {
    doc.setFillColor(...COLORS.text);
    doc.circle(margin + 4, y - 1.2, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(`${item.label}: `, margin + 8, y);

    const labelWidth = doc.getStringUnitWidth(`${item.label}: `) * 10 / doc.internal.scaleFactor;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    const maxW = contentWidth - 8 - labelWidth - 5;
    const lines = doc.splitTextToSize(String(item.value), maxW);
    doc.text(lines, margin + 8 + labelWidth, y);
    y += 7 * lines.length;
  });

  y += 5;

  // ── REGRESO (si aplica) ──
  if (reserva.tipoViaje === 'redondo' && reserva.fechaRegreso) {
    doc.setDrawColor(...COLORS.black);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pw - margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.black);
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
      doc.setTextColor(...COLORS.black);
      doc.text(String(item.value), margin + 8 + lw, y);
      y += 7;
    });
  }

  // ── FOOTER ──
  const footerY = 275;
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pw - margin, footerY);

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  const fW = doc.getStringUnitWidth(t.footer) * 8 / doc.internal.scaleFactor;
  doc.text(t.footer, (pw - fW) / 2, footerY + 6);

  const genText = `${t.generated} ${new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}`;
  const gW = doc.getStringUnitWidth(genText) * 7 / doc.internal.scaleFactor;
  doc.setFontSize(7);
  doc.text(genText, (pw - gW) / 2, footerY + 11);

  return doc;
}
