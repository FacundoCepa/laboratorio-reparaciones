"use client";

import { useState, useRef, useTransition } from "react";
import { enviarPresupuesto, cambiarEstado } from "./actions";

export default function PresupuestoForm({ equipo }) {
  const formRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [manoObra, setManoObra] = useState(equipo.presupuesto_mano_obra || 0);
  const [repuestos, setRepuestos] = useState(equipo.presupuesto_repuestos || 0);
  const [isPending, startTransition] = useTransition();

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

  const continuarAReparacion = () => {
    startTransition(async () => {
      await cambiarEstado(equipo.id, "reparacion");
    });
  };

  const esperandoAvanzar = equipo.presupuesto_respuesta === "aceptado" && equipo.estado === "espera_presupuesto";

  const yaEnviado = Boolean(equipo.presupuesto_enviado_at);

  return (
    <div>
      {yaEnviado && (
        <div className="rounded-lg p-3 mb-4 bg-info/10 border border-info/30 text-info text-sm font-semibold">
          📨 Presupuesto enviado el {new Date(equipo.presupuesto_enviado_at).toLocaleString("es-AR")}
        </div>
      )}
      {equipo.presupuesto_respuesta === "aceptado" && (
        <div className="rounded-lg p-4 mb-4 bg-good/10 border border-good/30">
          <div className="text-good font-semibold text-sm mb-0.5">✓ El cliente aceptó el presupuesto</div>
          {equipo.presupuesto_respuesta_at && (
            <div className="text-xs text-dim mb-3">{new Date(equipo.presupuesto_respuesta_at).toLocaleString("es-AR")}</div>
          )}
          {esperandoAvanzar && (
            <>
              <p className="text-sm text-ink mb-3">¿Querés pasarlo a "En proceso de reparación"?</p>
              <button disabled={isPending} onClick={continuarAReparacion} className="btn w-full">
                {isPending ? "Actualizando..." : "Sí, continuar a reparación"}
              </button>
            </>
          )}
        </div>
      )}
      {equipo.presupuesto_respuesta === "rechazado" && (
        <div className="rounded-lg p-4 mb-4 bg-bad/10 border border-bad/30">
          <div className="text-bad font-semibold text-sm mb-0.5">✕ El cliente rechazó el presupuesto</div>
          {equipo.presupuesto_respuesta_at && (
            <div className="text-xs text-dim">{new Date(equipo.presupuesto_respuesta_at).toLocaleString("es-AR")}</div>
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
        {enviado && <div className="text-good text-xs mb-3">✓ Presupuesto enviado y notificado por email recién ahora.</div>}

        <button type="submit" disabled={saving} className="btn w-full">
          {saving ? "Enviando..." : yaEnviado ? "Reenviar presupuesto actualizado" : "Enviar presupuesto al cliente"}
        </button>
        <p className="text-[11px] text-dim mt-2">
          Al enviarlo, el caso pasa a "Espera de aceptación del presupuesto" y el cliente recibe un email con el
          monto para aceptarlo o rechazarlo desde su cuenta.
        </p>
      </form>
    </div>
  );
}
