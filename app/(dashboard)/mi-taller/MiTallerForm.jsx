"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { guardarDatosTaller, subirImagenTaller, quitarImagenTaller } from "./actions";

const CONDICIONES_IVA = ["", "Responsable Inscripto", "Monotributista", "Exento", "Consumidor Final"];

function Campo({ label, name, defaultValue, placeholder, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue || ""} placeholder={placeholder} className="input" />
    </label>
  );
}

function ImagenTaller({ tipo, titulo, ayuda, url, alto }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  const subir = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    fd.append("tipo", tipo);
    fd.append("imagen", file);
    const res = await subirImagenTaller(fd);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (res.error) return setMsg(`Error: ${res.error}`);
    router.refresh();
  };

  const quitar = async () => {
    setBusy(true);
    setMsg("");
    const res = await quitarImagenTaller(tipo);
    setBusy(false);
    if (res.error) return setMsg(`Error: ${res.error}`);
    router.refresh();
  };

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted mb-1">{titulo}</div>
      <div className="text-[11px] text-dim mb-2">{ayuda}</div>
      {url ? (
        <div className="bg-surface2 border border-border2 rounded-lg p-3 mb-2 flex items-center justify-center">
          <img src={url} alt={titulo} className={`${alto} max-w-full object-contain`} />
        </div>
      ) : (
        <div className="bg-surface2 border border-dashed border-border2 rounded-lg p-4 mb-2 text-center text-xs text-dim">
          Sin {tipo === "logo" ? "logo" : "banner"}
        </div>
      )}
      <div className="flex gap-2">
        <label className={`btn-ghost text-xs py-2 px-3 cursor-pointer ${busy ? "opacity-40 pointer-events-none" : ""}`}>
          {busy ? "Subiendo..." : url ? "Cambiar imagen" : "Subir imagen"}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={subir} />
        </label>
        {url && (
          <button type="button" disabled={busy} onClick={quitar} className="btn-ghost text-xs py-2 px-3">
            Quitar
          </button>
        )}
      </div>
      {msg && <div className="text-bad text-xs mt-2">{msg}</div>}
    </div>
  );
}

export default function MiTallerForm({ taller }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const guardar = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await guardarDatosTaller(new FormData(e.target));
    setBusy(false);
    setMsg(res.error ? `Error: ${res.error}` : "Datos guardados.");
    if (!res.error) router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="eyebrow">Imagen</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
          <ImagenTaller
            tipo="logo"
            titulo="Logo"
            ayuda="Aparece arriba en el sistema, en el login y en el informe impreso."
            url={taller.logo_url}
            alto="h-14"
          />
          <ImagenTaller
            tipo="banner"
            titulo="Banner"
            ayuda="Lo ven tus clientes abajo de sus equipos (ej: tu tienda o una promo)."
            url={taller.banner_url}
            alto="h-24"
          />
        </div>
      </div>

      <form onSubmit={guardar} className="space-y-5">
        <div className="card p-5">
          <div className="eyebrow">Datos del taller</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Campo label="Nombre del taller *" name="nombre" defaultValue={taller.nombre} className="sm:col-span-2" />
            <Campo
              label="Nombre corto"
              name="nombre_corto"
              defaultValue={taller.nombre_corto}
              placeholder="Para el asunto de los mails"
            />
            <Campo label="Horarios" name="horarios" defaultValue={taller.horarios} placeholder="Lun a Vie 9 a 18 hs" />
            <Campo label="Dirección" name="direccion" defaultValue={taller.direccion} className="sm:col-span-2" />
            <Campo label="Teléfono" name="telefono" defaultValue={taller.telefono} />
            <Campo label="WhatsApp" name="whatsapp" defaultValue={taller.whatsapp} placeholder="+54 9 ..." />
            <Campo
              label="Email del taller"
              name="email"
              type="email"
              defaultValue={taller.email}
              placeholder="Las respuestas de los clientes llegan acá"
              className="sm:col-span-2"
            />
            <Campo
              label="Link del banner"
              name="banner_link"
              defaultValue={taller.banner_link}
              placeholder="https://tutienda.com (opcional)"
              className="sm:col-span-2"
            />
          </div>
        </div>

        <div className="card p-5">
          <div className="eyebrow">Datos fiscales</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Campo label="Razón social" name="razon_social" defaultValue={taller.razon_social} className="sm:col-span-2" />
            <Campo label="CUIT" name="cuit" defaultValue={taller.cuit} placeholder="20-12345678-9" />
            <label className="block">
              <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">Condición frente al IVA</span>
              <select name="condicion_iva" defaultValue={taller.condicion_iva || ""} className="input">
                {CONDICIONES_IVA.map((c) => (
                  <option key={c} value={c}>
                    {c || "— Elegir —"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="card p-5">
          <div className="eyebrow">Garantía y condiciones</div>
          <p className="text-[11px] text-dim mt-1 mb-3">
            Se imprime al pie del comprobante de ingreso y del informe de reparación.
          </p>
          <textarea
            name="texto_garantia"
            defaultValue={taller.texto_garantia || ""}
            rows={5}
            className="input"
            placeholder="Ej: La garantía cubre únicamente el trabajo realizado. Pasados 90 días sin retirar el equipo, el taller no se responsabiliza por el mismo."
          />
        </div>

        {msg && <div className={msg.startsWith("Error") ? "text-bad text-xs" : "text-good text-xs"}>{msg}</div>}
        <button type="submit" disabled={busy} className="btn w-full">
          {busy ? "Guardando..." : "Guardar datos del taller"}
        </button>
      </form>
    </div>
  );
}
