"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NEGOCIO } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError("No pudimos enviar el email. Probá de nuevo en unos minutos.");
      return;
    }
    setEnviado(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo-argentina-express.webp" alt={NEGOCIO.nombre} className="h-16 object-contain" />
        </div>
        <div className="card p-6">
          <div className="eyebrow">Acceso</div>
          <h1 className="text-lg font-bold text-ink mb-5">Recuperar contraseña</h1>
          {enviado ? (
            <p className="text-sm text-ink">
              Si ese email tiene una cuenta, te llegó un link para elegir una contraseña nueva. Revisá también la
              carpeta de spam.
            </p>
          ) : (
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
              {error && <div className="text-bad text-xs mb-4">{error}</div>}
              <button type="submit" disabled={loading} className="btn w-full">
                {loading ? "Enviando..." : "Enviar link de recuperación"}
              </button>
            </form>
          )}
          <p className="text-xs text-dim text-center mt-4">
            <a href="/login" className="text-accent font-semibold hover:underline">
              Volver a iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
