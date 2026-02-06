import jsPDF from 'jspdf';

/**
 * Genera una hoja de servicio PDF profesional
 */
export function generarHojaServicio(reserva) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Helper
  const centeredText = (text, y, size = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Header
  doc.setFillColor(0, 50, 100);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  centeredText('TRANSPORTES MX', 18, 22);
  doc.setFont('helvetica', 'normal');
  centeredText('HOJA DE SERVICIO', 30, 12);

  // Número de reserva
  doc.setFillColor(230, 240, 255);
  doc.rect(0, 42, pageWidth, 12, 'F');
  doc.setTextColor(0, 50, 100);
  doc.setFont('helvetica', 'bold');
  centeredText(`Reserva #${reserva.id || 'N/A'}`, 50, 14);

  // Contenido
  doc.setTextColor(40, 40, 40);
  let y = 68;

  const addSection = (title) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 50, 100);
    doc.text(title, 15, y);
    y += 2;
    doc.setDrawColor(0, 50, 100);
    doc.line(15, y, pageWidth - 15, y);
    y += 7;
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
  };

  const addRow = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || 'N/A'), 75, y);
    y += 7;
  };

  // Datos del cliente
  addSection('DATOS DEL CLIENTE');
  addRow('Nombre', reserva.clienteNombre);
  addRow('Email', reserva.clienteEmail);
  addRow('Teléfono', reserva.clienteTelefono);
  y += 5;

  // Datos del servicio
  addSection('DATOS DEL SERVICIO');
  addRow('Origen', reserva.origen);
  addRow('Destino', reserva.destino);
  addRow('Fecha ida', reserva.fechaIda);
  addRow('Hora ida', reserva.horaIda);
  addRow('Tipo de viaje', reserva.tipoViaje === 'redondo' ? 'Ida y vuelta' : 'Sencillo');
  if (reserva.tipoViaje === 'redondo') {
    addRow('Fecha regreso', reserva.fechaRegreso);
    addRow('Hora regreso', reserva.horaRegreso);
  }
  addRow('Distancia', reserva.distancia);
  addRow('Duración est.', reserva.duracion);
  y += 5;

  // Vehículo
  addSection('VEHÍCULO');
  addRow('Vehículo', reserva.vehiculoNombre);
  addRow('Pasajeros', reserva.numPasajeros);
  y += 5;

  // Pago
  addSection('PAGO');
  addRow('Método', reserva.metodoPago);
  addRow('Estado', reserva.estadoPago === 'pagado' ? 'PAGADO ✓' : 'Pendiente');
  addRow('Total', `$${Number(reserva.precioTotal).toLocaleString('es-MX')} MXN`);

  // Footer
  const footerY = 270;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY, pageWidth - 15, footerY);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  centeredText('TransportesMX | www.transportesmx.org | +52 415 139 3219', footerY + 7, 8);
  centeredText(`Documento generado el ${new Date().toLocaleDateString('es-MX')}`, footerY + 12, 7);

  return doc;
}
