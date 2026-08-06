"use client";

import { useState, useRef } from "react";
import { actualizarDatosEquipo } from "./actions";
import { TIPOS_EQUIPO } from "@/lib/estados";

export default function DatosEquipoForm({ equipo }) {
  const formRef = useRef(null);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [datos, setDatos] = useState(equipo);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(formRef.current);
    const res = await actualizarDatosEquipo(equipo.id, formData);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDatos({
      ...datos,
      tipo: formData.get("tipo"),
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      serial: formData.get("serial"),
    });
    setEditando(false);
  };

  if (!editando) {
    return (
      <div>
        <h1 className="text-2xl font-black text-ink">
          {datos.tipo} · {datos.marca} {datos.modelo}
        </h1>
        <p className="text-sm text-dim mt-1">
          Cliente: {equipo.cliente?.nombre} · Serial: <span className="font-mono">{datos.serial}</span>
          <button onClick={() => setEditando(true)} className="ml-2 text-accent text-xs font-semibold hover:underline">
            ✏️ Editar
          </button>
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} className="card p-4 max-w-md">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Tipo</span>
          <select name="tipo" className="input" defaultValue={datos.tipo}>
            {TIPOS_EQUIPO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Marca</span>
          <input name="marca" defaultValue={datos.marca} className="input" required />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Modelo</span>
          <input name="modelo" defaultValue={datos.modelo} className="input" required />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Serial</span>
          <input name="serial" defaultValue={datos.serial} className="input" required />
        </label>
      </div>
      {error && <div className="text-bad text-xs mb-3">{error}</div>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn text-xs py-2 flex-1">
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={() => setEditando(false)} className="btn-ghost text-xs py-2 px-3">
          Cancelar
        </button>
      </div>
    </form>
  );
}
