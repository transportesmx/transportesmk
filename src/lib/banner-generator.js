
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

/**
 * Generador SERVER-SIDE del Banner de Pasajeros
 * Transportes MX
 *
 * Compatible con Stripe / API routes de Next.js.
 * No utiliza window, document, canvas ni ventanas emergentes.
 *
 * Retorna un documento jsPDF para que el proceso de Stripe
 * pueda convertirlo en Buffer y adjuntarlo al correo.
 */

export async function generarBannerCliente(reservaData = {}) {
  try {
    // -----------------------------------------
    // 1. OBTENER NOMBRE DEL CLIENTE
    // -----------------------------------------
    const nombre =
      reservaData.clienteNombre ||
      reservaData.nombre ||
      reservaData.nombreCliente ||
      reservaData.pasajero ||
      'CLIENTE';

    const nombreFinal = String(nombre).trim().toUpperCase() || 'CLIENTE';

    // -----------------------------------------
    // 2. CONFIGURACIÓN DEL PDF
    // -----------------------------------------
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [215.9, 139.7], // Media carta horizontal
      compress: true,
    });

    const pageW = 215.9;
    const pageH = 139.7;
    const margin = 8;

    // -----------------------------------------
    // 3. FONDO BLANCO
    // -----------------------------------------
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, 'F');

    // -----------------------------------------
    // 4. CARGAR LOGOTIPO
    // -----------------------------------------
    const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');

    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      const logoData = `data:image/jpeg;base64,${logoBase64}`;

      const imgProps = pdf.getImageProperties(logoData);

      const logoMaxW = 110;
      const logoMaxH = 62;

      const ratio = imgProps.width / imgProps.height;

      let logoW = logoMaxW;
      let logoH = logoW / ratio;

      if (logoH > logoMaxH) {
        logoH = logoMaxH;
        logoW = logoH * ratio;
      }

      const logoX = (pageW - logoW) / 2;
      const logoY = 8;

      pdf.addImage(
        logoData,
        'JPEG',
        logoX,
        logoY,
        logoW,
        logoH,
        undefined,
        'FAST'
      );

      // -----------------------------------------
      // 5. NOMBRE DEL CLIENTE
      // -----------------------------------------
      const availableW = pageW - margin * 2;
      const textY = logoY + logoH + 7;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bolditalic');
      pdf.setFontSize(35);

      // Reducir tamaño si el nombre es demasiado largo
      let fontSize = 35;

      while (
        pdf.getTextWidth(nombreFinal) > availableW &&
        fontSize > 12
      ) {
        fontSize -= 1;
        pdf.setFontSize(fontSize);
      }

      // Centrado horizontal
      pdf.text(nombreFinal, pageW / 2, textY, {
        align: 'center',
        maxWidth: availableW,
      });
    } else {
      // -----------------------------------------
      // LOGO NO ENCONTRADO:
      // GENERAR BANNER CON TEXTO
      // -----------------------------------------
      console.warn(
        '[Banner] No se encontró public/logo.jpg. Se generará el banner solo con texto.'
      );

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bolditalic');
      pdf.setFontSize(32);

      let fontSize = 32;
      const availableW = pageW - margin * 2;

      while (
        pdf.getTextWidth(nombreFinal) > availableW &&
        fontSize > 12
      ) {
        fontSize -= 1;
        pdf.setFontSize(fontSize);
      }

      pdf.text(nombreFinal, pageW / 2, pageH / 2, {
        align: 'center',
        maxWidth: availableW,
      });
    }

    // -----------------------------------------
    // 6. DEVOLVER DOCUMENTO PDF
    // -----------------------------------------
    return pdf;

  } catch (error) {
    console.error('[Banner] Error generando PDF de pasajeros:', error);
    throw error;
  }
}
