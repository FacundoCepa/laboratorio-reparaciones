"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarEquipo } from "./actions";

export default function EliminarEquipoBoton({ equipo }) {
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const eliminar = async () => {
    const confirmado = confirm(
      `¿Seguro que querés eliminar el caso #${String(equipo.numero).padStart(5, "0")} (${equipo.tipo} ${equipo.marca} ${equipo.modelo})?\n\nEsto borra también su historial, notificaciones y fotos. No se puede deshacer.`
    );
    if (!confirmado) return;

    setBorrando(true);
    setError("");
    const res = await eliminarEquipo(equipo.id);
    if (res.error) {
      setBorrando(false);
      setError(res.error);
      return;
    }
    router.push("/equipos");
    router.refresh();
  };

  return (
    <div>
      <button
        onClick={eliminar}
        disabled={borrando}
        className="w-full text-xs py-2.5 rounded-lg border border-bad/40 text-bad hover:bg-bad/10 transition disabled:opacity-50"
      >
        {borrando ? "Eliminando..." : "🗑️ Eliminar este equipo"}
      </button>
      {error && <div className="text-bad text-xs mt-2 text-center">{error}</div>}
    </div>
  );
}
