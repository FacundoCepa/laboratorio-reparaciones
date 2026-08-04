"use client";

import { useState, useRef } from "react";
import { enviarPresupuesto } from "./actions";

export default function PresupuestoForm({ equipo }) {
  const formRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [manoObra, setManoObra] = useState(equipo.presupuesto_mano_obra || 0);
  const [repuestos, setRepuestos] = useState(equipo.presupuesto_repuestos || 0);

  const total = (parseFloat(manoObra) || 0) + (parseFloat(repuestos) || 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!confirm("¿Enviar este presupuesto al cliente por email y pasar el caso a 'Espera de aceptación'?")) return;
    setSaving(true);
    setError("");
    const formData = new FormData(formRef.current);
    const res = await enviarPresupuesto(equipo.id, formData);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setEnviado(true);
  };

  return (
    <div>
      {equipo.presupuesto_respuesta && (
        <div
          className={`rounded-lg p-3 mb-4 text-sm font-semibold ${
            equipo.presupuesto_respuesta === "aceptado"
              ? "bg-good/10 text-good border border-good/30"
              : "bg-bad/10 text-bad border border-bad/30"
          }`}
        >
          {equipo.presupuesto_respuesta === "aceptado" ? "✓ El cliente aceptó el presupuesto" : "✕ El cliente rechazó el presupuesto"}
          {equipo.presupuesto_respuesta_at && (
            <span className="block text-xs font-normal opacity-80 mt-0.5">
              {new Date(equipo.presupuesto_respuesta_at).toLocaleString("es-AR")}
            </span>
          )}
        </div>
      )}

      <form ref={formRef} onSubmit={submit}>
        <label className="block mb-3">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Detalle del presupuesto
          </span>
          <textarea
            name="presupuesto_detalle"
            rows={3}
            className="input"
            defaultValue={equipo.presupuesto_detalle || ""}
            placeholder="Ej: Reemplazo de fuente de alimentación + limpieza general..."
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-1">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Mano de obra ($)
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="presupuesto_mano_obra"
              className="input"
              value={manoObra}
              onChange={(e) => setManoObra(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Repuestos ($)
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="presupuesto_repuestos"
              className="input"
              value={repuestos}
              onChange={(e) => setRepuestos(e.target.value)}
            />
          </label>
        </div>
        <div className="text-right text-sm text-ink font-bold mb-4">
          Total: ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </div>

        {error && <div className="text-bad text-xs mb-3">{error}</div>}
        {enviado && <div className="text-good text-xs mb-3">Presupuesto enviado al cliente por email.</div>}

        <button type="submit" disabled={saving} className="btn w-full">
          {saving ? "Enviando..." : "Enviar presupuesto al cliente"}
        </button>
        <p className="text-[11px] text-dim mt-2">
          Al enviarlo, el caso pasa a "Espera de aceptación del presupuesto" y el cliente recibe un email con el
          monto para aceptarlo o rechazarlo desde su cuenta.
        </p>
      </form>
    </div>
  );
}
