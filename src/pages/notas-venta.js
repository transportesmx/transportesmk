import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "@/Context/AppContext";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { autocompleteOptions } from "@/lib/google-maps";
import { supabase } from "@/lib/supabase";

const ADMIN1 = "amstrekgrt@gmail.com";
const ADMIN2 = "and-i89@hotmail.com";
const ZONA = "America/Mexico_City";
const GOOGLE_MAPS_LIBRARIES = ["places"];

const INICIAL = {
  cliente: "",
  telefono: "",
  email: "",
  email2: "",
  origenPlaceId: "",
  origenLat: "",
  origenLng: "",
  destinoPlaceId: "",
  destinoLat: "",
  destinoLng: "",
  servicio: "",
  fecha: "",
  hora: "",
  origen: "",
  destino: "",
  unidad: "",
  imagenUnidad: "/sprinter.png",
  pasajeros: "",
  importe: "",
  observaciones: "",
  aerolinea: "",
  maletas: "",
  idaVuelta: "",
  duracion: "",
  regresoFecha: "",
  regresoHora: "",
};

const CAMPOS = [
  ["imagenUnidad", "🖼️ Seleccionar imagen del vehículo", "select"],
  ["unidad", "✏️ Nombre del vehículo (manual)", "text"],
  ["cliente", "👤 Nombre del cliente", "text"],
  ["fecha", "📅 Fecha del servicio", "date"],
  ["hora", "🕒 Hora del servicio", "time"],
  ["origen", "📍 Recoger en", "text"],
  ["aerolinea", "✈️ Aerolínea", "text"],
  ["pasajeros", "👥 Número de pasajeros", "number"],
  ["maletas", "🧳 Número de maletas", "number"],
  ["telefono", "☎️ Número de teléfono", "tel"],
  ["destino", "📍 Destino", "text"],
  ["idaVuelta", "🔄 Tipo de viaje", "viaje"],
  ["duracion", "⏱️ Duración", "text"],
  ["regresoFecha", "↩️ Fecha de regreso", "date"],
  ["regresoHora", "🕒 Hora de regreso", "time"],
  ["email", "✉️ Correo electrónico principal", "email"],
  ["email2", "✉️ Correo electrónico adicional (opcional)", "email"],
];

// Rutas de imágenes que existen actualmente en la carpeta /public del repositorio.
// Las imágenes de vehículos apuntan a sus archivos correspondientes dentro de /public.
const VEHICULOS = [
  { nombre: "Mercedes-Benz Sprinter", imagen: "/sprinter.png" },
  { nombre: "Honda Odyssey", imagen: "/odyssey.png" },
  { nombre: "Volkswagen Jetta / Sedán", imagen: "/sedan.png" },
  { nombre: "Chevrolet Suburban", imagen: "/suburban.png" },
  { nombre: "Toyota Hiace", imagen: "/hiace.png" },
];

const IMAGENES_VEHICULOS = {
  "/sprinter.png": "/sprinter.png",
  "/odyssey.png": "/odyssey.png",
  "/odissey.png": "/odyssey.png", // compatibilidad con el nombre mal escrito antiguo
  "/sedan.png": "/sedan.png",
  "/suburban.png": "/suburban.png",
  "/hiace.png": "/hiace.png",
};

function imagenVehiculo(imagenUnidad, nombreManual = "") {
  const imagenOriginal = String(imagenUnidad || "").trim();
  const imagen = imagenOriginal.toLowerCase().replace(/^\/public(?=\/)/, "");

  // Acepta rutas guardadas anteriormente, incluyendo /public/... y variantes de Odyssey.
  if (IMAGENES_VEHICULOS[imagen]) {
    return IMAGENES_VEHICULOS[imagen];
  }

  const nombre = String(nombreManual || imagenOriginal || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (nombre.includes("odyssey") || nombre.includes("odissey") || nombre.includes("minivan")) {
    return "/odyssey.png";
  }
  if (nombre.includes("jetta") || nombre.includes("sedan") || nombre.includes("sedán")) {
    return "/sedan.png";
  }
  if (nombre.includes("suburban")) {
    return "/suburban.png";
  }
  if (nombre.includes("hiace")) {
    return "/hiace.png";
  }
  if (nombre.includes("sprinter") || nombre.includes("mercedes")) {
    return "/sprinter.png";
  }

  // Valor inesperado (por ejemplo un código como QWW): usar imagen válida de respaldo.
  return "/sprinter.png";
}

function formatoFecha(valor, locale = "es-MX") {
  if (!valor) return "";

  const fecha = new Date(String(valor).trim() + "T12:00:00");

  if (Number.isNaN(fecha.getTime())) return valor;

  const texto = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  }).format(fecha);

  return texto.replace(/\b([a-záéíóúñ])/i, (letra) =>
    letra.toLocaleUpperCase(locale)
  );
}

function formatoHora(valor, locale = "es-MX") {
  if (!valor) return "";

  const [hora, minuto] = valor.split(":").map(Number);

  if (!Number.isFinite(hora) || !Number.isFinite(minuto)) {
    return valor;
  }

  const periodo = locale === "en-US" ? (hora >= 12 ? "PM" : "AM") : (hora >= 12 ? "P.M." : "A.M.");
  return `${hora % 12 || 12}:${String(minuto).padStart(2, "0")} ${periodo}`;
}

function moneda(valor) {
  if (valor === "" || valor === null || valor === undefined) {
    return "";
  }

  const texto = String(valor).trim();

  if (!texto) return "";

  const numero = Number(texto);

  if (!Number.isFinite(numero)) return texto;

  return `$${numero.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>\"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#39;",
  })[caracter]);
}

function fechaHoraActual(locale = "es-MX") {
  const ahora = new Date();

  const partesFecha = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  }).formatToParts(ahora);

  const dia =
    partesFecha.find((parte) => parte.type === "day")?.value || "";

  const mesCrudo =
    partesFecha.find((parte) => parte.type === "month")?.value || "";

  const mes = mesCrudo
    ? mesCrudo.charAt(0).toLocaleUpperCase(locale) +
      mesCrudo.slice(1)
    : "";

  const anio =
    partesFecha.find((parte) => parte.type === "year")?.value || "";

  const partesHora = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: ZONA,
  }).formatToParts(ahora);

  const hora =
    partesHora.find((parte) => parte.type === "hour")?.value || "";

  const minuto =
    partesHora.find((parte) => parte.type === "minute")?.value || "";

  const periodo = (
    partesHora.find((parte) => parte.type === "dayPeriod")?.value || "AM"
  ).toUpperCase();

  return {
    fecha: locale === "en-US" ? `${mes} ${dia}, ${anio}` : `${dia} de ${mes} de ${anio}`,
    hora: locale === "en-US" ? `${hora}:${minuto} ${periodo}` : `${hora}:${minuto} ${periodo === "PM" ? "P.M." : "A.M."}`,
  };
}

function valorFechaHora(datos, locale = "es-MX") {
  return [formatoFecha(datos.fecha, locale), formatoHora(datos.hora, locale)]
    .filter(Boolean)
    .join(" · ");
}

function valorRegreso(datos, locale = "es-MX") {
  return [
    formatoFecha(datos.regresoFecha, locale),
    formatoHora(datos.regresoHora, locale),
  ]
    .filter(Boolean)
    .join(" · ");
}

function htmlFila(etiqueta, valor, clase = "") {
  return `<div class="dato ${clase}">
    <span class="icono">${escapar(etiqueta.split(" ")[0])}</span>
    <strong class="etiqueta">${escapar(etiqueta.replace(/^\S+\s*/, ""))}</strong>
    <span class="valor">${escapar(valor || "")}</span>
  </div>`;
}

// Marco oculto para generar adjuntos PDF sin abrir pestañas ni ventanas.
function crearMarcoPdfOculto() {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.position = "fixed";
  iframe.style.left = "-12000px";
  iframe.style.top = "0";
  iframe.style.width = "816px";
  iframe.style.height = "1056px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const ventana = iframe.contentWindow;
  if (!ventana) {
    iframe.remove();
    throw new Error("No se pudo preparar el área interna para generar el PDF.");
  }

  return {
    ventana,
    limpiar: () => {
      try { iframe.remove(); } catch (_) {}
    },
  };
}

function abrirImpresion(datos, folio, devolverVentana = false, lang = "es", ventanaExistente = null) {
  const en = lang === "en";
  const tx = (es, ingles) => (en ? ingles : es);
  const ventana = ventanaExistente;

  if (!ventana) return false;

  const locale = en ? "en-US" : "es-MX";
  const generado = fechaHoraActual(locale);
  const folioTexto = folio || tx("Pendiente de guardar", "Pending save");
  const origen = window.location.origin;

  const filas = [
    ["🚐 " + tx("Vehículo:", "Vehicle:"), datos.unidad],
    ["👤 " + tx("Nombre del cliente:", "Customer name:"), datos.cliente],
    ["📅 " + tx("Fecha y hora:", "Date and time:"), valorFechaHora(datos, locale)],
    ["📍 " + tx("Recoger en:", "Pickup:"), datos.origen],
    ["✈️ " + tx("Aerolínea:", "Airline:"), datos.aerolinea || "N/A"],
    ["👥 " + tx("Número de pasajeros:", "Number of passengers:"), datos.pasajeros],
    ["🧳 " + tx("Número de maletas:", "Number of bags:"), datos.maletas],
    ["☎️ " + tx("Número de teléfono:", "Phone number:"), datos.telefono],
    ["📍 " + tx("Destino:", "Destination:"), datos.destino],
    ["🔄 " + tx("Tipo de viaje:", "Trip type:"), datos.idaVuelta === "redondo" ? tx("Ida y vuelta", "Round trip") : datos.idaVuelta === "sencillo" ? tx("Sencillo", "One way") : ""],
    ["⏱️ " + tx("Duración:", "Duration:"), datos.duracion],
  ]
    .map(([etiqueta, valor]) => htmlFila(etiqueta, valor))
    .join("");

  const regreso = [
    formatoFecha(datos.regresoFecha, locale),
    formatoHora(datos.regresoHora, locale),
  ]
    .filter(Boolean)
    .join(" · ");

  const importeTexto = String(datos.importe ?? "").trim();
  const importeNumero = Number(importeTexto);

  const total = !importeTexto
    ? ""
    : Number.isFinite(importeNumero)
      ? `$${importeNumero.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MXN`
      : importeTexto;

  const imagenSeleccionada = imagenVehiculo(datos.imagenUnidad, datos.unidad);

  ventana.document.open();

  ventana.document.write(`<!doctype html>
<html lang="${en ? "en" : "es"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title></title>

<style>
*{box-sizing:border-box}

@page{size:Letter portrait;margin:0}

html,body{
  margin:0;
  padding:0;
  background:#fff;
  color:#050505;
  font-family:Arial,Helvetica,sans-serif;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact
}

body{
  font-size:13pt;
  line-height:1.25
}

.hoja{
  /* Tamaño exacto Carta: las medidas incluyen el padding (box-sizing). */
  box-sizing:border-box;
  width:215.9mm;
  max-width:215.9mm;
  height:279.4mm;
  min-height:279.4mm;
  margin:0 auto;
  padding:10mm 12mm;
  display:flex;
  flex-direction:column;
  overflow:hidden
}

.encabezado{
  display:grid;
  grid-template-columns:minmax(0,1fr) 48mm;
  gap:5mm;
  align-items:start
}

.marca{
  display:block;
  min-width:0
}

.logo{
  display:block;
  box-sizing:border-box;
  width:60mm;
  max-width:60mm;
  height:auto;
  max-height:28.5mm;
  object-fit:contain;
  object-position:left center;
  margin:0 0 1.5mm 0
}

.empresa{
  font-size:11pt;
  line-height:1.42;
  font-weight:800;
  overflow-wrap:anywhere;
  padding-top:1mm
}

.empresa strong{
  display:block;
  font-size:12pt;
  margin-bottom:1mm;
  font-weight:900
}

.empresa .normal{
  font-weight:400
}

.empresa a{
  display:inline;
  color:#06c;
  text-decoration:underline;
  overflow-wrap:anywhere
}

.empresa a:visited{
  color:#06c
}

.folioCol{
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:2mm
}

.folio{
  background:#f00000;
  color:#fff;
  font-size:14pt;
  font-weight:900;
  padding:3mm 3.5mm;
  min-height:11mm;
  overflow-wrap:anywhere
}

.imagenVehiculo{
  display:block;
  box-sizing:border-box;
  width:48mm;
  max-width:48mm;
  height:auto;
  max-height:40mm;
  margin-top:10mm;
  object-fit:contain;
  object-position:center
}

.separador{
  display:block!important;
  width:100%;
  height:0!important;
  border:0;
  border-top:1.5mm solid #000!important;
  background:transparent!important;
  margin:3mm 0 3mm;
  flex:none;
  visibility:visible!important;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact
}

.cliente{
  margin-top:1mm;
  display:grid;
  grid-template-columns:1fr;
  gap:0.7mm;
  padding:0 0 3mm
}

.clienteItem{
  font-size:13pt;
  overflow-wrap:anywhere;
  min-height:5mm
}

.clienteItem strong{
  font-weight:900
}

.total{
  display:flex;
  align-items:center;
  gap:2mm;
  margin:1mm 0 4mm;
  background:#00b050;
  color:#fff;
  width:max-content;
  max-width:100%;
  min-height:9mm;
  padding:2mm 3mm;
  font-size:14pt;
  font-weight:900;
  overflow-wrap:anywhere
}

.barra{
  background:#050505!important;
  color:#fff!important;
  padding:2mm 3mm;
  font-size:13pt;
  font-weight:900;
  margin:0 0 1.5mm;
  min-height:8mm;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact
}

.antesBarra{
  height:3mm;
  flex:none
}

.datos{
  display:flex;
  flex-direction:column;
  gap:0.7mm;
  margin-top:9mm
}

.dato{
  display:flex;
  align-items:flex-start;
  gap:2mm;
  min-height:5.3mm;
  margin:0;
  padding:0;
  break-inside:avoid;
  page-break-inside:avoid;
  font-size:13pt;
  line-height:1.18;
  overflow-wrap:anywhere
}

.icono{
  width:6mm;
  flex:none;
  font-size:13pt
}

.etiqueta{
  font-weight:900;
  flex:none
}

.valor{
  min-width:0;
  white-space:pre-wrap;
  overflow-wrap:anywhere
}

.regreso{
  display:flex;
  align-items:flex-start;
  gap:2mm;
  margin-top:15mm;
  min-height:9mm;
  font-size:13pt;
  break-inside:avoid
}.observaciones{
  border:0.5mm solid #111;
  border-radius:8mm;
  min-height:19mm;
  margin-top:auto;
  margin-bottom:4mm;
  padding:3mm 5mm;
  font-size:12pt;
  line-height:1.35;
  overflow-wrap:anywhere;
  break-inside:avoid
}

.observaciones strong{
  display:block;
  font-weight:900;
  margin-bottom:1.5mm
}

.pie{
  border-top:1mm solid #111;
  margin-top:0;
  padding-top:3mm;
  text-align:center;
  font-size:10pt;
  line-height:1.4;
  color:#555;
  overflow-wrap:anywhere
}

.pie a{
  color:#555;
  text-decoration:none
}

.acciones{
  display:flex;
  justify-content:center;
  gap:3mm;
  margin:7mm 0 2mm
}

 .hoja.modoPdf .acciones{
  display:none!important;
  height:0!important;
  margin:0!important;
  padding:0!important;
}

button{
  font-size:13pt;
  padding:3mm 5mm;
  border:1px solid #777;
  border-radius:2mm;
  background:#f4f4f4;
  cursor:pointer
}

@media print{
  .acciones{
    display:none!important
  }

  .hoja{
    box-sizing:border-box;
    width:215.9mm;
    max-width:215.9mm;
    min-height:279.4mm;
    height:279.4mm;
    margin:0;
    padding:10mm 12mm;
    overflow:hidden
  }

  .separador{
    display:block!important;
    height:0!important;
    border-top:1.5mm solid #000!important;
    background:transparent!important;
    visibility:visible!important;
    break-inside:avoid;
    page-break-inside:avoid
  }

  .barra{
    background:#000!important;
    color:#fff!important;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact
  }

  .dato,.regreso,.total,.observaciones{
    break-inside:avoid;
    page-break-inside:avoid
  }

  a{
    color:#06c;
    text-decoration:underline
  }
}
</style>
</head>

<body>
<main class="hoja">

<header class="encabezado">

  <div class="marca">

<img
  class="logo"
  src="${origen}/logo.jpg"
  alt="Transportes MX"
>

<div class="empresa">
  <strong>Grupo Turístico MX S. de R.L. de C.V.</strong>
  <span>RFC: GTM2604271F2</span><br>
  <span>San Miguel de Allende Guanajuato</span><br>
  <span>+52 415 139 3219</span><br>

  <a
    class="normal contacto-link"
    href="mailto:contacto@transportesmx.org"
  >contacto@transportesmx.org</a><br>

  <a
    class="normal web-link"
    href="https://transportesmx.org"
  >https://transportesmx.org</a>
</div>
  </div>

  <div class="folioCol">

<div class="folio">
  F- ${escapar(folioTexto)}
</div>

<img
  class="imagenVehiculo"
  src="${origen}${imagenSeleccionada}"
  alt="Vehículo ${escapar(datos.unidad || "seleccionado")}"
  onerror="this.onerror=null;this.src='${origen}/sprinter.png';"
>
  </div>

</header>

<div class="separador"></div>

<section class="cliente">

  <div class="clienteItem">
    <strong>${tx("Cliente:", "Customer:")}</strong> ${escapar(datos.cliente || "")}
  </div>

  <div class="clienteItem">
    <strong>${tx("Teléfono:", "Phone:")}</strong> ${escapar(datos.telefono || "")}
  </div>

  <div class="clienteItem">
    <strong>${tx("Correo:", "Email:")}</strong> ${escapar(datos.email || "")}
  </div>

</section>

<div class="total">
  ${tx("Total:", "Total:")} ${escapar(total)}
</div>

<div class="antesBarra" aria-hidden="true"></div>

<div class="barra">
  ${tx("Descripción del traslado:", "Transfer details:")}
</div>

<section class="datos">
  ${filas}
</section>

<div class="regreso">
  <span class="icono">↩️</span>
  <strong>${tx("Regreso:", "Return:")}</strong>
  <span class="valor">${escapar(regreso)}</span>
</div>

<div class="observaciones">
  <strong>${tx("Observaciones:", "Notes:")}</strong>
  <span>${escapar(datos.observaciones || "")}</span>
</div>

<footer class="pie">
  ${tx("San Miguel de Allende, Guanajuato · Documento Generado:", "San Miguel de Allende, Guanajuato · Document generated:")}
  ${escapar(generado.fecha)} · ${tx("Hora:", "Time:")} ${escapar(generado.hora)}
  <br>
  Grupo Turístico MX S. de R.L. de C.V.
</footer>

<div class="acciones">
  <button onclick="window.print()">
    ${tx("Imprimir / Guardar PDF", "Print / Save PDF")}
  </button>

  <button onclick="window.close()">
    ${tx("Cerrar", "Close")}
  </button>
</div>

</main>
</body>
</html>`);

  ventana.document.close();

  return devolverVentana ? ventana : true;
}


// Genera el PDF a partir del mismo HTML/CSS que utiliza la Nota de Venta al imprimir.
async function generarPdfNotaVentaBase64(datos, folio, lang = "es", ventanaExistente = null) {
  const marcoOculto = ventanaExistente ? null : crearMarcoPdfOculto();
  const ventanaTrabajo = ventanaExistente || marcoOculto.ventana;
  const ventanaPdf = abrirImpresion(datos, folio, true, lang, ventanaTrabajo);
  if (!ventanaPdf || ventanaPdf === true) {
    throw new Error("No se pudo abrir la ventana temporal para generar el PDF.");
  }

  try {
    const doc = ventanaPdf.document;

    // Cargar html2canvas y jsPDF directamente para construir UNA sola página Carta.
    const cargarScript = (src) => new Promise((resolve, reject) => {
      const script = doc.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`No se pudo cargar la librería PDF: ${src}`));
      doc.head.appendChild(script);
    });

    if (!ventanaPdf.html2canvas) {
      await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    }
    if (!ventanaPdf.jspdf?.jsPDF) {
      await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    }

    const hoja = doc.querySelector(".hoja") || doc.querySelector("main");
    if (!hoja) {
      throw new Error("No se encontró el contenido de la Nota de Venta.");
    }

    // Ocultar controles; solo se captura el contenido de la nota.
    hoja.classList.add("modoPdf");
    hoja.querySelectorAll(".acciones, button").forEach((elemento) => {
      elemento.style.setProperty("display", "none", "important");
    });

    // Fijar dimensiones Carta exactas. Esto evita que html2pdf divida el lienzo
    // en una segunda página por diferencias de redondeo de píxeles.
    hoja.style.setProperty("box-sizing", "border-box", "important");
    hoja.style.setProperty("width", "215.9mm", "important");
    hoja.style.setProperty("max-width", "215.9mm", "important");
    hoja.style.setProperty("height", "279.4mm", "important");
    hoja.style.setProperty("min-height", "279.4mm", "important");
    hoja.style.setProperty("margin", "0", "important");
    hoja.style.setProperty("position", "relative", "important");
    hoja.style.setProperty("left", "0", "important");
    hoja.style.setProperty("top", "0", "important");
    hoja.style.setProperty("overflow", "hidden", "important");

    // Esperar a que terminen de cargar el logo y la imagen del vehículo.
    await Promise.all(Array.from(doc.images || []).map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      if (typeof img.decode === "function") {
        try { await img.decode(); return; } catch (_) {}
      }
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    const html2canvas = ventanaPdf.html2canvas;
    const { jsPDF } = ventanaPdf.jspdf;

    const canvas = await html2canvas(hoja, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: hoja.scrollWidth,
      height: hoja.scrollHeight,
      windowWidth: Math.max(hoja.scrollWidth, 816),
      windowHeight: Math.max(hoja.scrollHeight, 1056),
      scrollX: 0,
      scrollY: 0
    });

    if (!canvas || !canvas.width || !canvas.height) {
      throw new Error("La captura de la Nota de Venta quedó vacía.");
    }

    // Crear el PDF con una sola página Letter y colocar toda la captura en ella.
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
      compress: true
    });

    const imagen = canvas.toDataURL("image/jpeg", 0.98);
    pdf.addImage(imagen, "JPEG", 0, 0, 215.9, 279.4, undefined, "FAST");

    const blob = pdf.output("blob");
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = () => reject(new Error("No se pudo convertir el PDF a base64."));
      reader.readAsDataURL(blob);
    });

    if (!base64) throw new Error("El PDF generado está vacío.");
    return base64;
  } finally {
    // Si se reutiliza la ventana about:blank principal, se mantiene abierta
    // para mostrar ahí mismo la barra de acciones y el PDF final.
    if (marcoOculto) marcoOculto.limpiar();
  }
}

// Genera el banner directamente con jsPDF para evitar capturas html2canvas
// que producen páginas vacías o una segunda hoja. Página media carta horizontal.
async function generarPdfBannerClienteBase64(nombreCliente, ventanaExistente = null) {
  const marcoOculto = ventanaExistente ? null : crearMarcoPdfOculto();
  const ventana = ventanaExistente || marcoOculto.ventana;

  try {
    const nombre = String(nombreCliente || "CLIENTE").trim() || "CLIENTE";
    const origen = window.location.origin;

    // Cargar jsPDF directamente (sin html2pdf ni html2canvas).
    await new Promise((resolve, reject) => {
      const script = ventana.document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("No se pudo cargar jsPDF para crear el banner."));
      ventana.document.head.appendChild(script);
    });

    const logoData = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No se pudo preparar el logotipo.");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.95));
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("No se pudo cargar /logo.jpg. Verifica que el logo exista en public."));
      img.src = `${origen}/logo.jpg`;
    });

    const { jsPDF } = ventana.jspdf;
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [215.9, 139.7], compress: true });
    const pageW = 215.9;
    const pageH = 139.7;
    const margin = 8;
    const logoMaxW = 110;
    const logoMaxH = 62;
    const text = nombre.toLocaleUpperCase("es-MX");

    // Centrar logo y conservar su relación de aspecto real.
    const imgProps = pdf.getImageProperties(logoData);
    const ratio = imgProps.width / imgProps.height;
    let logoW = logoMaxW;
    let logoH = logoW / ratio;
    if (logoH > logoMaxH) { logoH = logoMaxH; logoW = logoH * ratio; }
    const logoY = 8;
    pdf.addImage(logoData, "JPEG", (pageW - logoW) / 2, logoY, logoW, logoH, undefined, "FAST");

    // Crear el nombre en alta resolución y darle más altura sin ensancharlo.
    const availableW = pageW - margin * 2;
    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    if (!textCtx) throw new Error("No se pudo preparar el texto del banner.");
    textCanvas.width = 2400;
    textCanvas.height = 500;
    const fontPx = 260;
    textCtx.font = `italic 900 ${fontPx}px Arial, Helvetica, sans-serif`;
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    const measured = textCtx.measureText(text);
    const fitScale = Math.min(1, (textCanvas.width * 0.94) / measured.width);
    textCtx.save();
    textCtx.translate(textCanvas.width / 2, textCanvas.height / 2);
    // Escala vertical ligeramente mayor; no cambia el ancho del nombre.
    textCtx.scale(fitScale, 1.18);
    textCtx.fillStyle = "#000000";
    textCtx.font = `italic 900 ${fontPx}px Arial, Helvetica, sans-serif`;
    textCtx.fillText(text, 0, 0);
    textCtx.restore();
    const textData = textCanvas.toDataURL("image/png");
    const textW = availableW;
    const textH = 27;
    const x = margin;
    // Mantener exactamente 1 mm de separación entre el logotipo y el nombre.
    const y = logoY + logoH + 1;
    pdf.addImage(textData, "PNG", x, y, textW, textH, undefined, "FAST");

    // Exportar blob del PDF de una única página.
    const blob = pdf.output("blob");
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = () => reject(new Error("No se pudo convertir el banner a base64."));
      reader.readAsDataURL(blob);
    });
    if (!base64) throw new Error("El PDF del banner está vacío.");
    return base64;
  } finally {
    if (marcoOculto) marcoOculto.limpiar();
  }
}

export default function NotasVenta() {
  // Usa el mismo idioma global que seleccionan las banderas del Navbar.
  const { idioma, setIdioma } = useContext(AppContext);
  const en = idioma?.nombre === "EN";
  const tx = (es, ingles) => (en ? ingles : es);
  const [sesion, setSesion] = useState(null);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [datos, setDatos] = useState({ ...INICIAL });
  const [folio, setFolio] = useState("");
  const [notas, setNotas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarPreviewNota, setMostrarPreviewNota] = useState(true);
  // Carga Google Maps mediante el mismo loader y componente Autocomplete
  // que usa el flujo principal de reservaciones de Transportes MX.
  const { isLoaded: googleMapsLoaded, loadError: googleMapsLoadError } = useJsApiLoader({
    id: "script-loader",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: en ? "en" : "es",
    region: en ? "US" : "MX",
  });

  const origenAutocompleteRef = useRef(null);
  const destinoAutocompleteRef = useRef(null);

  const onOrigenLoad = (autocomplete) => {
    origenAutocompleteRef.current = autocomplete;
  };

  const onDestinoLoad = (autocomplete) => {
    destinoAutocompleteRef.current = autocomplete;
  };

  const onOrigenChanged = () => {
    const place = origenAutocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) {
      setMensaje(tx("Selecciona una dirección de las sugerencias de Google Maps para Recoger en.", "Select a Google Maps suggestion for the pickup location."));
      return;
    }
    const location = place.geometry.location;
    cambiar("origen", place.formatted_address || place.name || "");
    cambiar("origenPlaceId", place.place_id || "");
    cambiar("origenLat", String(location.lat()));
    cambiar("origenLng", String(location.lng()));
    setMensaje("");
  };

  const onDestinoChanged = () => {
    const place = destinoAutocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) {
      setMensaje(tx("Selecciona una dirección de las sugerencias de Google Maps para Destino.", "Select a Google Maps suggestion for the destination."));
      return;
    }
    const location = place.geometry.location;
    cambiar("destino", place.formatted_address || place.name || "");
    cambiar("destinoPlaceId", place.place_id || "");
    cambiar("destinoLat", String(location.lat()));
    cambiar("destinoLng", String(location.lng()));
    setMensaje("");
  };

  const emailUsuario = sesion?.user?.email?.toLowerCase();
  const admin1 = emailUsuario === ADMIN1;
  const autorizado = admin1 || emailUsuario === ADMIN2;

  useEffect(() => {
    if (!supabase) {
      setMensaje(tx("No está configurada la conexión con Supabase.", "Supabase connection is not configured."));
      setCargando(false);
      return undefined;
    }
let activo = true;

supabase.auth.getSession().then(({ data, error }) => {
  if (!activo) return;

  if (error) {
    setMensaje(tx("No se pudo comprobar la sesión.", "Could not verify the session."));
  }

  setSesion(data?.session ?? null);
  setCargando(false);
}).catch(() => {
  if (activo) {
    setMensaje(tx("No se pudo comprobar la sesión.", "Could not verify the session."));
    setCargando(false);
  }
});

const { data: listener } =
  supabase.auth.onAuthStateChange((_evento, nuevaSesion) =>
    setSesion(nuevaSesion)
  );

return () => {
  activo = false;
  listener.subscription.unsubscribe();
};
  }, []);

  useEffect(() => {
    if (sesion && autorizado) cargarNotas();
// cargarNotas se invoca al cambiar la sesión/permiso.
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion, autorizado]);

  async function cargarNotas() {
    if (!supabase) return;
const { data, error } = await supabase
  .from("notas_venta")
  .select("id, folio, datos, creado_en, actualizado_en")
  .order("creado_en", { ascending: false });

if (error) {
  setMensaje(
    "No se pudieron cargar las notas. Revisa los permisos de Supabase."
  );
  return;
}

setNotas(data || []);
  }

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setMensaje("");
if (!supabase) {
  setMensaje(tx("No está configurada la conexión con Supabase.", "Supabase connection is not configured."));
  return;
}

const { data, error } = await supabase.auth.signInWithPassword({
  email: correo.trim(),
  password: contrasena,
});

if (error) {
  setMensaje(
    "No se pudo iniciar sesión. Revisa el correo y la contraseña."
  );
  return;
}

setSesion(data.session);
setContrasena("");
  }

  async function cerrarSesion() {
    if (supabase) await supabase.auth.signOut();
setSesion(null);
setNotas([]);
nuevaNota();
  }

  function cambiar(campo, valor) {
    setDatos((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function nuevaNota() {
    setDatos({ ...INICIAL });
    setFolio("");
    setEditando(null);
    setMensaje("");
  }

  async function guardar(evento) {
    evento.preventDefault();
if (!supabase || !autorizado || guardando) return;

if (!datos.cliente.trim()) {
  setMensaje(tx("Captura el nombre del cliente antes de guardar.", "Enter the customer name before saving."));
  return;
}

setGuardando(true);
setMensaje("");

try {
  const payload = {
    ...datos,
    // Mantener vacío el importe si no se capturó.
    // El importe admite cantidades o texto como “Pagado”.
  };

  if (editando?.id) {
    const { error } = await supabase.rpc("editar_nota_venta", {
      p_id: editando.id,
      p_datos: payload,
    });

    if (error) throw error;

    setMensaje(tx(`La nota ${editando.folio} se actualizó correctamente.`, `Note ${editando.folio} was updated successfully.`));
    setDatos(payload);
    setFolio(editando.folio);

    await cargarNotas();
  } else {
    const { data, error } = await supabase.rpc(
      "crear_nota_venta",
      { p_datos: payload }
    );

    if (error) throw error;

    const nueva = Array.isArray(data) ? data[0] : data;

    if (!nueva?.folio || !nueva?.nota_id) {
      setMensaje(
        "Supabase no devolvió el folio o identificador. Revisa el historial antes de volver a guardar."
      );

      await cargarNotas();
      return;
    }

    setFolio(nueva.folio);

    // Crear evento en Google Calendar al guardar una nota nueva.
    // La nota ya quedó guardada en Supabase; si Calendar falla,
    // no se cancela ni se pierde la nota.
    try {
      if (payload.fecha && payload.hora) {
        // El menú desplegable envía valores explícitos y estables.
        const esRedondo = payload.idaVuelta === "redondo";

        const reservaCalendar = {
          clienteNombre: payload.cliente || "",
          clienteTelefono: payload.telefono || "",
          clienteEmail: payload.email || "",
          fechaIda: payload.fecha || "",
          horaIda: payload.hora || "",
          origen: payload.origen || "",
          destino: payload.destino || "",
          vehiculoNombre: payload.unidad || "",
          numPasajeros: payload.pasajeros || "",
          precioTotal: payload.importe || "",
          aerolinea: payload.aerolinea || "",
          tipoViaje: esRedondo ? "redondo" : "sencillo",
          fechaRegreso: payload.regresoFecha || "",
          horaRegreso: payload.regresoHora || "",
          observaciones: `Folio: ${nueva.folio}\\n${payload.observaciones || ""}`,
        };

        const respuestaCalendar = await fetch("/api/calendario-notas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nota: reservaCalendar }),
        });

        if (!respuestaCalendar.ok) {
          console.error(
            "La nota se guardó, pero Google Calendar respondió con error:",
            await respuestaCalendar.text()
          );
        } else {
          const resultadoCalendar = await respuestaCalendar.json();
          console.log(
            "Evento de nota de venta enviado a Google Calendar:",
            resultadoCalendar.eventId
          );
        }
      }
    } catch (errorCalendar) {
      console.error(
        "La nota se guardó correctamente, pero no se pudo conectar con Google Calendar:",
        errorCalendar
      );
    }

    // Enviar correo transaccional mediante Brevo.
    // Se invoca siempre para que el aviso administrativo llegue aunque el cliente
    // no haya proporcionado correo. Los correos del cliente son opcionales.
    // El endpoint adjunta el PDF y el archivo ICS; no se modifica esa función.
    let estadoCorreo = "pendiente";
    try {
      // Crear el PDF una sola vez y adjuntarlo al correo administrativo/cliente.
      const pdfNotaBase64 = await generarPdfNotaVentaBase64(
        {
          ...payload,
          email: String(payload.email || "").trim(),
          email2: String(payload.email2 || "").trim(),
          tipoViaje: payload.idaVuelta === "redondo" ? "redondo" : "sencillo",
        },
        nueva.folio,
        en ? "en" : "es"
      );

      // Generar el banner como PDF separado, con el mismo nombre de cliente.
      const pdfBannerBase64 = await generarPdfBannerClienteBase64(payload.cliente);

      const respuestaCorreo = await fetch("/api/notas-venta-correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nota: {
            ...payload,
            email: String(payload.email || "").trim(),
            email2: String(payload.email2 || "").trim(),
            folio: nueva.folio,
            tipoViaje: payload.idaVuelta === "redondo" ? "redondo" : "sencillo",
          },
          pdfNotaBase64,
          pdfBannerBase64,
        }),
      });

      const resultadoCorreo = await respuestaCorreo.json().catch(() => ({}));
      if (!respuestaCorreo.ok || !resultadoCorreo.success) {
        estadoCorreo = "error";
        console.error("La nota se guardó, pero falló el envío del correo:", resultadoCorreo);
      } else {
        estadoCorreo = "enviado";
        console.log("Correo transaccional procesado por Brevo:", resultadoCorreo.messageId || resultadoCorreo.sentTo);
      }
    } catch (errorCorreo) {
      estadoCorreo = "error";
      console.error("La nota se guardó, pero no se pudo enviar el correo:", errorCorreo);
    }

    setEditando({
      id: nueva.nota_id,
      folio: nueva.folio,
    });

    setDatos(payload);

    setMensaje(
      estadoCorreo === "enviado"
        ? `Nota guardada con folio ${nueva.folio}. Aviso administrativo procesado y correos del cliente enviados si fueron proporcionados.`
        : `Nota guardada con folio ${nueva.folio}, pero no se pudo confirmar el envío de correo. Revisa la configuración de Brevo.`
    );

    await cargarNotas();
  }
} catch (error) {
  setMensaje(
    tx(
      "No se pudo guardar la nota: " + (error?.message || "Error desconocido."),
      "Could not save the note: " + (error?.message || "Unknown error.")
    )
  );
} finally {
  setGuardando(false);
}
  }

  function editar(nota) {
    setEditando({
      id: nota.id,
      folio: nota.folio,
    });
setDatos({
  ...INICIAL,
  ...(nota.datos || {}),
});

setFolio(nota.folio);

setMensaje(tx(`Editando la nota ${nota.folio}.`, `Editing note ${nota.folio}.`));

if (typeof window !== "undefined") {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
  }

  async function eliminar(nota) {
    if (!admin1) {
      setMensaje(tx("Solo el Administrador 1 puede eliminar notas.", "Only Administrator 1 can delete notes."));
      return;
    }
if (
  !window.confirm(
    `¿Eliminar la nota ${nota.folio}? Esta acción no se puede deshacer.`
  )
) {
  return;
}

const { error } = await supabase.rpc(
  "eliminar_nota_venta",
  { p_id: nota.id }
);

if (error) {
  setMensaje("No se pudo eliminar: " + error.message);
  return;
}

setMensaje(tx(`La nota ${nota.folio} fue eliminada.`, `Note ${nota.folio} was deleted.`));

if (editando?.id === nota.id) {
  nuevaNota();
}

await cargarNotas();
  }

  async function accionesPdf(tipo, datosOverride = null, folioOverride = null) {
    const datosAccion = datosOverride ? { ...INICIAL, ...datosOverride } : datos;
    const nombreCliente = String(datosAccion.cliente || "CLIENTE").trim() || "CLIENTE";
    const folioActual = folioOverride || folio || "TMX";
    const esBanner = String(tipo).toLowerCase().includes("banner");
    let ventanaAccion = null;
    let urlPdf = null;

    try {
      // ÚNICA ventana emergente. Se reutiliza durante la generación y visualización.
      ventanaAccion = window.open("about:blank", "_blank");
      if (!ventanaAccion) {
        setMensaje(tx(
          "El navegador bloqueó la ventana. Permite ventanas emergentes para este sitio.",
          "Your browser blocked the window. Allow pop-ups for this site."
        ));
        return;
      }

      ventanaAccion.document.open();
      ventanaAccion.document.write(`<!doctype html>
<html lang="${en ? "en" : "es"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${en ? "Preparing PDF" : "Preparando PDF"}</title></head>
<body style="margin:0;padding:32px;font:600 16px Arial;background:#eef1f5;color:#111827">
${en ? "Generating your PDF. Please wait…" : "Generando tu PDF. Espera un momento…"}
</body></html>`);
      ventanaAccion.document.close();

      let base64;
      let archivo;

      if (esBanner) {
        base64 = await generarPdfBannerClienteBase64(nombreCliente, ventanaAccion);
        archivo = `Banner-Cliente-${folioActual}.pdf`;
      } else {
        // IMPORTANTE: pasar la ventana ya abierta evita que abrirImpresion
        // ejecute un segundo window.open().
        base64 = await generarPdfNotaVentaBase64(
          { ...datosAccion },
          folioActual,
          en ? "en" : "es",
          ventanaAccion
        );
        archivo = `Nota-de-Venta-${folioActual}.pdf`;
      }

      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      urlPdf = URL.createObjectURL(blob);

      // La misma about:blank se transforma en el visor con tres botones.
      ventanaAccion.document.open();
      ventanaAccion.document.write(`<!doctype html>
<html lang="${en ? "en" : "es"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${en ? "Sales note PDF" : "PDF de Nota de Venta"}</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;font-family:Arial,Helvetica,sans-serif;background:#e9edf3;color:#111}
.toolbar{position:sticky;top:0;z-index:10;display:grid;grid-template-columns:repeat(3,minmax(150px,190px));justify-content:center;align-items:center;gap:16px;padding:16px 20px;background:#111827;box-shadow:0 3px 12px #0004}
.toolbar button{display:inline-flex;align-items:center;justify-content:center;gap:11px;width:100%;min-height:56px;padding:13px 20px;border:0;border-radius:11px;color:#fff;font-size:16px;font-weight:800;letter-spacing:.2px;cursor:pointer;box-shadow:0 3px 8px #0004;transition:filter .15s,transform .15s}
.toolbar button:hover{filter:brightness(1.1);transform:translateY(-1px)}
.toolbar button:focus-visible{outline:3px solid #fff;outline-offset:3px}
.btn-print{background:#159447}
.btn-share{background:#1769d2}
.btn-cancel{background:#c73535}
.btn-icon{font-size:23px;line-height:1}
.caption{grid-column:1/-1;width:100%;text-align:center;color:#e5e7eb;font-size:13px;margin-top:0}
.viewer{height:calc(100% - 112px);padding:12px}
iframe{display:block;width:100%;height:100%;border:0;border-radius:6px;background:#fff;box-shadow:0 2px 12px #0002}
button:disabled{opacity:.55;cursor:wait}
@media(max-width:640px){.toolbar{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:12px 8px}.toolbar button{min-width:0;min-height:52px;padding:10px 5px;gap:5px;font-size:13px}.btn-icon{font-size:20px}.viewer{height:calc(100% - 104px);padding:6px}.caption{font-size:11px}}
@media(max-width:360px){.toolbar{gap:5px;padding:10px 5px}.toolbar button{font-size:11px;padding:8px 3px}.btn-icon{font-size:17px}}
@media print{.toolbar{display:none!important}.viewer{height:100%;padding:0}iframe{height:100%;box-shadow:none}}
</style>
</head>
<body>
  <div class="toolbar">
    <button class="btn-print" id="printBtn" type="button" aria-label="${en ? "Print PDF" : "Imprimir PDF"}"><span class="btn-icon" aria-hidden="true">🖨️</span><span>${en ? "Print" : "Imprimir"}</span></button>
    <button class="btn-share" id="shareBtn" type="button" aria-label="${en ? "Share PDF" : "Compartir PDF"}"><span class="btn-icon" aria-hidden="true">📤</span><span>${en ? "Share" : "Compartir"}</span></button>
    <button class="btn-cancel" id="cancelBtn" type="button" aria-label="${en ? "Close window" : "Cerrar ventana"}"><span class="btn-icon" aria-hidden="true">✕</span><span>${en ? "Cancel" : "Cancelar"}</span></button>
    <div class="caption">${en ? "Sales note preview · " : "Vista previa de Nota de Venta · "}${folioActual}</div>
  </div>
  <div class="viewer"><iframe id="pdfFrame" title="${en ? "Sales note PDF" : "PDF de Nota de Venta"}" src="${urlPdf}"></iframe></div>
</body>
</html>`);
      ventanaAccion.document.close();

      const frame = ventanaAccion.document.getElementById("pdfFrame");

      ventanaAccion.document.getElementById("printBtn").addEventListener("click", () => {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch (_) {
          setMensaje(tx(
            "No se pudo abrir la impresión del PDF.",
            "Could not open PDF printing."
          ));
        }
      });

      ventanaAccion.document.getElementById("shareBtn").addEventListener("click", async () => {
        try {
          const file = new File([blob], archivo, { type: "application/pdf" });
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: archivo });
          } else {
            const link = ventanaAccion.document.createElement("a");
            link.href = urlPdf;
            link.download = archivo;
            ventanaAccion.document.body.appendChild(link);
            link.click();
            link.remove();
            setMensaje(tx(
              "Tu navegador no permite compartir archivos directamente. Se descargó el PDF.",
              "Your browser cannot share files directly. The PDF was downloaded."
            ));
          }
        } catch (error) {
          if (error?.name !== "AbortError") {
            setMensaje(tx(
              `No se pudo compartir el PDF: ${error?.message || error}`,
              `Could not share the PDF: ${error?.message || error}`
            ));
          }
        }
      });

      ventanaAccion.document.getElementById("cancelBtn").addEventListener("click", () => {
        try { ventanaAccion.close(); } catch (_) {}
      });

      ventanaAccion.focus();
      // Mantener el Object URL vivo mientras el visor está abierto; se revoca al cerrar.
      ventanaAccion.addEventListener("beforeunload", () => {
        try { URL.revokeObjectURL(urlPdf); } catch (_) {}
      }, { once: true });

    } catch (error) {
      try {
        if (ventanaAccion && !ventanaAccion.closed) {
          ventanaAccion.document.open();
          ventanaAccion.document.write(
            `<p style="font-family:Arial;padding:24px;color:#b91c1c">${en ? "Could not generate the PDF: " : "No se pudo generar el PDF: "}${String(error?.message || error)}</p>`
          );
          ventanaAccion.document.close();
        }
      } catch (_) {}
      setMensaje(tx(
        `No se pudo generar el PDF: ${error?.message || error}`,
        `Could not generate the PDF: ${error?.message || error}`
      ));
    }
  }

  function imprimir(nota = null) {
    const d = nota?.datos
      ? { ...INICIAL, ...nota.datos }
      : datos;
    const f = nota?.folio || folio;

    if (!String(d.cliente || "").trim()) {
      setMensaje(tx("Captura el nombre del cliente antes de imprimir.", "Enter the customer name before printing."));
      return;
    }

    // Usar el mismo flujo de PDF con barra superior: Imprimir, Compartir y Cancelar.
    // Así no se abre la ventana antigua que solo mostraba “Imprimir / Guardar PDF” y “Cerrar”.
    accionesPdf("imprimir", d, f);
  }

  const notasFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();
return notas.filter((nota) =>
  `${nota.folio || ""} ${nota.datos?.cliente || ""}`
    .toLowerCase()
    .includes(termino)
);
  }, [notas, busqueda]);

  const fechaActual = fechaHoraActual(en ? "en-US" : "es-MX");
  const folioVisible = folio || tx("Se asigna al guardar", "Assigned when saved");

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        {tx("Cargando sistema de notas de venta…", "Loading sales notes system…")}
      </main>
    );
  }

  if (!sesion) {    return (
      <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-10">
        <form
          onSubmit={iniciarSesion}
          className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        >
          <img
            src="/logo-blanco.png"
            alt="Transportes MX"
            className="mb-5 h-16 w-40 object-contain object-left"
          />
      <p className="mt-2 text-sm text-slate-300">
        {tx("Inicia sesión con tu cuenta autorizada.", "Sign in with your authorized account.")}
      </p>

      <label className="mt-6 block text-sm">
        {tx("Correo electrónico", "Email address")}

        <input
          type="email"
          required
          autoComplete="username"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-600 bg-white p-3 text-slate-900"
        />
      </label>

      <label className="mt-4 block text-sm">
        {tx("Contraseña", "Password")}

        <input
          type="password"
          required
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-600 bg-white p-3 text-slate-900"
        />
      </label>

      <button className="mt-5 w-full rounded-lg bg-emerald-600 p-3 font-bold text-white hover:bg-emerald-700">
        {tx("Entrar", "Sign in")}
      </button>

      {mensaje && (
        <p
          role="alert"
          className="mt-4 rounded bg-red-950 p-3 text-sm text-red-200"
        >
          {mensaje}
        </p>
      )}
    </form>
  </main>
);
  }

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-2xl font-bold">
          {tx("Acceso no autorizado", "Unauthorized access")}
        </h1>
    <p className="mt-3">
      {tx("Esta cuenta no tiene permisos para las notas de venta.", "This account does not have permission to access sales notes.")}
    </p>

    <button
      onClick={cerrarSesion}
      className="mt-5 rounded border border-slate-600 p-3"
    >
      {tx("Cerrar sesión", "Sign out")}
    </button>
  </main>
);
  }

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-950 p-2 text-white sm:p-4 lg:p-6">
      <style jsx global>{`\n        .pac-container {\n          z-index: 999999 !important;\n          font-family: Arial, Helvetica, sans-serif !important;\n        }\n        .pac-item {\n          cursor: pointer;\n          padding: 6px 8px;\n        }\n        /* Unificar apariencia de fecha/hora en navegadores móviles (incluido iOS). */\n        input[type="date"],\n        input[type="time"] {\n          box-sizing: border-box !important;\n          display: block !important;\n          width: 100% !important;\n          min-height: 48px !important;\n          height: 48px !important;\n          padding: 12px !important;\n          border: 1px solid #94a3b8 !important;\n          border-radius: 8px !important;\n          background-color: #fff !important;\n          color: #111827 !important;\n          font: inherit;\n          line-height: normal;\n          -webkit-appearance: none;\n          appearance: none;\n        }\n        input[type="date"]::-webkit-date-and-time-value,\n        input[type="time"]::-webkit-date-and-time-value {\n          text-align: left;\n        }\n      `}</style>
      <div className="mx-auto w-full min-w-0 max-w-7xl">
    <header className="flex flex-col items-stretch justify-between gap-4 border-b border-slate-700 pb-5 sm:flex-row sm:items-center">

      <div className="flex items-center gap-4">
        <img
          src="/logo-blanco.png"
          alt="Transportes MX"
          className="h-16 w-28 object-contain"
          style={{ background: "transparent", border: "none", boxShadow: "none" }}
        />

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Transportes MX
          </h1>

          <p className="text-slate-300">
            {tx("Sistema de notas de venta", "Sales notes system")}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
        {/* Selector de idioma siempre visible también en celular y tablet. */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 p-1" aria-label={tx("Seleccionar idioma", "Select language")}>
          <button
            type="button"
            onClick={() => setIdioma({ nombre: "ES", code: "MX" })}
            aria-pressed={!en}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${!en ? "bg-white text-slate-950" : "text-slate-200 hover:bg-slate-800"}`}
          >
            <img src="/assets/icons/mexico.png" alt="México" className="h-5 w-6 object-contain" />
            <span>ESP</span>
          </button>
          <button
            type="button"
            onClick={() => setIdioma({ nombre: "EN", code: "US" })}
            aria-pressed={en}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${en ? "bg-white text-slate-950" : "text-slate-200 hover:bg-slate-800"}`}
          >
            <img src="/assets/icons/eu.png" alt="United States" className="h-5 w-6 object-contain" />
            <span>EN</span>
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="text-xs text-slate-300 sm:text-sm">
            {admin1 ? tx("Administrador 1", "Administrator 1") : tx("Administrador 2", "Administrator 2")}
          </span>
          <button
            onClick={cerrarSesion}
            className="min-h-11 shrink-0 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
          >
            {tx("Cerrar sesión", "Sign out")}
          </button>
        </div>
      </div>

    </header>

    {mensaje && (
      <p
        role="status"
        className="my-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"
      >
        {mensaje}
      </p>
    )}

    <div className="grid min-w-0 items-start gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-3 xl:gap-5">

      <section className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 p-3 sm:p-4 xl:p-5">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="text-xl font-semibold">
              {editando
                ? `Editar nota ${editando.folio}`
                : tx("Nueva nota de venta", "New sales note")} 
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {tx("Folio:", "Reference:")}{" "}
              <span className="font-bold text-red-400">
                {folioVisible}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={nuevaNota}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
          >
            {tx("Nueva nota", "New note")}
          </button>

        </div>

        <form onSubmit={guardar} className="space-y-4">

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">

            {CAMPOS.map(([campo, etiqueta, tipo]) => {
              const etiquetasEN = {
                imagenUnidad: "🖼️ Select vehicle image",
                unidad: "✏️ Vehicle name (manual)",
                cliente: "👤 Customer name",
                fecha: "📅 Service date",
                hora: "🕒 Service time",
                origen: "📍 Pickup location",
                aerolinea: "✈️ Airline",
                pasajeros: "👥 Number of passengers",
                maletas: "🧳 Number of bags",
                telefono: "☎️ Phone number",
                destino: "📍 Destination",
                idaVuelta: "🔄 Trip type",
                duracion: "⏱️ Duration",
                regresoFecha: "↩️ Return date",
                regresoHora: "🕒 Return time",
                email: "✉️ Primary email address",
                email2: "✉️ Additional email address (optional)",
              };
              const etiquetaVisible = en ? (etiquetasEN[campo] || etiqueta) : etiqueta;
              // Los campos de regreso solo se muestran para viaje redondo.
              if (
                (campo === "regresoFecha" || campo === "regresoHora") &&
                datos.idaVuelta !== "redondo"
              ) {
                return null;
              }

              return (
              <label key={campo} className="block text-sm">

                <span className="font-medium text-slate-200">
                  {etiquetaVisible}
                </span>

                {tipo === "viaje" ? (
                  <select
                    required
                    value={datos[campo] ?? ""}
                    onChange={(e) => cambiar(campo, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500"
                  >
                    <option value="">{tx("Selecciona el tipo de viaje", "Select trip type")}</option>
                    <option value="sencillo">{tx("Sencillo", "One way")}</option>
                    <option value="redondo">{tx("Ida y vuelta", "Round trip")}</option>
                  </select>
                ) : tipo === "select" ? (
                  <select
                    required
                    value={datos[campo] ?? ""}
                    onChange={(e) => cambiar(campo, e.target.value)}
                    style={{
                      appearance: "auto",
                      WebkitAppearance: "menulist",
                      MozAppearance: "menulist",
                      display: "block",
                      width: "100%",
                      minHeight: "48px",
                      padding: "12px",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      border: "1px solid #94a3b8",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    className="mt-1 w-full outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="">
                      {tx("Selecciona un vehículo", "Select a vehicle")}
                    </option>

                    {VEHICULOS.map((vehiculo) => (
                      <option key={vehiculo.imagen} value={vehiculo.imagen}>
                        {vehiculo.nombre}
                      </option>
                    ))}
                  </select>
                ) : campo === "origen" ? (
                  googleMapsLoaded ? (
                    <Autocomplete
                      onLoad={onOrigenLoad}
                      onPlaceChanged={onOrigenChanged}
                      options={autocompleteOptions}
                    >
                      <input
                        type="text"
                        required
                        value={datos.origen ?? ""}
                        onChange={(e) => {
                          cambiar("origen", e.target.value);
                          cambiar("origenPlaceId", "");
                          cambiar("origenLat", "");
                          cambiar("origenLng", "");
                        }}
                        placeholder={tx("Escribe aeropuerto, hotel o dirección y selecciona una sugerencia", "Enter an airport, hotel, or address and select a suggestion")}
                        className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      required
                      value={datos.origen ?? ""}
                      onChange={(e) => cambiar("origen", e.target.value)}
                      placeholder={googleMapsLoadError ? tx("Google Maps no pudo cargar", "Google Maps could not load") : tx("Cargando Google Maps…", "Loading Google Maps…")}
                      className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500"
                    />
                  )
                ) : campo === "destino" ? (
                  googleMapsLoaded ? (
                    <Autocomplete
                      onLoad={onDestinoLoad}
                      onPlaceChanged={onDestinoChanged}
                      options={autocompleteOptions}
                    >
                      <input
                        type="text"
                        required
                        value={datos.destino ?? ""}
                        onChange={(e) => {
                          cambiar("destino", e.target.value);
                          cambiar("destinoPlaceId", "");
                          cambiar("destinoLat", "");
                          cambiar("destinoLng", "");
                        }}
                        placeholder={tx("Escribe aeropuerto, hotel o dirección y selecciona una sugerencia", "Enter an airport, hotel, or address and select a suggestion")}
                        className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      required
                      value={datos.destino ?? ""}
                      onChange={(e) => cambiar("destino", e.target.value)}
                      placeholder={googleMapsLoadError ? tx("Google Maps no pudo cargar", "Google Maps could not load") : tx("Cargando Google Maps…", "Loading Google Maps…")}
                      className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500"
                    />
                  )
                ) : (
                  <input
                    type={tipo}
                    min={tipo === "number" ? "0" : undefined}
                    required={campo === "cliente" || campo === "unidad"}
                    value={datos[campo] ?? ""}
                    onChange={(e) => cambiar(campo, e.target.value)}
                    className={`mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500 ${
                      tipo === "date" || tipo === "time"
                        ? "h-12 min-h-12 box-border appearance-none"
                        : ""
                    }`}
                    style={
                      tipo === "date" || tipo === "time"
                        ? {
                            boxSizing: "border-box",
                            display: "block",
                            width: "100%",
                            height: "48px",
                            minHeight: "48px",
                            padding: "12px",
                            border: "1px solid #94a3b8",
                            borderRadius: "8px",
                            backgroundColor: "#ffffff",
                            color: "#111827",
                            WebkitAppearance: "none",
                            appearance: "none",
                          }
                        : undefined
                    }
                  />
                )}

              </label>
              );
            })}

            <label className="block text-sm">

              <span className="font-medium text-slate-200">
                {tx("💰 Total / estado de pago", "💰 Total / payment status")}
              </span>

              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                value={datos.importe}
                onChange={(e) => cambiar("importe", e.target.value)}
                placeholder={tx("Ej. 3500 o Pagado", "e.g. 3500 or Paid")}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900 outline-none focus:border-emerald-500"
              />

            </label>

          </div>

          <label className="block text-sm">

            <span className="font-medium text-slate-200">
              {tx("Observaciones", "Notes")}
            </span>

            <textarea
              value={datos.observaciones}
              onChange={(e) => cambiar("observaciones", e.target.value)}
              rows={2}
              placeholder={tx("Escribe las observaciones del servicio", "Enter service notes")}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-900"
            />

          </label>

          <div className="flex flex-wrap gap-2">

            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {guardando
                ? tx("Guardando…", "Saving…")
                : editando
                  ? tx("Guardar cambios", "Save changes")
                  : tx("Guardar nota", "Save note")}
            </button>

            <button
              type="button"
              onClick={() => imprimir()}
              className="rounded-lg border border-slate-500 px-4 py-3 hover:bg-slate-800"
            >
              {tx("Imprimir / PDF", "Print / PDF")}
            </button>

            {editando && (
              <button
                type="button"
                onClick={nuevaNota}
                className="rounded-lg border border-slate-500 px-4 py-3 hover:bg-slate-800"
              >
                {tx("Cancelar edición", "Cancel editing")}
              </button>
            )}

          </div>

        </form>

        <div className="mt-7 border-t border-slate-700 pt-5">

          <h3 className="mb-3 text-lg font-semibold">
            {tx("Historial de notas", "Notes history")}
          </h3>

          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={tx("Buscar por folio, cliente o servicio…", "Search by reference, customer, or service…")}
            className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white"
          />

          {notasFiltradas.length === 0 ? (
            <p className="text-sm text-slate-400">
              {tx("No hay registros que coincidan con la búsqueda.", "No records match your search.")}
            </p>
          ) : (
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">

              {notasFiltradas.map((nota) => (
                <article
                  key={nota.id}
                  className="rounded-xl border border-slate-700 bg-slate-950 p-3"
                >

                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="font-bold text-red-400">
                        {nota.folio}
                      </p>

                      <p className="break-words">
                        {nota.datos?.cliente || tx("Sin cliente", "No customer")}
                      </p>

                      <p className="break-words text-sm text-slate-400">
                        {nota.datos?.servicio || ""}
                      </p>

                      {nota.datos?.importe !== "" &&
                        nota.datos?.importe !== null &&
                        nota.datos?.importe !== undefined && (
                          <p className="mt-1 font-semibold text-emerald-400">
                            {moneda(nota.datos.importe)}
                          </p>
                        )}

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() => imprimir(nota)}
                        className="rounded border border-slate-600 px-3 py-2 text-sm"
                      >
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => editar(nota)}
                        className="rounded border border-slate-600 px-3 py-2 text-sm"
                      >
                        {tx("Editar", "Edit")}
                      </button>

                      {admin1 && (
                        <button
                          type="button"
                          onClick={() => eliminar(nota)}
                          className="rounded border border-red-800 px-3 py-2 text-sm text-red-300"
                        >
                          {tx("Eliminar", "Delete")}
                        </button>
                      )}

                    </div>

                  </div>

                </article>
              ))}

            </div>
          )}

        </div>

      </section>

      <section className="min-w-0 rounded-2xl bg-slate-200 p-2 text-black sm:p-3 xl:p-4">

        <div className="mb-3 flex flex-col items-stretch gap-2 px-1">

          <h2 className="font-semibold text-slate-800">
            {tx("Vista previa de impresión", "Print preview")}
          </h2>



        </div>

        <div className="grid grid-cols-1 items-start gap-4">
        {mostrarPreviewNota && <article className="w-full max-w-none min-w-0 bg-white px-3 py-4 text-black shadow-xl sm:px-5 sm:py-5 xl:px-8 xl:py-7">

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(76px,104px)] items-start gap-2 sm:grid-cols-[minmax(0,1fr)_112px] sm:gap-3">

            <div className="min-w-0">

              <img
                src="/logo.jpg"
                alt="Transportes MX"
                className="mb-1 h-10 w-28 max-w-full object-contain object-left sm:h-12 sm:w-32"
              />

              <div className="min-w-0 text-[12px] font-extrabold leading-4">

                <strong className="block">
                  Grupo Turístico MX S. de R.L. de C.V.
                </strong>

                <span>RFC: GTM2604271F2</span>
                <br />

                <span>San Miguel de Allende Guanajuato</span>
                <br />

                <span>+52 415 139 3219</span>
                <br />

                <a
                  className="font-normal text-blue-600 underline"
                  href="mailto:contacto@transportesmx.org"
                >
                  contacto@transportesmx.org
                </a>

                <br />

                <a
                  className="font-normal text-blue-600 underline"
                  href="https://transportesmx.org"
                >
                  https://transportesmx.org
                </a>

              </div>

            </div>

            <div className="min-w-0">

              <div className="bg-red-600 px-2 py-1 text-[14px] font-extrabold text-white">
                F- {folio || "Pendiente"}
              </div>

              <img
                src={imagenVehiculo(datos.imagenUnidad, datos.unidad)}
                alt={datos.unidad || "Vehículo"}
                onError={(event) => {
                  if (event.currentTarget.src !== `${window.location.origin}/sprinter.png`) {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/sprinter.png";
                  }
                }}
                className="mt-6 h-[100px] w-full max-w-full object-contain object-center sm:mt-[36px] sm:h-[150px] sm:max-w-[190px]"
              />

            </div>

          </div>

          <div className="mt-3 space-y-1.5 break-words text-[14px] sm:mt-4 sm:text-[16px]">

            <p>
              <strong>{tx("Cliente:", "Customer:")}</strong> {datos.cliente}
            </p>

            <p>
              <strong>{tx("Teléfono:", "Phone:")}</strong> {datos.telefono}
            </p>

            <p>
              <strong>{tx("Correo:", "Email:")}</strong> {datos.email}
            </p>

          </div>

          <div className="my-3 h-1.5 w-full bg-black" />

          <div className="mt-2 inline-block max-w-full bg-green-600 px-3 py-1 text-[16px] font-extrabold text-white">
            {tx("Total:", "Total:")} {moneda(datos.importe)}
          </div>

          <div className="mt-2 h-[3mm]" aria-hidden="true" />

          <div className="bg-black px-2 py-1.5 text-[16px] font-extrabold text-white">
            {tx("Descripción del traslado:", "Transfer details:")}
          </div>

          <div className="mt-5 min-w-0 space-y-1.5 break-words text-[13px] sm:mt-[9mm] sm:text-[16px]">

            {[
              ["🚐", tx("Vehículo:", "Vehicle:"), datos.unidad],
              ["👤", tx("Nombre del cliente:", "Customer name:"), datos.cliente],
              ["📅", tx("Fecha y hora:", "Date and time:"), valorFechaHora(datos, en ? "en-US" : "es-MX")],
              ["📍", tx("Recoger en:", "Pickup:"), datos.origen],
              ["✈️", tx("Aerolínea:", "Airline:"), datos.aerolinea || "N/A"],
              ["👥", tx("Número de pasajeros:", "Number of passengers:"), datos.pasajeros],
              ["🧳", tx("Número de maletas:", "Number of bags:"), datos.maletas],
              ["☎️", tx("Número de teléfono:", "Phone number:"), datos.telefono],
              ["📍", tx("Destino:", "Destination:"), datos.destino],
              ["🔄", tx("Tipo de viaje:", "Trip type:"), datos.idaVuelta === "redondo" ? tx("Ida y vuelta", "Round trip") : datos.idaVuelta === "sencillo" ? tx("Sencillo", "One way") : ""],
              ["⏱️", tx("Duración:", "Duration:"), datos.duracion],
            ].map(([icono, etiqueta, valor]) => (
              <p
                key={etiqueta}
                className="flex flex-wrap items-start gap-x-1"
              >
                <span>{icono}</span>
                <strong>{etiqueta}</strong>
                <span className="break-words">{valor || ""}</span>
              </p>
            ))}

          </div>

          <div className="mt-6 flex min-w-0 flex-wrap items-start gap-1 break-words text-[13px] sm:mt-[15mm] sm:text-[16px]">

            <span>↩️</span>

            <strong>{tx("Regreso:", "Return:")}</strong>

            <span>{valorRegreso(datos, en ? "en-US" : "es-MX")}</span>

          </div>

          <div className="mt-4 min-h-16 min-w-0 break-words rounded-[20px] border-2 border-black px-3 py-3 text-[13px] sm:mt-5 sm:rounded-[24px] sm:px-4 sm:text-[14px]">

            <strong className="mb-1 block">
              {tx("Observaciones", "Notes")}:
            </strong>

            <span>{datos.observaciones || ""}</span>

          </div>

          <footer className="mt-3 border-t-2 border-black pt-3 text-center text-[10px] leading-4 text-slate-600 sm:mt-4 sm:text-[11px]">

            <p>
              {tx("San Miguel de Allende, Guanajuato · Documento Generado:", "San Miguel de Allende, Guanajuato · Document generated:")} {" "}
              {fechaActual.fecha} · {tx("Hora:", "Time:")} {fechaActual.hora}
            </p>

            <p>
              Grupo Turístico MX S. de R.L. de C.V.
            </p>

          </footer>

        </article>}


        {!mostrarPreviewNota && <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setMostrarPreviewNota(true)} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white">{tx("Mostrar Nota de Venta", "Show Sales Note")}</button>
        </div>}
        </div>

        <p className="mx-auto mt-3 max-w-[760px] text-sm text-slate-600">
          {tx("La vista previa sigue la distribución del documento impreso.", "The preview follows the layout of the printed document.")}
          {tx("Para generar el PDF, pulsa “Imprimir / PDF”.", "To generate the PDF, select “Print / PDF”.")}
        </p>

      </section>

    </div>

  </div>
</main>
  );
}
