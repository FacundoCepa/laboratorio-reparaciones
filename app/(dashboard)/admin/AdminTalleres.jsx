"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearTaller, actualizarSuscripcion } from "./actions";

const aSlug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fecha = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("es-AR") : "Sin vencimiento");

function NuevoTaller({ baseUrl }) {
  const [abierto, setAbierto] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugTocado, setSlugTocado] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cred, setCred] = useState(null);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await crearTaller(new FormData(e.target));
    setBusy(false);
    if (res.error) return setError(res.error);
    setCred(res.credenciales);
    e.target.reset();
    setSlug("");
    setSlugTocado(false);
    router.refresh();
  };

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} className="btn w-full mb-6">
        + Dar de alta un taller nuevo
      </button>
    );
  }

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="eyebrow mb-0">Nuevo taller</div>
        <button onClick={() => { setAbierto(false); setCred(null); }} className="text-dim text-xs hover:text-ink">
          Cerrar
        </button>
      </div>

      {cred && (
        <div className="bg-surface2 border border-accent rounded-lg p-4 mb-4 text-sm">
          <div className="text-accent font-bold mb-2">✓ Taller creado. Pasale estos datos al dueño:</div>
          <div className="space-y-1 font-mono text-ink text-xs break-all">
            <div>Link: {baseUrl}/t/{cred.slug}</div>
            <div>Usuario: {cred.email}</div>
            <div>Contraseña: {cred.password}</div>
          </div>
          <div className="text-[11px] text-dim mt-2">
            La contraseña se muestra solo esta vez. Después la puede cambiar desde "¿Olvidaste tu contraseña?".
          </div>
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Nombre del taller *</span>
          <input
            name="nombre"
            required
            className="input"
            onChange={(e) => !slugTocado && setSlug(aSlug(e.target.value))}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Link del taller *</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-dim shrink-0">{baseUrl.replace(/^https?:\/\//, "")}/t/</span>
            <input
              name="slug"
              required
              className="input"
              value={slug}
              onChange={(e) => {
                setSlugTocado(true);
                setSlug(aSlug(e.target.value));
              }}
            />
          </div>
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Nombre del dueño/admin *</span>
          <input name="admin_nombre" required className="input" />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Email del admin *</span>
          <input name="admin_email" type="email" required className="input" />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Plan</span>
          <input name="plan" defaultValue="gratis" className="input" />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Vence el (opcional)</span>
          <input name="vence_at" type="date" className="input" />
        </label>
        {error && <div className="text-bad text-xs sm:col-span-2">{error}</div>}
        <button type="submit" disabled={busy} className="btn sm:col-span-2">
          {busy ? "Creando..." : "Crear taller y usuario admin"}
        </button>
      </form>
    </div>
  );
}

function FilaTaller({ t, baseUrl, esMio }) {
  const [abierto, setAbierto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const guardar = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await actualizarSuscripcion(t.id, new FormData(e.target));
    setBusy(false);
    setMsg(res.error ? `Error: ${res.error}` : "Guardado.");
    if (!res.error) router.refresh();
  };

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-ink text-sm">
            {t.nombre} {esMio && <span className="text-[10px] text-dim font-normal">(tu taller)</span>}
          </div>
          <div className="text-[11px] text-dim font-mono break-all">{baseUrl}/t/{t.slug}</div>
          <div className="text-[11px] text-dim mt-1">
            {t.usuarios} usuarios · {t.equipos} equipos · Plan {t.plan} · {fecha(t.vence_at)}
          </div>
          {t.admins.length > 0 && (
            <div className="text-[11px] text-dim">Admin: {t.admins.map((a) => `${a.nombre} (${a.email})`).join(", ")}</div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              t.habilitado ? "bg-[#1f3320] text-good" : "bg-[#3a1f1c] text-bad"
            }`}
          >
            {t.habilitado ? "ACTIVO" : t.activo ? "VENCIDO" : "SUSPENDIDO"}
          </span>
          <button onClick={() => setAbierto((v) => !v)} className="btn-ghost text-xs py-1.5 px-3">
            {abierto ? "Cerrar" : "Gestionar"}
          </button>
        </div>
      </div>

      {abierto && (
        <form onSubmit={guardar} className="mt-4 pt-4 border-t border-border2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="activo" defaultChecked={t.activo} disabled={esMio} className="w-4 h-4" />
            Activo
            {esMio && <input type="hidden" name="activo" value="on" />}
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Plan</span>
            <input name="plan" defaultValue={t.plan} className="input" />
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Vence el</span>
            <input name="vence_at" type="date" defaultValue={t.vence_at || ""} className="input" />
          </label>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button type="submit" disabled={busy} className="btn text-xs">
              Guardar
            </button>
            <span className="text-[11px] text-dim">Dejá la fecha vacía para que no venza nunca.</span>
          </div>
          {msg && (
            <div className={`sm:col-span-3 text-xs ${msg.startsWith("Error") ? "text-bad" : "text-good"}`}>{msg}</div>
          )}
        </form>
      )}
    </div>
  );
}

export default function AdminTalleres({ talleres, baseUrl, miTallerId }) {
  return (
    <div>
      <NuevoTaller baseUrl={baseUrl} />
      <div className="space-y-2.5">
        {talleres.map((t) => (
          <FilaTaller key={t.id} t={t} baseUrl={baseUrl} esMio={t.id === miTallerId} />
        ))}
      </div>
    </div>
  );
}
