"use client";

import { useState } from "react";
import { subirFotoEquipo } from "./actions";

export default function FotosForm({ equipoId, which, urlActual }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (file) => {
    if (!file) return;
    setSubiendo(true);
    setError("");
    const formData = new FormData();
    formData.set("which", which);
    formData.set("foto", file);
    const res = await subirFotoEquipo(equipoId, formData);
    setSubiendo(false);
    if (res.error) setError(res.error);
  };

  return (
    <label className="cursor-pointer">
      <div className="text-[11px] text-dim mb-1 text-center">
        {urlActual ? (subiendo ? "Subiendo..." : "Cambiar foto") : subiendo ? "Subiendo..." : "+ Agregar foto"}
      </div>
      {!urlActual && (
        <div className="aspect-video rounded-lg border-2 border-dashed border-border2 flex items-center justify-center text-dim text-xs">
          {subiendo ? "..." : "📷"}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files[0])}
      />
      {error && <div className="text-bad text-[11px] mt-1">{error}</div>}
    </label>
  );
}
