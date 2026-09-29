"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/taller";

const CAMPOS = [
  "nombre",
  "nombre_corto",
  "direccion",
  "telefono",
  "whatsapp",
  "email",
  "horarios",
  "razon_social",
  "cuit",
  "condicion_iva",
  "texto_garantia",
  "banner_link",
];

function revalidarTodo() {
  revalidatePath("/", "layout");
}

export async function guardarDatosTaller(formData) {
  try {
    const ctx = await requireStaff({ soloAdmin: true });
    if (ctx.error) return { error: ctx.error };

    const patch = {};
    for (const c of CAMPOS) patch[c] = formData.get(c)?.toString().trim() || null;
    if (!patch.nombre) return { error: "El nombre del taller es obligatorio." };
    if (patch.banner_link && !/^https?:\/\//i.test(patch.banner_link)) {
      patch.banner_link = `https://${patch.banner_link}`;
    }

    const admin = createAdminClient();
    const { error } = await admin.from("talleres").update(patch).eq("id", ctx.profile.taller_id);
    if (error) return { error: error.message };

    revalidarTodo();
    return { ok: true };
  } catch (err) {
    return { error: err.message || "No se pudieron guardar los datos." };
  }
}

export async function subirImagenTaller(formData) {
  try {
    const ctx = await requireStaff({ soloAdmin: true });
    if (ctx.error) return { error: ctx.error };

    const tipo = formData.get("tipo")?.toString();
    const file = formData.get("imagen");
    if (tipo !== "logo" && tipo !== "banner") return { error: "Tipo de imagen inválido." };
    if (!file || file.size === 0) return { error: "No se recibió ninguna imagen." };
    if (!file.type?.startsWith("image/")) return { error: "El archivo tiene que ser una imagen." };
    if (file.size > 5 * 1024 * 1024) return { error: "La imagen es muy pesada (máximo 5 MB)." };

    const admin = createAdminClient();
    const ext = (file.name?.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${ctx.profile.taller_id}/${tipo}-${Date.now()}.${ext}`;
    const { error: upErr } = await admin.storage.from("talleres-branding").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) return { error: upErr.message };

    const { data: pub } = admin.storage.from("talleres-branding").getPublicUrl(path);
    const columna = tipo === "logo" ? "logo_url" : "banner_url";
    const { error } = await admin.from("talleres").update({ [columna]: pub.publicUrl }).eq("id", ctx.profile.taller_id);
    if (error) return { error: error.message };

    revalidarTodo();
    return { ok: true, url: pub.publicUrl };
  } catch (err) {
    return { error: err.message || "No se pudo subir la imagen." };
  }
}

export async function quitarImagenTaller(tipo) {
  try {
    const ctx = await requireStaff({ soloAdmin: true });
    if (ctx.error) return { error: ctx.error };
    if (tipo !== "logo" && tipo !== "banner") return { error: "Tipo de imagen inválido." };

    const admin = createAdminClient();
    const columna = tipo === "logo" ? "logo_url" : "banner_url";
    const { error } = await admin.from("talleres").update({ [columna]: null }).eq("id", ctx.profile.taller_id);
    if (error) return { error: error.message };

    revalidarTodo();
    return { ok: true };
  } catch (err) {
    return { error: err.message || "No se pudo quitar la imagen." };
  }
}
