"use client";

import { useState } from "react";
import { marcarRecibidoCliente } from "./actions";

export default function RecibidoCliente({ equipo }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recibidoAt, setRecibidoAt] = useState(equipo.recibido_cliente_at);
  const [estado, setEstado] = useState(equipo.estado);

  const visible =
    ["finalizado", "entrega", "entregado"].includes(estado) || recibidoAt || equipo.entregado_admin_at;
  if (!visible) return null;

  const marcar = async () => {
    if (!confirm("¿Confirmás que ya recibiste tu equipo?")) return;
    setBusy(true);
    setError("");
    const res = await marcarRecibidoCliente(equipo.id);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setRecibidoAt(new Date().toISOString());
    if (res.finalizado) setEstado("entregado");
  };

  const adminConfirmo = Boolean(equipo.entregado_admin_at);
  const ambosConfirmados = recibidoAt && adminConfirmo;

  return (
    <div className="card p-5 mb-5">
      <div className="eyebrow">Entrega</div>

      {ambosConfirmados ? (
        <div className="rounded-lg p-3 mt-2 bg-good/10 border border-good/30 text-good text-sm font-semibold">
          🎉 Confirmaste que recibiste tu equipo
        </div>
      ) : (
        <>
          {adminConfirmo && !recibidoAt && (
            <p className="text-sm text-ink mt-2 mb-3">
              El laboratorio marcó tu equipo como entregado. <b>¿Lo recibiste?</b>
            </p>
          )}
          {recibidoAt && !adminConfirmo && (
            <div className="rounded-lg p-3 mt-2 mb-3 bg-info/10 border border-info/30 text-sm">
              <div className="font-semibold text-info">Marcaste que ya lo recibiste</div>
              <div className="text-xs text-dim mt-0.5">Esperando que el laboratorio lo confirme de su lado.</div>
            </div>
          )}
          {error && <div className="text-bad text-xs mb-2">{error}</div>}
          {!recibidoAt && (
            <button disabled={busy} onClick={marcar} className="btn w-full">
              {busy ? "Guardando..." : "Sí, lo recibí"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
