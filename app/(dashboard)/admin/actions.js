"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getContexto } from "@/lib/taller";

async function requireSuperadmin() {
  const ctx = await getContexto();
  if (!ctx?.profile?.superadmin) return { error: "No autorizado." };
  return ctx;
}

function randomPassword() {
  return Math.random().toString(36).slice(2, 10);
}

const SLUG_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function crearTaller(formData) {
  try {
    const ctx = await requireSuperadmin();
    if (ctx.error) return { error: ctx.error };

    const nombre = formData.get("nombre")?.toString().trim();
    const slug = formData.get("slug")?.toString().trim().toLowerCase();
    const adminNombre = formData.get("admin_nombre")?.toString().trim();
    const adminEmail = formData.get("admin_email")?.toString().trim().toLowerCase();
    const plan = formData.get("plan")?.toString().trim() || "gratis";
    const venceAt = formData.get("vence_at")?.toString() || null;

    if (!nombre || !slug || !adminNombre || !adminEmail) return { error: "Completá todos los campos obligatorios." };
    if (!SLUG_OK.test(slug)) return { error: "El link solo puede tener minúsculas, números y guiones (ej: taller-perez)." };

    const admin = createAdminClient();

    const { data: existe } = await admin.from("talleres").select("id").eq("slug", slug).maybeSingle();
    if (existe) return { error: `Ya existe un taller con el link "${slug}".` };

    const { data: taller, error: tErr } = await admin
      .from("talleres")
      .insert({ nombre, slug, plan, vence_at: venceAt, email: adminEmail })
      .select()
      .single();
    if (tErr) return { error: `No se pudo crear el taller: ${tErr.message}` };

    const password = randomPassword();
    const { data: created, error: uErr } = await admin.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
    });
    if (uErr) {
      await admin.from("talleres").delete().eq("id", taller.id);
      if (uErr.code === "email_exists") {
        return { error: `El email ${adminEmail} ya tiene una cuenta en el sistema. Usá otro email para el admin del taller.` };
      }
      return { error: `No se pudo crear el usuario admin: ${uErr.message}` };
    }

    const { error: pErr } = await admin.from("profiles").insert({
      id: created.user.id,
      role: "admin",
      nombre: adminNombre,
      email: adminEmail,
      taller_id: taller.id,
    });
    if (pErr) {
      await admin.auth.admin.deleteUser(created.user.id);
      await admin.from("talleres").delete().eq("id", taller.id);
      return { error: `No se pudo crear el perfil del admin: ${pErr.message}` };
    }

    revalidatePath("/admin");
    return { ok: true, credenciales: { email: adminEmail, password, slug } };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al crear el taller." };
  }
}

export async function actualizarSuscripcion(tallerId, formData) {
  try {
    const ctx = await requireSuperadmin();
    if (ctx.error) return { error: ctx.error };

    const patch = {
      activo: formData.get("activo") === "on",
      plan: formData.get("plan")?.toString().trim() || "gratis",
      vence_at: formData.get("vence_at")?.toString() || null,
    };

    // Protección: no te podés suspender a vos mismo.
    if (tallerId === ctx.profile.taller_id && !patch.activo) {
      return { error: "No podés suspender tu propio taller." };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("talleres").update(patch).eq("id", tallerId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "No se pudo actualizar." };
  }
}
