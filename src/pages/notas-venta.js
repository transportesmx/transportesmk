
function formatoFecha(valor) {
  if (!valor) return "";

  const fecha = new Date(`${valor}T12:00:00`);

  if (Number.isNaN(fecha.getTime())) return valor;

  const texto = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  }).format(fecha);

  return texto.replace(/\b([a-záéíóúñ])/i, (letra) =>
    letra.toLocaleUpperCase("es-MX")
  );
}

function formatoHora(valor) {
  if (!valor) return "";

  const [hora, minuto] = valor.split(":").map(Number);

  if (!Number.isFinite(hora) || !Number.isFinite(minuto)) {
    return valor;
  }

  return `${hora % 12 || 12}:${String(minuto).padStart(2, "0")} ${
    hora >= 12 ? "P.M." : "A.M."
  }`;
}

function moneda(valor) {
  if (valor === "" || valor === null || valor === undefined) {
    return "";
  }

  const texto = String(valor).trim();

  if (!texto) return "";

  const numero = Number(texto);

  if (!Number.isFinite(numero)) return texto;

  return `$${numero.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MXN`;
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[caracter]);
}

function fechaHoraActual() {
  const ahora = new Date();

  const partesFecha = new Intl.DateTimeFormat("es-MX", {
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
    ? mesCrudo.charAt(0).toLocaleUpperCase("es-MX") +
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
    fecha: `${dia} de ${mes} de ${anio}`,
    hora: `${hora}:${minuto} ${periodo === "PM" ? "P.M." : "A.M."}`,
  };
}

function htmlFila(etiqueta, valor, clase = "") {
  return `<div class="dato ${clase}">
    <span class="icono">${escapar(etiqueta.split(" ")[0])}</span>
    <strong class="etiqueta">${escapar(
      etiqueta.replace(/^\S+\s*/, "")
    )}</strong>
    <span class="valor">${escapar(valor || "")}</span>
  </div>`;
}
