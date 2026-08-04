"use client";

import { useState } from "react";
import { resetearPassword, actualizarPerfil } from "./actions";

export default function UsuariosTable({ usuarios }) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(null); // id del usuario con el panel desplegado
  const [passwordGenerada, setPasswordGenerada] = useState({}); // { [id]: password }
  const [passwordManual, setPasswordManual] = useState({});
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState({});

  const filtrados = usuarios.filter((u) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [u.nombre, u.email, u.role].some((x) => (x || "").toLowerCase().includes(s));
  });

  const resetear = async (id, usarManual) => {
    setBusy(id);
    setMsg((m) => ({ ...m, [id]: "" }));
    const res = await resetearPassword(id, usarManual ? passwordManual[id] : null);
    setBusy(null);
    if (res.error) {
      setMsg((m) => ({ ...m, [id]: `Error: ${res.error}` }));
      return;
    }
    setPasswordGenerada((p) => ({ ...p, [id]: res.nuevaPassword }));
  };

  const guardarPerfil = async (id, e) => {
    e.preventDefault();
    setBusy(id);
    const formData = new FormData(e.target);
    const res = await actualizarPerfil(id, formData);
    setBusy(null);
    setMsg((m) => ({ ...m, [id]: res.error ? `Error: ${res.error}` : "Datos actualizados." }));
  };

  return (
    <div>
      <input
        className="input mb-5"
        placeholder="Buscar por nombre, email o rol..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="space-y-2.5">
        {filtrados.map((u) => (
          <div key={u.id} className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-ink text-sm truncate">{u.nombre}</div>
                <div className="text-xs text-dim truncate">
                  {u.email} · <span className="uppercase">{u.role}</span>
                  {u.telefono ? ` · ${u.telefono}` : ""}
                </div>
              </div>
              <button
                onClick={() => setAbierto(abierto === u.id ? null : u.id)}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                {abierto === u.id ? "Cerrar" : "Gestionar"}
              </button>
            </div>

            {abierto === u.id && (
              <div className="mt-4 pt-4 border-t border-border2 space-y-4">
                <form onSubmit={(e) => guardarPerfil(u.id, e)} className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Nombre</span>
                    <input name="nombre" defaultValue={u.nombre} className="input" />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Teléfono</span>
                    <input name="telefono" defaultValue={u.telefono || ""} className="input" />
                  </label>
                  <button type="submit" disabled={busy === u.id} className="btn-ghost col-span-2 text-xs">
                    Guardar datos
                  </button>
                </form>

                <div>
                  <span className="block text-[11px] uppercase tracking-wide text-muted mb-2">
                    Restablecer contraseña
                  </span>
                  <div className="flex gap-2 mb-2">
                    <button
                      disabled={busy === u.id}
                      onClick={() => resetear(u.id, false)}
                      className="btn text-xs py-2 px-3"
                    >
                      Generar contraseña nueva
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="O escribí una contraseña específica"
                      value={passwordManual[u.id] || ""}
                      onChange={(e) => setPasswordManual((p) => ({ ...p, [u.id]: e.target.value }))}
                    />
                    <button
                      disabled={busy === u.id || !passwordManual[u.id]}
                      onClick={() => resetear(u.id, true)}
                      className="btn-ghost text-xs py-2 px-3 shrink-0"
                    >
                      Aplicar esta
                    </button>
                  </div>

                  {passwordGenerada[u.id] && (
                    <div className="bg-surface2 border border-accent rounded-lg p-3 mt-3">
                      <div className="text-[11px] text-accent font-semibold mb-1">Nueva contraseña</div>
                      <div className="font-mono text-ink text-sm">{passwordGenerada[u.id]}</div>
                      <p className="text-[11px] text-dim mt-1">
                        Compartísela a {u.nombre} para que inicie sesión.
                      </p>
                    </div>
                  )}
                </div>

                {msg[u.id] && (
                  <div className={msg[u.id].startsWith("Error") ? "text-bad text-xs" : "text-good text-xs"}>
                    {msg[u.id]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
