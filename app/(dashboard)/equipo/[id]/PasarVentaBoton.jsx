"use client";

import { useState } from "react";
import { pasarVentaAlSistema } from "./actions";

export default function PasarVentaBoton({ equipo }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [numero, setNumero] = useState(equipo.venta_erp_numero || null);

  if (numero) {
    return (
      <div className="text-xs text-good bg-good/10 border border-good/30 rounded-lg px-3 py-2 mt-2">
        ✅ Ya se pasó como venta #{numero} en Argentina Express.
      </div>
    );
  }

  const manoObraOk = Number(equipo.costo_mano_obra || 0) > 0;

  async function handleClick() {
    setLoading(true);
    setError("");
    const res = await pasarVentaAlSistema(equipo.id);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setNumero(res.numero);
  }

  return (
    <div className="mt-2">
      <button type="button" onClick={handleClick} disabled={loading || !manoObraOk} className="btn-ghost w-full">
        {loading ? "Pasando venta..." : "💼 Pasar venta al sistema"}
      </button>
      {!manoObraOk && (
        <p className="text-[11px] text-dim mt-1">
          Cargá y guardá el costo de mano de obra en el informe antes de pasar la venta.
        </p>
      )}
      {error && <div className="text-bad text-xs mt-1">{error}</div>}
    </div>
  );
}
