
import jsPDF from 'jspdf';
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

// =====================================================
// CARGADOR DE IMAGENES PUBLICAS
// =====================================================

async function cargarImagenPublica(ruta) {
  try {
    const respuesta = await fetch(
      `${ruta}?v=${Date.now()}`,
      { cache: 'no-store' }
    );

    if (!respuesta.ok) {
      throw new Error(`No se encontró: ${ruta}`);
    }

    const blob = await respuesta.blob();

    return await new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = () => resolve(lector.result);
      lector.onerror = () => reject(
        new Error('No se pudo leer la imagen')
      );

      lector.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error cargando imagen:', ruta, error);
    return null;
  }
}

// Detectar formato de imagen
function obtenerFormatoImagen(imagen) {
  if (!imagen) return null;

  if (
    imagen.startsWith('data:image/jpeg') ||
    imagen.startsWith('data:image/jpg')
  ) {
    return 'JPEG';
  }

  if (imagen.startsWith('data:image/png')) {
    return 'PNG';
  }

  if (imagen.startsWith('data:image/webp')) {
    return 'WEBP';
  }

  return null;
}

// Obtener dimensiones originales
function calcularDimensionesImagen(doc, imagen, maxW, maxH) {
  const propiedades = doc.getImageProperties(imagen);

  const proporcion = propiedades.width / propiedades.height;

  let width = maxW;
  let height = width / proporcion;

  if (height > maxH) {
    height = maxH;
    width = height * proporcion;
  }

  return { width, height };
}

// =====================================================
// IMAGENES DE VEHICULOS
// =====================================================

const VEHICLE_IMAGE_FILES = {
  sedan: 'sedan.jpeg',
  suburban: 'suburban.jpeg',
  minivan: 'minivan.jpeg',
  hiace: 'hiace.jpeg',
  sprinter: 'sprinter.jpeg',
};

// Identificar vehículo
function getVehicleImageFile(vehiculoId, vehiculoNombre) {
  const nombre = `${vehiculoId || ''} ${vehiculoNombre || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (nombre.includes('suburban')) {
    return VEHICLE_IMAGE_FILES.suburban;
  }

  if (nombre.includes('sprinter')) {
    return VEHICLE_IMAGE_FILES.sprinter;
  }

  if (nombre.includes('hiace')) {
    return VEHICLE_IMAGE_FILES.hiace;
  }

  if (
    nombre.includes('minivan') ||
    nombre.includes('odyssey')
  ) {
    return VEHICLE_IMAGE_FILES.minivan;
  }

  if (
    nombre.includes('sedan') ||
    nombre.includes('jetta')
  ) {
    return VEHICLE_IMAGE_FILES.sedan;
  }

  return null;
}

// Cargar vehículo desde public/assets/vehiculos/
async function cargarImagenVehiculo(vehiculoId, vehiculoNombre) {
  const archivo = getVehicleImageFile(
    vehiculoId,
    vehiculoNombre
  );

  if (!archivo) return null;

  return await cargarImagenPublica(
    `/assets/vehiculos/${archivo}`
  );
}

// =====================================================
// FOLIO
// =====================================================

function generarFolio(reservaId) {
  if (reservaId) {
    const clean = String(reservaId).replace(/\D/g, '');

    if (clean.length >= 4) {
      return `MX${clean.slice(-6).padStart(6, '0')}`;
    }
  }

  const n = Math.floor(100000 + Math.random() * 900000);

  return `MX${n}`;
}

// =====================================================
// FORMATO TELEFONO
// =====================================================

function formatearTelefono(tel) {
  if (!tel) return 'N/A';

  const limpio = String(tel).replace(/\D/g, '');

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

// =====================================================
// TEXTOS
// =====================================================

const labels = {
  es: {
    company: 'Grupo Turístico MX S. de R.L de C.V',
    rfc: 'RATG900822G16',
    address: 'San Miguel de Allende GTO.',
    phone: '+52 415 139 3219',
    email: 'contacto@transportesmx.org',
    website: 'https://transportesmx.org',
    siteLabel: '',
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

// =====================================================
// ICONOS
// =====================================================

function drawEmoji(doc, emojiKey, x, y) {
  const icon = EMOJI_ICONS[emojiKey];

  if (icon) {
    try {
      doc.addImage(
        icon,
        'PNG',
        x,
        y - EMOJI_SIZE + 0.5,
        EMOJI_SIZE,
        EMOJI_SIZE
      );

      return;
    } catch {
      // Continuar con icono alternativo
    }
  }

  doc.setFillColor(...COLORS.black);

  doc.circle(
    x + EMOJI_SIZE / 2,
    y - EMOJI_SIZE / 2 + 0.5,
    1.3,
    'F'
  );
}

// =====================================================
// TEXTO CON AJUSTE
// =====================================================

function drawWrappedValue(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(
    String(text || ''),
    maxWidth
  );

  doc.text(lines, x, y);

  return y + lineHeight * (lines.length - 1);
}

// =====================================================
// GENERAR HOJA DE SERVICIO
// =====================================================

export async function generarHojaServicio(reserva, lang = 'es') {
  const t = labels[lang] || labels.es;

  const doc = new jsPDF();

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const margin = 15;
  const contentWidth = pw - margin * 2;
  const rightX = pw - margin;

  let y = margin;

  // ===================================================
  // CARGAR IMAGENES ACTUALIZADAS
  // ===================================================

  const [logoActual, qrActual, vehicleImg] = await Promise.all([
    cargarImagenPublica('/logo.jpg'),
    cargarImagenPublica('/assets/qrpdf.png'),
    cargarImagenVehiculo(
      reserva.vehiculoId,
      reserva.vehiculoNombre
    ),
  ]);

  // ===================================================
  // LOGOTIPO
  // ===================================================

  const companyFontSize = 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(companyFontSize);

  const companyTextW =
    doc.getStringUnitWidth(t.company) *
    companyFontSize /
    doc.internal.scaleFactor;

  const logoW = companyTextW;
  let logoH = logoW / 4.56;

  if (logoActual) {
    try {
      const formatoLogo = obtenerFormatoImagen(logoActual);

      const dimensionesLogo = calcularDimensionesImagen(
        doc,
        logoActual,
        logoW,
        22
      );

      logoH = dimensionesLogo.height;

      doc.addImage(
        logoActual,
        formatoLogo,
        margin,
        y,
        dimensionesLogo.width,
        dimensionesLogo.height
      );
    } catch (error) {
      console.error('Error insertando logotipo:', error);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...COLORS.black);
      doc.text('TRANSPORTES MX', margin, y + 12);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.black);
    doc.text('TRANSPORTES MX', margin, y + 12);
  }

  // ===================================================
  // QR
  // ===================================================

  const qrSize = 36;

  const qrLeftEdge = margin + logoW + 6;
  const qrRightEdge = rightX - 50;

  const qrX =
    qrLeftEdge +
    (qrRightEdge - qrLeftEdge - qrSize) / 2;

  if (qrActual) {
    try {
      const formatoQR = obtenerFormatoImagen(qrActual);

      doc.addImage(
        qrActual,
        formatoQR,
        qrX,
        y - 3,
        qrSize,
        qrSize
      );
    } catch (error) {
      console.error('Error insertando QR:', error);
    }
  } else {
    console.error('No se pudo cargar el QR del PDF');
  }

  // ===================================================
  // FOLIO
  // ===================================================

  const folio = generarFolio(reserva.id);
  const folioText = `${t.folio}: ${folio}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);

  const folioTextW =
    doc.getStringUnitWidth(folioText) *
    11 /
    doc.internal.scaleFactor + 12;

  const folioH = 9;
  const folioBoxX = rightX - folioTextW;

  doc.setFillColor(...COLORS.red);

  doc.roundedRect(
    folioBoxX,
    y,
    folioTextW,
    folioH,
    1.5,
    1.5,
    'F'
  );

  doc.setTextColor(...COLORS.white);

  doc.text(
    folioText,
    folioBoxX + 6,
    y + 6.5
  );

  // ===================================================
  // FECHA Y ESTADO
  // ===================================================

  const fechaDoc = new Date().toLocaleDateString(
    lang === 'en' ? 'en-US' : 'es-MX',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.black);

  doc.text(
    `${t.date}: ${fechaDoc}`,
    folioBoxX,
    y + folioH + 6
  );

  doc.setFont('helvetica', 'bold');

  doc.text(
    t.status,
    folioBoxX,
    y + folioH + 12
  );

  // ===================================================
  // INFORMACION DE LA EMPRESA
  // ===================================================

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

  doc.textWithLink(
    t.email,
    margin,
    y,
    { url: `mailto:${t.email}` }
  );

  y += 4.5;

  doc.setTextColor(...COLORS.black);

  const siteStr = `${t.siteLabel} `;

  doc.text(siteStr, margin, y);

  const siteLabelW =
    doc.getStringUnitWidth(siteStr) *
    companyFontSize /
    doc.internal.scaleFactor;

  doc.setTextColor(...COLORS.blue);

  doc.textWithLink(
    t.website,
    margin + siteLabelW,
    y,
    { url: t.website }
  );

  y += 8;

  // ===================================================
  // LINEA SEPARADORA
  // ===================================================

  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(1.2);

  doc.line(margin, y, rightX, y);

  y += 10;

  // ===================================================
  // CLIENTE
  // ===================================================

  const clientStartY = y;
  const clientFontSize = 13;

  doc.setFontSize(clientFontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.black);

  const clLabel = `${t.client}: `;

  doc.text(clLabel, margin, y);

  const clLabelW =
    doc.getStringUnitWidth(clLabel) *
    clientFontSize /
    doc.internal.scaleFactor;

  doc.setFont('helvetica', 'bold');

  doc.text(
    reserva.clienteNombre || 'N/A',
    margin + clLabelW,
    y
  );

  y += 7;

  // TELEFONO

  doc.setFont('helvetica', 'normal');

  const telLabel = `${t.clientPhone}: `;

  doc.text(telLabel, margin, y);

  const telLabelW =
    doc.getStringUnitWidth(telLabel) *
    clientFontSize /
    doc.internal.scaleFactor;

  doc.setFont('helvetica', 'bold');

  doc.text(
    formatearTelefono(reserva.clienteTelefono),
    margin + telLabelW,
    y
  );

  y += 7;

  // CORREO

  doc.setFont('helvetica', 'normal');

  const emLabel = `${t.clientEmail}: `;

  doc.text(emLabel, margin, y);

  const emLabelW =
    doc.getStringUnitWidth(emLabel) *
    clientFontSize /
    doc.internal.scaleFactor;

  doc.setTextColor(...COLORS.blue);
  doc.setFont('helvetica', 'bold');

  doc.text(
    reserva.clienteEmail || 'N/A',
    margin + emLabelW,
    y
  );

  y += 4;

  // ===================================================
  // IMAGEN DEL VEHICULO SIN DEFORMAR
  // ===================================================

  if (vehicleImg) {
    try {
      const formatoImagen = obtenerFormatoImagen(vehicleImg);

      const maxW = 55;
      const maxH = 27.5;

      const dimensiones = calcularDimensionesImagen(
        doc,
        vehicleImg,
        maxW,
        maxH
      );

      const imgX = rightX - dimensiones.width;
      const imgY = clientStartY - 2;

      doc.addImage(
        vehicleImg,
        formatoImagen,
        imgX,
        imgY,
        dimensiones.width,
        dimensiones.height
      );
    } catch (error) {
      console.error(
        'Error insertando imagen del vehículo:',
        error
      );
    }
  }

  y += 10;

  // ===================================================
  // BARRA DESCRIPCION
  // ===================================================

  const barH = 11;

  doc.setFillColor(...COLORS.black);

  doc.rect(
    margin,
    y,
    contentWidth,
    barH,
    'F'
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.white);

  doc.text(
    t.transferDesc,
    margin + 5,
    y + 8
  );

  y += barH + 8;

  // ===================================================
  // DATOS DEL TRASLADO
  // ===================================================

  const bulletItems = [
    {
      emoji: 'vehicle',
      label: t.vehicle,
      value: reserva.vehiculoNombre || 'N/A',
    },
    {
      emoji: 'person',
      label: t.clientName,
      value: reserva.clienteNombre || 'N/A',
    },
    {
      emoji: 'calendar',
      label: t.dateTime,
      value: `${reserva.fechaIda || 'N/A'} / ${reserva.horaIda || 'N/A'} hrs`,
    },
    {
      emoji: 'location',
      label: t.pickupAt,
      value: reserva.origen || 'N/A',
    },
  ];

  if (reserva.numVuelo && reserva.aerolinea) {
    bulletItems.push({
      emoji: 'flight',
      label: t.flightAndAirline,
      value: `${reserva.aerolinea} ${reserva.numVuelo}`,
    });
  } else {
    if (reserva.aerolinea) {
      bulletItems.push({
        emoji: 'flight',
        label: t.airline,
        value: reserva.aerolinea,
      });
    }

    if (reserva.numVuelo) {
      bulletItems.push({
        emoji: 'flight',
        label: t.flightNumber,
        value: reserva.numVuelo,
      });
    }
  }

  bulletItems.push(
    {
      emoji: 'passengers',
      label: t.numPassengers,
      value: `${reserva.numPasajeros || 'N/A'} PAX`,
    },
    {
      emoji: 'bags',
      label: t.numBags,
      value: `${reserva.numMaletas || '0'}`,
    },
    {
      emoji: 'phone',
      label: t.clientPhone,
      value: formatearTelefono(reserva.clienteTelefono),
    },
    {
      emoji: 'location',
      label: t.destination,
      value: reserva.destino || 'N/A',
    },
    {
      emoji: 'checkmark',
      label: t.roundTrip,
      value: reserva.tipoViaje === 'redondo'
        ? t.yes
        : t.no,
    }
  );

  if (reserva.distancia) {
    bulletItems.push({
      emoji: 'distance',
      label: t.distance,
      value: reserva.distancia,
    });
  }

  if (reserva.duracion) {
    bulletItems.push({
      emoji: 'time',
      label: t.estTime,
      value: reserva.duracion,
    });
  }

  const bulletFontSize = 13;
  const bulletLineH = 8;

  const textIndent = margin + EMOJI_SIZE + 3;

  doc.setFontSize(bulletFontSize);

  bulletItems.forEach((item) => {
    drawEmoji(
      doc,
      item.emoji,
      margin + 1,
      y
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);

    const labelStr = `${item.label}: `;

    doc.text(labelStr, textIndent, y);

    const labelWidth =
      doc.getStringUnitWidth(labelStr) *
      bulletFontSize /
      doc.internal.scaleFactor;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.blue);

    const maxW =
      contentWidth -
      (textIndent - margin) -
      labelWidth - 2;

    y = drawWrappedValue(
      doc,
      item.value,
      textIndent + labelWidth,
      y,
      maxW,
      bulletLineH
    );

    y += bulletLineH;
  });

  // ===================================================
  // COMENTARIOS
  // ===================================================

  if (reserva.comentarios) {
    y += 4;

    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);

    doc.line(margin, y, rightX, y);

    y += 8;

    drawEmoji(
      doc,
      'comment',
      margin + 1,
      y
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(bulletFontSize);
    doc.setTextColor(...COLORS.black);

    const comLabel = `${t.comments}: `;

    doc.text(comLabel, textIndent, y);

    const comLabelW =
      doc.getStringUnitWidth(comLabel) *
      bulletFontSize /
      doc.internal.scaleFactor;

    doc.setTextColor(...COLORS.blue);

    y = drawWrappedValue(
      doc,
      reserva.comentarios,
      textIndent + comLabelW,
      y,
      contentWidth - (textIndent - margin) - comLabelW,
      bulletLineH
    );

    y += bulletLineH;
  }

  y += 6;

  // ===================================================
  // REGRESO
  // ===================================================

  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(0.5);

  doc.line(margin, y, rightX, y);

  y += 10;

  drawEmoji(
    doc,
    'checkmark',
    margin + 1,
    y
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.black);

  doc.text(
    t.returnSection,
    textIndent,
    y
  );

  y += 9;

  const isRoundTrip =
    reserva.tipoViaje === 'redondo' &&
    reserva.fechaRegreso;

  const returnItems = [
    {
      emoji: 'location',
      label: t.returnPickup,
      value: isRoundTrip
        ? (reserva.destino || 'N/A')
        : '',
    },
    {
      emoji: 'calendar',
      label: t.returnDateTime,
      value: isRoundTrip
        ? `${reserva.fechaRegreso} / ${reserva.horaRegreso || 'N/A'} hrs`
        : '',
    },
  ];

  doc.setFontSize(bulletFontSize);

  returnItems.forEach((item) => {
    drawEmoji(
      doc,
      item.emoji,
      margin + 1,
      y
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);

    const labelStr = `${item.label}: `;

    doc.text(labelStr, textIndent, y);

    const lw =
      doc.getStringUnitWidth(labelStr) *
      bulletFontSize /
      doc.internal.scaleFactor;

    doc.setTextColor(...COLORS.blue);
    doc.setFont('helvetica', 'bold');

    const maxW =
      contentWidth -
      (textIndent - margin) -
      lw;

    y = drawWrappedValue(
      doc,
      item.value,
      textIndent + lw,
      y,
      maxW,
      bulletLineH
    );

    y += bulletLineH;
  });

  // ===================================================
  // OBSERVACIONES (SIEMPRE VISIBLE)
  // ===================================================

  const observaciones = String(reserva.observaciones || '').trim();
  const footerY = ph - 23;
  const boxX = margin;
  const boxY = y + 3;
  const boxW = contentWidth;
  const boxPadding = 4;
  const obsFontSize = 9;
  const obsLineHeight = 4.2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(obsFontSize);

  const obsLines = observaciones
    ? doc.splitTextToSize(observaciones, boxW - boxPadding * 2)
    : [];

  const availableHeight = Math.max(12, footerY - boxY - 5);
  const desiredHeight = 14 + Math.max(1, obsLines.length) * obsLineHeight;
  const boxH = Math.min(desiredHeight, availableHeight);

  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(0.35);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);
  doc.text('Observaciones', boxX + boxPadding, boxY + 6);

  if (obsLines.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(obsFontSize);

    const maxLines = Math.max(1, Math.floor((boxH - 15) / obsLineHeight));
    let visibleLines = obsLines.slice(0, maxLines);

    if (obsLines.length > maxLines && visibleLines.length) {
      const lastIndex = visibleLines.length - 1;
      visibleLines[lastIndex] = `${visibleLines[lastIndex].slice(0, 85)}...`;
    }

    doc.text(visibleLines, boxX + boxPadding, boxY + 12);
  }

  // Línea divisoria debajo del recuadro.
  const obsBottomY = boxY + boxH + 3;

  doc.setDrawColor(...COLORS.black);
  doc.setLineWidth(0.35);
  doc.line(margin, obsBottomY, rightX, obsBottomY);

  // ===================================================
  // PIE DE PAGINA
  // ===================================================

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);

  doc.line(margin, footerY, rightX, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.footerGray);
  doc.setFontSize(8);

  doc.text(
    'San Miguel de Allende, Gto.',
    pw / 2,
    footerY + 5,
    { align: 'center' }
  );

  const fechaHora = new Date().toLocaleString(
    lang === 'en' ? 'en-US' : 'es-MX',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
  );

  doc.text(
    `${t.generated} ${fechaHora}`,
    pw / 2,
    footerY + 9,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');

  doc.text(
    'Grupo Turístico MX S. de R.L. de C.V.',
    pw / 2,
    footerY + 13,
    { align: 'center' }
  );

  return doc;
}
