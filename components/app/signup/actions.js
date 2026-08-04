"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function crearCuentaCliente(formData) {
  try {
    const nombre = formData.get("nombre")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const telefono = formData.get("telefono")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!nombre || !email || !password) return { error: "Completá todos los campos obligatorios." };
    if (password.length < 6) return { error: "La contraseña tiene que tener al menos 6 caracteres." };

    const admin = createAdminClient();

    // Se crea ya confirmado: no dependemos del email de verificación de Supabase.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      if (createErr.code === "email_exists") {
        return { error: "Ya existe una cuenta con ese email. Probá iniciar sesión en vez de crear una nueva." };
      }
      return { error: `No se pudo crear la cuenta: ${createErr.message}` };
    }

    const { error: profileErr } = await admin.from("profiles").insert({
      id: created.user.id,
      role: "cliente",
      nombre,
      email,
      telefono: telefono || null,
    });
    if (profileErr) return { error: `Cuenta creada pero falló el perfil: ${profileErr.message}` };

    // Iniciamos sesión automáticamente para que quede logueado sin pasos extra.
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      // La cuenta quedó creada igual; que inicie sesión manualmente.
      return { created: true, autoLoginFailed: true };
    }

    return { created: true };
  } catch (err) {
    console.error("Error inesperado en crearCuentaCliente:", err);
    return { error: err.message || "Ocurrió un error inesperado." };
  }
}
