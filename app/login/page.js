"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NEGOCIO } from "@/lib/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/panel");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-bg font-bold">
            {NEGOCIO.emoji}
          </div>
          <div>
            <div className="font-bold text-ink leading-tight">{NEGOCIO.nombreCorto}</div>
            <div className="text-[11px] text-dim uppercase tracking-wide leading-tight">
              Gestión de reparaciones
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="eyebrow">Acceso</div>
          <h1 className="text-lg font-bold text-ink mb-5">Iniciar sesión</h1>
          <form onSubmit={submit}>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Email</span>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </label>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                Contraseña
              </span>
              <input
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <div className="text-bad text-xs mb-4">{error}</div>}
            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
        <div className="mt-4 text-center text-xs text-dim">
          ¿Sos cliente y todavía no tenés cuenta?{" "}
          <a href="/signup" className="text-accent font-semibold hover:underline">
            Creá tu cuenta
          </a>
        </div>
      </div>
    </div>
  );
}
