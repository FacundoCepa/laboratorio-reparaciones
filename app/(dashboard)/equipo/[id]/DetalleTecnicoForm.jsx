"use client";

import { useState, useRef } from "react";
import { actualizarDetalleTecnico } from "./actions";

export default function DetalleTecnicoForm({ equipo }) {
  const formRef = useRef(null);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(formRef.current);
    const res = await actualizarDetalleTecnico(equipo.id, formData);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setEditando(false);
  };

  if (!editando) {
    return (
      <div>
        <div className="space-y-2 text-sm">
          <Row label="Falla reportada" value={equipo.falla || "—"} />
          <Row
            label="Batería"
            value={equipo.bateria === "si" ? "Sí (removible)" : equipo.bateria === "interna" ? "Interna" : "No tiene"}
          />
          <Row label="Cargador" value={equipo.cargador ? "Sí" : "No"} />
          <Row label="Memoria" value={equipo.memoria ? "Sí" : "No"} />
          <Row label="Disco" value={equipo.disco ? "Sí" : "No"} />
          <Row label="Teclado" value={equipo.teclado ? "Sí" : "No"} />
        </div>
        <button onClick={() => setEditando(true)} className="btn-ghost w-full mt-3 text-xs py-2">
          ✏️ Editar detalle técnico
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit}>
      <label className="block mb-3">
        <span className="block text-[11px] uppercase tracking-wide text-muted mb-1.5">Falla reportada</span>
        <textarea name="falla" rows={2} className="input" defaultValue={equipo.falla || ""} />
      </label>

      <div className="mb-3">
        <span className="block text-[11px] uppercase tracking-wide text-muted mb-1.5">Batería</span>
        <select name="bateria" className="input" defaultValue={equipo.bateria || "no_tiene"}>
          <option value="si">Sí, con batería</option>
          <option value="interna">Interna (no removible)</option>
          <option value="no_tiene">No tiene</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          ["cargador", "Cargador"],
          ["memoria", "Memoria"],
          ["disco", "Disco"],
          ["teclado", "Teclado"],
        ].map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface2 text-sm text-ink">
            <input type="checkbox" name={name} defaultChecked={equipo[name]} className="w-4 h-4 accent-accent" />
            {label}
          </label>
        ))}
      </div>

      {error && <div className="text-bad text-xs mb-3">{error}</div>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn flex-1 text-xs py-2">
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={() => setEditando(false)} className="btn-ghost text-xs py-2 px-3">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-border2 last:border-0">
      <span className="text-dim">{label}</span>
      <span className="text-ink font-medium text-right">{value}</span>
    </div>
  );
}
