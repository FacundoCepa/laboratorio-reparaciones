"use client";

import { useState, useRef } from "react";
import { guardarInforme } from "./actions";

export default function InformeForm({ equipo }) {
  const formRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [manoObra, setManoObra] = useState(equipo.costo_mano_obra || 0);
  const [repuestos, setRepuestos] = useState(equipo.costo_repuestos || 0);

  const total = (parseFloat(manoObra) || 0) + (parseFloat(repuestos) || 0);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSavedMsg("");
    const formData = new FormData(formRef.current);
    const res = await guardarInforme(equipo.id, formData);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSavedMsg("Informe guardado.");
  };

  return (
    <form ref={formRef} onSubmit={submit}>
      <label className="block mb-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Diagnóstico</span>
        <textarea
          name="diagnostico"
          rows={2}
          className="input"
          defaultValue={equipo.diagnostico || ""}
          placeholder="Qué se encontró al revisar el equipo..."
        />
      </label>
      <label className="block mb-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
          Trabajo realizado
        </span>
        <textarea
          name="trabajo_realizado"
          rows={2}
          className="input"
          defaultValue={equipo.trabajo_realizado || ""}
          placeholder="Qué se hizo para solucionarlo..."
        />
      </label>
      <label className="block mb-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
          Repuestos utilizados
        </span>
        <textarea
          name="repuestos_utilizados"
          rows={2}
          className="input"
          defaultValue={equipo.repuestos_utilizados || ""}
          placeholder="Ej: Fuente de alimentación 65W, pasta térmica..."
        />
      </label>

      <div className="grid grid-cols-2 gap-3 mb-1">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Costo mano de obra ($)
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            name="costo_mano_obra"
            className="input"
            value={manoObra}
            onChange={(e) => setManoObra(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Costo repuestos ($)
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            name="costo_repuestos"
            className="input"
            value={repuestos}
            onChange={(e) => setRepuestos(e.target.value)}
          />
        </label>
      </div>
      <div className="text-right text-sm text-ink font-bold mb-3">
        Total: ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Garantía (días)
          </span>
          <input type="number" min="0" name="garantia_dias" className="input" defaultValue={equipo.garantia_dias ?? 90} />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Técnico</span>
          <input name="tecnico_nombre" className="input" defaultValue={equipo.tecnico_nombre || ""} />
        </label>
      </div>

      <label className="block mb-4">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
          Observaciones para el cliente
        </span>
        <textarea
          name="observaciones"
          rows={2}
          className="input"
          defaultValue={equipo.observaciones || ""}
          placeholder="Recomendaciones, cuidados, etc."
        />
      </label>

      {error && <div className="text-bad text-xs mb-3">{error}</div>}
      {savedMsg && <div className="text-good text-xs mb-3">{savedMsg}</div>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn flex-1">
          {saving ? "Guardando..." : "Guardar informe"}
        </button>
        <a href={`/informe/${equipo.id}`} target="_blank" rel="noreferrer" className="btn-ghost">
          🖨️ Ver / imprimir
        </a>
      </div>
    </form>
  );
}
