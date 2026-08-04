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
];

export const estadoInfo = (key) => ESTADOS.find((e) => e.key === key) || ESTADOS[0];
export const estadoIndex = (key) => ESTADOS.findIndex((e) => e.key === key);

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
  finalizado: (nombre, numero) => `Tu equipo (caso #${numero}) está finalizado y listo para retirar.`,
  entrega: (nombre, numero) => `Tu equipo (caso #${numero}) está en proceso de entrega.`,
};

export const TIPOS_EQUIPO = ["Notebook", "PC de escritorio", "Celular", "Impresora", "Monitor", "All in One", "Otro"];
