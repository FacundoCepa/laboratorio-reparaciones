"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { enviarEmail, plantillaEmail, nombreRemitente, esc } from "@/lib/email";
import { requireStaff } from "@/lib/taller";

function randomPassword() {
  return Math.random().toString(36).slice(2, 10);
}

// Verifica que quien opera sea staff de un taller habilitado y que el
// usuario a modificar pertenezca a ESE MISMO taller.
async function checkStaffYMismoTaller(userId) {
  const ctx = await requireStaff();
  if (ctx.error) return ctx;
  const admin = createAdminClient();
  const { data: objetivo } = await admin.from("profiles").select("id, nombre, email, taller_id").eq("id", userId).single();
  if (!objetivo || objetivo.taller_id !== ctx.profile.taller_id) return { error: "No autorizado." };
  return { ...ctx, admin, objetivo };
}

export async function resetearPassword(userId, nuevaPasswordManual) {
  const chk = await checkStaffYMismoTaller(userId);
  if (chk.error) return { error: chk.error };
  const { admin } = chk;

  const nuevaPassword = nuevaPasswordManual?.trim() || randomPassword();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: nuevaPassword });
  if (error) return { error: error.message };

  return { ok: true, nuevaPassword };
}

export async function actualizarPerfil(userId, formData) {
  const chk = await checkStaffYMismoTaller(userId);
  if (chk.error) return { error: chk.error };
  const { admin } = chk;

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

export async function enviarMailPrueba(userId) {
  const chk = await checkStaffYMismoTaller(userId);
  if (chk.error) return { error: chk.error };
  const { objetivo: perfil, taller } = chk;
  if (!perfil.email) return { error: "Este usuario no tiene email cargado." };

  const resultado = await enviarEmail({
    to: perfil.email,
    taller,
    subject: `${nombreRemitente(taller)} — Mail de prueba`,
    html: plantillaEmail(
      taller,
      "Mail de prueba",
      `<p style="font-size:15px; color:#222;">Este es un mail de prueba enviado a <b>${esc(perfil.email)}</b> para confirmar que la dirección cargada para <b>${esc(perfil.nombre)}</b> es correcta.</p>`
    ),
  });

  if (resultado.error) return { error: resultado.error };
  if (resultado.simulated) {
    return { error: "El envío de mails no está configurado en este entorno (modo simulado), no se mandó nada de verdad." };
  }
  return { ok: true, emailUsado: perfil.email };
}
