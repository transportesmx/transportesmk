
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

/**
 * =========================================================
 * BANNER DE PASAJEROS - TRANSPORTES MX
 * =========================================================
 * Formato: Media carta horizontal
 * Medidas: 215.9 x 139.7 mm
 *
 * Diseño:
 * - Fondo blanco
 * - Logo centrado en la parte superior
 * - Nombre en negro, negrita e inclinada
 * - Tamaño del nombre autoajustable
 * - Aprovecha prácticamente todo el ancho de la hoja
 * - No deforma ni corta el nombre
 *
 * Este generador puede utilizarse desde Stripe/Resend
 * sin modificar el sistema manual/Brevo.
 * =========================================================
 */

export async function generarBannerCliente(reservaData = {}) {
  try {
    // -----------------------------------------------------
    // 1. OBTENER Y PREPARAR NOMBRE DEL CLIENTE
    // -----------------------------------------------------

    const nombre =
      reservaData.clienteNombre ||
      reservaData.nombre ||
      reservaData.nombreCliente ||
      reservaData.pasajero ||
      'CLIENTE';

    const nombreFinal = String(nombre)
      .trim()
      .toUpperCase() || 'CLIENTE';

    // -----------------------------------------------------
    // 2. CREAR DOCUMENTO PDF HORIZONTAL
    // -----------------------------------------------------

    const pageW = 215.9;
    const pageH = 139.7;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [pageW, pageH],
      compress: true,
    });

    // -----------------------------------------------------
    // 3. FONDO BLANCO
    // -----------------------------------------------------

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, 'F');

    // -----------------------------------------------------
    // 4. CONFIGURACIÓN DEL LOGO
    // -----------------------------------------------------

    const logoPath = path.join(
      process.cwd(),
      'public',
      'logo.jpg'
    );

    const margin = 8;

    const logoMaxW = 110;
    const logoMaxH = 62;

    let logoW = 0;
    let logoH = 0;
    let logoX = 0;
    let logoY = 8;

    let logoDisponible = false;

    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');

        const logoData =
          `data:image/jpeg;base64,${logoBase64}`;

        const imgProps = pdf.getImageProperties(logoData);
        const ratio = imgProps.width / imgProps.height;

        // Ajustar logo sin deformarlo
        logoW = logoMaxW;
        logoH = logoW / ratio;

        if (logoH > logoMaxH) {
          logoH = logoMaxH;
          logoW = logoH * ratio;
        }

        logoX = (pageW - logoW) / 2;

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

        logoDisponible = true;
      } else {
        console.warn(
          '[Banner] No se encontró public/logo.jpg'
        );
      }
    } catch (logoError) {
      console.warn(
        '[Banner] Error cargando logo:',
        logoError.message
      );
    }

    // -----------------------------------------------------
    // 5. ÁREA DISPONIBLE PARA EL NOMBRE
    // -----------------------------------------------------

    const margenLateral = 8;

    const anchoDisponible =
      pageW - margenLateral * 2;

    // Posición vertical debajo del logo
    const separacionLogoTexto = 7;

    const inicioTextoY = logoDisponible
      ? logoY + logoH + separacionLogoTexto
      : 25;

    const margenInferior = 8;

    const altoDisponible =
      pageH - inicioTextoY - margenInferior;

    // -----------------------------------------------------
    // 6. CONFIGURAR TIPOGRAFÍA
    // -----------------------------------------------------

    pdf.setFont('helvetica', 'bolditalic');
    pdf.setTextColor(0, 0, 0);

    // Tamaño mínimo para nombres muy largos
    const fontMin = 12;

    // Tamaño máximo inicial de búsqueda
    const fontMax = 200;

    // -----------------------------------------------------
    // 7. BÚSQUEDA AUTOMÁTICA DEL TAMAÑO ÓPTIMO
    // -----------------------------------------------------
    // Busca el tamaño de letra más grande que pueda ocupar
    // el ancho disponible sin salirse de los límites.
    // -----------------------------------------------------

    let low = fontMin;
    let high = fontMax;
    let mejorFontSize = fontMin;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      pdf.setFontSize(mid);

      const anchoTexto = pdf.getTextWidth(nombreFinal);

      // Altura estimada de la línea
      const altoTexto = mid / pdf.internal.scaleFactor;

      const cabeHorizontalmente =
        anchoTexto <= anchoDisponible;

      const cabeVerticalmente =
        altoTexto <= altoDisponible;

      if (cabeHorizontalmente && cabeVerticalmente) {
        mejorFontSize = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // -----------------------------------------------------
    // 8. APLICAR TAMAÑO FINAL
    // -----------------------------------------------------

    pdf.setFontSize(mejorFontSize);

    const anchoFinal =
      pdf.getTextWidth(nombreFinal);

    // -----------------------------------------------------
    // 9. CENTRAR EL NOMBRE
    // -----------------------------------------------------

    // Centrado horizontal
    const centerX = pageW / 2;

    // Centrado vertical dentro del espacio restante
    const nameY =
      inicioTextoY + altoDisponible / 2;

    pdf.text(
      nombreFinal,
      centerX,
      nameY,
      {
        align: 'center',
        baseline: 'middle',
      }
    );

    // -----------------------------------------------------
    // 10. REGISTRO DE DIAGNÓSTICO
    // -----------------------------------------------------

    console.log('[Banner] Generado correctamente:', {
      nombre: nombreFinal,
      fontSize: mejorFontSize,
      anchoDisponible,
      anchoFinal,
      altoDisponible,
      logo: logoDisponible,
    });

    // -----------------------------------------------------
    // 11. DEVOLVER DOCUMENTO PDF
    // -----------------------------------------------------

    return pdf;

  } catch (error) {
    console.error(
      '[Banner] Error generando PDF de pasajeros:',
      error
    );

    throw error;
  }
}
