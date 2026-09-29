import { createClient, createAdminClient } from "@/lib/supabase/server";

// ¿El taller puede usar el sistema? (activo y no vencido)
export function tallerHabilitado(taller) {
  if (!taller || !taller.activo) return false;
  if (!taller.vence_at) return true;
  const hoy = new Date().toISOString().slice(0, 10);
  return taller.vence_at >= hoy;
}

// Días que faltan para el vencimiento (null si no vence).
export function diasParaVencer(taller) {
  if (!taller?.vence_at) return null;
  const hoy = new Date(new Date().toISOString().slice(0, 10));
  const vence = new Date(taller.vence_at);
  return Math.round((vence - hoy) / 86400000);
}

export function nombreCorto(taller) {
  return taller?.nombre_corto || taller?.nombre || "Taller";
}

// Usuario logueado + su perfil + su taller. Devuelve null si no hay sesión.
export async function getContexto() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return { user, profile: null, taller: null };

  // Se lee con el cliente admin para poder mostrar el aviso aunque el
  // taller esté suspendido.
  const admin = createAdminClient();
  const { data: taller } = await admin.from("talleres").select("*").eq("id", profile.taller_id).single();

  const isStaff = profile.role === "admin" || profile.role === "tecnico";
  return { user, profile, taller, isStaff };
}

// Para acciones de staff: verifica sesión, rol y taller habilitado.
export async function requireStaff({ soloAdmin = false } = {}) {
  const ctx = await getContexto();
  if (!ctx?.profile) return { error: "No autenticado. Volvé a iniciar sesión." };
  if (!ctx.isStaff) return { error: "No autorizado." };
  if (soloAdmin && ctx.profile.role !== "admin") return { error: "Solo el administrador del taller puede hacer esto." };
  if (!tallerHabilitado(ctx.taller)) return { error: "El taller está suspendido o vencido." };
  return ctx;
}

// Datos públicos de un taller por su slug (para /t/<slug>, login, registro).
export async function getTallerPorSlug(slug) {
  if (!slug) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("talleres")
    .select("id, slug, nombre, nombre_corto, logo_url, activo, vence_at")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  return data;
}
