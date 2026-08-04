"use client";

import { useState } from "react";
import { responderPresupuesto } from "./actions";

export default function PresupuestoCliente({ equipo }) {
  const [busy, setBusy] = useState(false);
  const [respuesta, setRespuesta] = useState(equipo.presupuesto_respuesta);
  const [error, setError] = useState("");

  const total = Number(equipo.presupuesto_mano_obra || 0) + Number(equipo.presupuesto_repuestos || 0);

  const responder = async (valor) => {
    if (!confirm(valor === "aceptado" ? "¿Confirmás que aceptás el presupuesto?" : "¿Confirmás que rechazás el presupuesto?")) {
      return;
    }
    setBusy(true);
    setError("");
    const res = await responderPresupuesto(equipo.id, valor);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setRespuesta(valor);
  };

  return (
    <div className="card !border-accent p-5 mb-5">
      <div className="eyebrow">Presupuesto</div>
      {equipo.presupuesto_detalle && (
        <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{equipo.presupuesto_detalle}</p>
      )}
      <div className="text-2xl font-black text-ink mt-3">
        ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </div>

      {respuesta ? (
        <div
          className={`rounded-lg p-3 mt-4 text-sm font-semibold ${
            respuesta === "aceptado" ? "bg-good/10 text-good border border-good/30" : "bg-bad/10 text-bad border border-bad/30"
          }`}
        >
          {respuesta === "aceptado" ? "✓ Aceptaste este presupuesto" : "✕ Rechazaste este presupuesto"}
        </div>
      ) : (
        <>
          <p className="text-xs text-dim mt-3 mb-3">
            Revisá el detalle y elegí una opción. Le vamos a avisar directo al laboratorio.
          </p>
          {error && <div className="text-bad text-xs mb-3">{error}</div>}
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => responder("aceptado")} className="btn flex-1">
              Aceptar presupuesto
            </button>
            <button disabled={busy} onClick={() => responder("rechazado")} className="btn-ghost flex-1">
              Rechazar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
