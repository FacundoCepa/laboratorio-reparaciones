"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function randomPassword() {
  return Math.random().toString(36).slice(2, 10);
}

async function checkIsStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "tecnico")) return null;
  return profile;
}

export async function resetearPassword(userId, nuevaPasswordManual) {
  const staff = await checkIsStaff();
  if (!staff) return { error: "No autorizado." };

  const nuevaPassword = nuevaPasswordManual?.trim() || randomPassword();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: nuevaPassword });
  if (error) return { error: error.message };

  return { ok: true, nuevaPassword };
}

export async function actualizarPerfil(userId, formData) {
  const staff = await checkIsStaff();
  if (!staff) return { error: "No autorizado." };

  const admin = createAdminClient();
  const nuevoEmail = formData.get("email")?.toString().trim();
  const nombre = formData.get("nombre")?.toString().trim();
  const telefono = formData.get("telefono")?.toString().trim() || null;

  if (!nuevoEmail || !nombre) return { error: "Nombre y email son obligatorios." };

  // Si cambió el email, primero lo actualizamos en el sistema de login.
  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    email: nuevoEmail,
    email_confirm: true,
  });
  if (authErr) {
    if (authErr.code === "email_exists") {
      return { error: `Ese email (${nuevoEmail}) ya lo está usando otra cuenta.` };
    }
    return { error: `No se pudo actualizar el email: ${authErr.message}` };
  }

  const { error } = await admin
    .from("profiles")
    .update({ nombre, telefono, email: nuevoEmail })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { ok: true };
}
