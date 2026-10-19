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

// Igual que consultarVentaErp pero para muchos equipos en un solo pedido
// (listas de Finalizados / Entregados). Devuelve un Map numero → venta.
export async function consultarVentasErp(equipos) {
  const resultado = new Map();
  if (!erpConfigurado() || equipos.length === 0) return resultado;
  try {
    const ordenes = equipos.map((e) => ({
      numeroOrden: e.numero,
      clienteEmail: e.cliente?.email || null,
      clienteNombre: e.cliente?.email ? null : e.cliente?.nombre || null,
    }));
    const res = await fetch(`${process.env.ARGEX_API_URL}/api/reparaciones-lab/consulta`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ARGEX_API_KEY },
      body: JSON.stringify({ ordenes }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return resultado;
    const data = await res.json().catch(() => null);
    for (const [numero, venta] of Object.entries(data?.ventas || {})) resultado.set(Number(numero), venta);
  } catch {
    // Si Argentina Express no responde, la lista se muestra igual.
  }
  return resultado;
}

// Para las listas: completa venta_erp_numero de los equipos que tienen
// costo cargado y todavía no la tienen anotada (preguntándole a Argentina
// Express) y la deja anotada en la base para la próxima.
export async function completarVentasErp(supabase, equipos) {
  const pendientes = equipos.filter((e) => !e.venta_erp_numero && Number(e.costo_mano_obra || 0) > 0);
  if (pendientes.length === 0) return equipos;
  const ventas = await consultarVentasErp(pendientes);
  if (ventas.size === 0) return equipos;
  await Promise.all(
    pendientes
      .filter((e) => ventas.has(e.numero))
      .map((e) =>
        supabase
          .from("equipos")
          .update({ venta_erp_id: ventas.get(e.numero).ventaId, venta_erp_numero: ventas.get(e.numero).numero })
          .eq("id", e.id)
      )
  );
  return equipos.map((e) => (ventas.has(e.numero) ? { ...e, venta_erp_numero: ventas.get(e.numero).numero } : e));
}
