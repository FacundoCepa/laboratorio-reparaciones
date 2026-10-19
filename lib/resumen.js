// Cálculo de los resúmenes mensuales del taller (sin acceso a la base:
// recibe los equipos y su historial de estados ya leídos).

const TZ = "America/Argentina/Buenos_Aires";
const CIERRES = ["finalizado", "entrega", "entregado"];

// "2026-10" según la hora de Argentina (no la del servidor).
export function claveMes(fecha) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).formatToParts(
    new Date(fecha)
  );
  return `${p.find((x) => x.type === "year").value}-${p.find((x) => x.type === "month").value}`;
}

export function nombreMes(clave) {
  const [y, m] = clave.split("-").map(Number);
  const n = new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function vacio(clave) {
  return { clave, ingresados: 0, reparados: 0, noReparados: 0, finalizados: 0, facturado: 0, manoObra: 0, repuestos: 0 };
}

export function calcularResumen(equipos, historial) {
  const porEquipo = new Map();
  for (const h of historial) {
    if (!porEquipo.has(h.equipo_id)) porEquipo.set(h.equipo_id, []);
    porEquipo.get(h.equipo_id).push(h);
  }
  for (const lista of porEquipo.values()) lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const meses = new Map();
  const mes = (fecha) => {
    const k = claveMes(fecha);
    if (!meses.has(k)) meses.set(k, vacio(k));
    return meses.get(k);
  };

  for (const e of equipos) {
    const h = porEquipo.get(e.id) || [];

    // Ingreso físico: la primera vez que pasó a "recibido". Los que el
    // cliente registró y todavía no llegaron no cuentan.
    const recibido = h.find((x) => x.estado === "recibido");
    if (recibido) mes(recibido.fecha).ingresados++;
    else if (e.estado !== "registrado") mes(e.creado_at).ingresados++;

    // Resultado: el último que se marcó (por si se corrigió).
    const resultado = [...h].reverse().find((x) => x.estado === "reparado" || x.estado === "no_reparado");
    if (resultado) {
      if (resultado.estado === "reparado") mes(resultado.fecha).reparados++;
      else mes(resultado.fecha).noReparados++;
    }

    // Facturación: en el mes en que se finalizó.
    const cierre = e.finalizado_at || h.find((x) => CIERRES.includes(x.estado))?.fecha;
    if (cierre && CIERRES.includes(e.estado)) {
      const m = mes(cierre);
      const mo = Number(e.costo_mano_obra || 0);
      const rep = Number(e.costo_repuestos || 0);
      m.finalizados++;
      m.manoObra += mo;
      m.repuestos += rep;
      m.facturado += mo + rep;
    }
  }

  return [...meses.values()].sort((a, b) => (a.clave < b.clave ? 1 : -1));
}
