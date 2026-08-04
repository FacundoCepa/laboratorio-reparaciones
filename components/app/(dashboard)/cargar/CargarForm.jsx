"use client";

import { useState, useRef } from "react";
import { registrarEquipo } from "./actions";
import { TIPOS_EQUIPO } from "@/lib/estados";

export default function CargarForm({ isStaff, clientes }) {
  const [nuevoCliente, setNuevoCliente] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData(formRef.current);
      const res = await registrarEquipo(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      setResultado(res);
      formRef.current.reset();
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar el equipo.");
    } finally {
      setSaving(false);
    }
  };

  if (resultado) {
    const { equipo, credencialesNuevoCliente } = resultado;
    return (
      <div className="card p-8 text-center">
        <div className="eyebrow">Equipo registrado</div>
        <h2 className="text-2xl font-black text-ink mb-1">Caso #{String(equipo.numero).padStart(5, "0")}</h2>
        <p className="text-sm text-muted mb-6">
          {equipo.tipo} · {equipo.marca} {equipo.modelo} · Serial {equipo.serial}
        </p>

        {credencialesNuevoCliente && (
          <div className="bg-surface2 border border-border rounded-lg p-4 mb-6 text-left">
            <div className="text-xs font-semibold text-accent mb-2">🔑 Credenciales del nuevo cliente</div>
            <div className="text-sm text-ink font-mono">Email: {credencialesNuevoCliente.email}</div>
            <div className="text-sm text-ink font-mono">Contraseña: {credencialesNuevoCliente.password}</div>
            <p className="text-[11px] text-dim mt-2">
              Compartíselas al cliente (y sugerile cambiarla) para que pueda hacer seguimiento online.
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <a href={`/etiqueta/${equipo.id}`} target="_blank" rel="noreferrer" className="btn">
            🖨️ Ver / imprimir etiqueta
          </a>
          <button className="btn-ghost" onClick={() => setResultado(null)}>
            Registrar otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit}>
      {isStaff && (
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Cliente</span>
            <button
              type="button"
              onClick={() => setNuevoCliente((v) => !v)}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {nuevoCliente ? "Elegir cliente existente" : "+ Nuevo cliente"}
            </button>
          </div>
          <input type="hidden" name="nuevo_cliente" value={nuevoCliente ? "on" : "off"} />
          {nuevoCliente ? (
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                  Nombre completo *
                </span>
                <input name="nombre_nuevo" required className="input" />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                  Email *
                </span>
                <input name="email_nuevo" type="email" required className="input" />
              </label>
              <label className="block col-span-2">
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                  Teléfono (para WhatsApp más adelante)
                </span>
                <input name="telefono_nuevo" className="input" placeholder="+54 9 11 ...." />
              </label>
            </div>
          ) : (
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                Seleccionar cliente *
              </span>
              <select name="cliente_existente" required={!nuevoCliente} className="input">
                <option value="">— Elegir —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.email})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <div className="card p-5 mb-5">
        <div className="eyebrow">Datos del equipo</div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Tipo de equipo *
            </span>
            <select name="tipo" required className="input" defaultValue="Notebook">
              {TIPOS_EQUIPO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Marca *</span>
            <input name="marca" required className="input" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Modelo *</span>
            <input name="modelo" required className="input" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Número de serie
            </span>
            <input name="serial" className="input" placeholder="Si no lo tenés, se genera uno" />
          </label>
        </div>
        <label className="block mt-4">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Falla reportada
          </span>
          <textarea name="falla" rows={2} className="input" placeholder="Describí el problema..." />
        </label>
      </div>

      <div className="card p-5 mb-5">
        <div className="eyebrow">Estado y accesorios</div>
        <div className="mt-3 mb-2">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Batería</span>
          <select name="bateria" className="input" defaultValue="no_tiene">
            <option value="si">Sí, con batería</option>
            <option value="interna">Interna (no removible)</option>
            <option value="no_tiene">No tiene</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {[
            ["cargador", "Cargador"],
            ["memoria", "Memoria"],
            ["disco", "Disco"],
            ["teclado", "Teclado"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface2 text-sm text-ink">
              <input type="checkbox" name={name} className="w-4 h-4 accent-accent" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="eyebrow">Fotos del equipo</div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <label className="block">
            <span className="block text-xs text-dim mb-1.5">Foto de frente</span>
            <input type="file" name="foto_frente" accept="image/*" capture="environment" className="input" />
          </label>
          <label className="block">
            <span className="block text-xs text-dim mb-1.5">Foto de reverso</span>
            <input type="file" name="foto_reverso" accept="image/*" capture="environment" className="input" />
          </label>
        </div>
      </div>

      {error && <div className="text-bad text-sm mb-4">{error}</div>}

      <button type="submit" disabled={saving} className="btn w-full">
        {saving ? "Guardando..." : "Registrar equipo"}
      </button>
    </form>
  );
}
