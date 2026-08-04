"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { crearCuentaCliente } from "./actions";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(formRef.current);
    const res = await crearCuentaCliente(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.autoLoginFailed) {
      router.push("/login");
      return;
    }
    router.push("/cargar");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-bg font-bold">🔧</div>
          <div>
            <div className="font-bold text-ink leading-tight">Laboratorio</div>
            <div className="text-[11px] text-dim uppercase tracking-wide leading-tight">Crear cuenta de cliente</div>
          </div>
        </div>
        <div className="card p-6">
          <div className="eyebrow">Nuevo aquí</div>
          <h1 className="text-lg font-bold text-ink mb-5">Creá tu cuenta</h1>
          <form ref={formRef} onSubmit={submit}>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                Nombre completo *
              </span>
              <input name="nombre" required className="input" autoFocus />
            </label>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Email *</span>
              <input name="email" type="email" required className="input" />
            </label>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                Teléfono
              </span>
              <input name="telefono" className="input" placeholder="+54 9 11 ...." />
            </label>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                Contraseña *
              </span>
              <input name="password" type="password" required minLength={6} className="input" />
            </label>
            {error && <div className="text-bad text-xs mb-4">{error}</div>}
            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? "Creando cuenta..." : "Crear cuenta y registrar mi equipo"}
            </button>
          </form>
          <p className="text-xs text-dim text-center mt-4">
            ¿Ya tenés cuenta?{" "}
            <a href="/login" className="text-accent font-semibold hover:underline">
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
