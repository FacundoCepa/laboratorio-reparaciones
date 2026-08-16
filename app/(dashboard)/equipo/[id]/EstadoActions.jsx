"use client";

import { useState, useTransition } from "react";
import { cambiarEstado } from "./actions";
import { ESTADOS, ESTADO_NO_REPARADO } from "@/lib/estados";

export default function EstadoActions({ equipoId, estadoActual, nextEstado }) {
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado] = useState(estadoActual);

  const avanzar = (nuevo) => {
    setEstado(nuevo);
    startTransition(async () => {
      await cambiarEstado(equipoId, nuevo);
    });
  };

  return (
    <div className="mt-3 space-y-2">
      {estado === "registrado" && (
        <button disabled={isPending} onClick={() => avanzar("recibido")} className="btn w-full">
          📦 Marcar equipo como ingresado
        </button>
      )}
      {estado !== "registrado" && nextEstado && (
        <button disabled={isPending} onClick={() => avanzar(nextEstado.key)} className="btn w-full">
          → Avanzar a "{nextEstado.label}"
        </button>
      )}
      {(estado === "reparacion" || estado === "reparado" || estado === "no_reparado") && (
        <button
          disabled={isPending}
          onClick={() => avanzar(estado === "no_reparado" ? "reparado" : "no_reparado")}
          className="w-full text-xs py-2.5 rounded-lg border border-bad/40 text-bad hover:bg-bad/10 transition disabled:opacity-50"
        >
          {estado === "no_reparado" ? "↺ En realidad sí se pudo reparar" : "✕ Marcar como no reparado"}
        </button>
      )}
      <div className="pt-2">
        <span className="block text-[11px] uppercase tracking-wide text-dim mb-1.5">O elegir estado manualmente</span>
        <select
          className="input"
          value={estado}
          disabled={isPending}
          onChange={(e) => avanzar(e.target.value)}
        >
          {ESTADOS.map((e) => (
            <option key={e.key} value={e.key}>
              {e.label}
            </option>
          ))}
          <option value={ESTADO_NO_REPARADO.key}>{ESTADO_NO_REPARADO.label}</option>
        </select>
      </div>
    </div>
  );
}
