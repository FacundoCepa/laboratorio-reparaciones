// Conexión con Argentina Express (sistema de gestión). Solo servidor.

export function erpConfigurado() {
  return Boolean(process.env.ARGEX_API_URL && process.env.ARGEX_API_KEY);
}

// Le pregunta a Argentina Express si esta orden ya tiene una venta.
// Devuelve { ventaId, numero } o null. Si no responde, devuelve null
// (no bloquea la página).
export async function consultarVentaErp(equipo) {
  if (!erpConfigurado()) return null;
  try {
    const params = new URLSearchParams({ numeroOrden: String(equipo.numero) });
    if (equipo.cliente?.email) params.set("clienteEmail", equipo.cliente.email);
    else if (equipo.cliente?.nombre) params.set("clienteNombre", equipo.cliente.nombre);

    const res = await fetch(`${process.env.ARGEX_API_URL}/api/reparaciones-lab?${params}`, {
      headers: { "x-api-key": process.env.ARGEX_API_KEY },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.venta || null;
  } catch {
    return null;
  }
}
