"use client";

import { useState } from "react";
import { marcarEntregadoAdmin } from "./actions";

export default function EntregaAdmin({ equipo }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [entregadoAt, setEntregadoAt] = useState(equipo.entregado_admin_at);
  const [estado, setEstado] = useState(equipo.estado);

  const visible =
    ["finalizado", "entrega", "entregado"].includes(estado) || entregadoAt || equipo.recibido_cliente_at;
  if (!visible) return null;

  const marcar = async () => {
    setBusy(true);
    setError("");
    const res = await marcarEntregadoAdmin(equipo.id);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setEntregadoAt(new Date().toISOString());
    if (res.finalizado) setEstado("entregado");
  };

  const clienteConfirmo = Boolean(equipo.recibido_cliente_at);
  const ambosConfirmados = entregadoAt && clienteConfirmo;

  return (
    <div className="card p-5">
      <div className="eyebrow">Entrega</div>

      {ambosConfirmados ? (
        <div className="rounded-lg p-3 mt-2 bg-good/10 border border-good/30 text-good text-sm font-semibold">
          🎉 Entrega confirmada por las dos partes
        </div>
      ) : (
        <>
          {clienteConfirmo && !entregadoAt && (
            <div className="rounded-lg p-3 mt-2 mb-3 bg-info/10 border border-info/30 text-sm">
              <div className="font-semibold text-info mb-1">El cliente dice que ya lo recibió</div>
              <div className="text-xs text-dim">{new Date(equipo.recibido_cliente_at).toLocaleString("es-AR")}</div>
            </div>
          )}
          {entregadoAt && !clienteConfirmo && (
            <div className="rounded-lg p-3 mt-2 mb-3 bg-info/10 border border-info/30 text-sm">
              <div className="font-semibold text-info mb-1">Marcaste la entrega, esperando que confirme el cliente</div>
              <div className="text-xs text-dim">{new Date(entregadoAt).toLocaleString("es-AR")}</div>
            </div>
          )}
          {error && <div className="text-bad text-xs mb-2">{error}</div>}
          {!entregadoAt && (
            <button disabled={busy} onClick={marcar} className="btn w-full">
              {busy ? "Guardando..." : clienteConfirmo ? "Sí, confirmar que se lo entregué" : "📦 Marcar como entregado"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
