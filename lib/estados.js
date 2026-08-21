export const ESTADOS = [
  { key: "registrado", label: "Registrado", color: "#8a8578" },
  { key: "recibido", label: "Equipo recibido", color: "#4FB4A8" },
  { key: "revision", label: "Ingresó a revisión", color: "#4FB4A8" },
  { key: "presupuesto", label: "Elaborando presupuesto", color: "#E8873A" },
  { key: "espera_presupuesto", label: "Espera aceptación del presupuesto", color: "#F2B705" },
  { key: "reparacion", label: "En proceso de reparación", color: "#E8873A" },
  { key: "reparado", label: "Equipo reparado", color: "#7FBF7F" },
  { key: "finalizado", label: "Finalizado", color: "#7FBF7F" },
  { key: "entrega", label: "En proceso de entrega", color: "#6FA8DC" },
  { key: "entregado", label: "Entregado", color: "#7FBF7F" },
];

// "No reparado" es una alternativa a "Reparado" (uno u otro, no los dos).
// No forma parte del riel principal: ocupa el mismo lugar que "reparado"
// cuando corresponde, para no romper el orden general del flujo.
export const ESTADO_NO_REPARADO = { key: "no_reparado", label: "Equipo no reparado", color: "#E86A5C" };

export const estadoInfo = (key) => {
  if (key === "no_reparado") return ESTADO_NO_REPARADO;
  return ESTADOS.find((e) => e.key === key) || ESTADOS[0];
};
export const estadoIndex = (key) => {
  if (key === "no_reparado") return ESTADOS.findIndex((e) => e.key === "reparado");
  return ESTADOS.findIndex((e) => e.key === key);
};

// Lista de pasos a mostrar en el riel de progreso: si el equipo pasó (o está)
// por "no reparado" en algún momento de su historial, ese paso reemplaza
// visualmente a "reparado" — y se mantiene así aunque ya haya avanzado a
// Finalizado/Entregado, para no perder ese dato en el seguimiento.
export const pasosParaRiel = (estadoActual, historial = []) => {
  const fueNoReparado = estadoActual === "no_reparado" || historial.some((h) => h.estado === "no_reparado");
  return fueNoReparado ? ESTADOS.map((e) => (e.key === "reparado" ? ESTADO_NO_REPARADO : e)) : ESTADOS;
};

export const MSG_ESTADO = {
  recibido: (nombre, numero) =>
    `Hola ${nombre}, te avisamos que recibimos tu equipo (caso #${numero}). En breve comenzamos la revisión.`,
  revision: (nombre, numero) => `Tu equipo (caso #${numero}) ingresó a revisión técnica.`,
  reparacion: (nombre, numero) =>
    `Buenas noticias ${nombre}, tu equipo (caso #${numero}) ya está en proceso de reparación.`,
  presupuesto: (nombre, numero) =>
    `Estamos elaborando el presupuesto de tu equipo (caso #${numero}). Te avisamos apenas esté listo.`,
  espera_presupuesto: (nombre, numero) =>
    `El presupuesto de tu equipo (caso #${numero}) ya está listo. Necesitamos tu aceptación para continuar.`,
  reparado: (nombre, numero) =>
    `¡Tu equipo (caso #${numero}) fue reparado! Estamos haciendo los últimos controles.`,
  no_reparado: (nombre, numero) =>
    `Hola ${nombre}, lamentablemente no pudimos reparar tu equipo (caso #${numero}). Nos vamos a comunicar para coordinar la devolución.`,
  finalizado: (nombre, numero) => `Tu equipo (caso #${numero}) está finalizado y listo para retirar.`,
  entrega: (nombre, numero) => `Tu equipo (caso #${numero}) está en proceso de entrega.`,
  entregado: (nombre, numero) => `¡Listo ${nombre}! Quedó registrado que retiraste tu equipo (caso #${numero}).`,
};

export const TIPOS_EQUIPO = ["Notebook", "PC de escritorio", "Celular", "Impresora", "Monitor", "All in One", "Otro"];
