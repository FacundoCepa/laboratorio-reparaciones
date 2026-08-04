"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NEGOCIO } from "@/lib/config";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("La contraseña tiene que tener al menos 6 caracteres.");
    if (password !== password2) return setError("Las contraseñas no coinciden.");

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(
        "No pudimos actualizar la contraseña. El link puede haber vencido — pedí uno nuevo desde 'Olvidé mi contraseña'."
      );
      return;
    }
    router.push("/panel");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo-argentina-express.webp" alt={NEGOCIO.nombre} className="h-16 object-contain" />
        </div>
        <div className="card p-6">
          <div className="eyebrow">Acceso</div>
          <h1 className="text-lg font-bold text-ink mb-5">Elegí tu nueva contraseña</h1>
          <form onSubmit={submit}>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                Nueva contraseña
              </span>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </label>
            <label className="block mb-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                Repetila
              </span>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </label>
            {error && <div className="text-bad text-xs mb-4">{error}</div>}
            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
