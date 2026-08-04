"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function randomSerial() {
  return (
    "SN-" +
    Math.random().toString(36).slice(2, 8).toUpperCase() +
    "-" +
    Date.now().toString().slice(-4)
  );
}
function randomPassword() {
  return Math.random().toString(36).slice(2, 10);
}

export async function registrarEquipo(formData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isStaff = profile.role === "admin" || profile.role === "tecnico";

  let clienteId = user.id;
  let credencialesNuevoCliente = null;

  if (isStaff) {
    const clienteExistenteId = formData.get("cliente_existente");
    const esNuevo = formData.get("nuevo_cliente") === "on";

    if (esNuevo) {
      const nombreNuevo = formData.get("nombre_nuevo")?.toString().trim();
      const emailNuevo = formData.get("email_nuevo")?.toString().trim();
      const telefonoNuevo = formData.get("telefono_nuevo")?.toString().trim();
      if (!nombreNuevo || !emailNuevo) throw new Error("Faltan datos del cliente nuevo");

      const admin = createAdminClient();
      const tempPassword = randomPassword();
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: emailNuevo,
        password: tempPassword,
        email_confirm: true,
      });
      if (createErr) throw createErr;

      await admin.from("profiles").insert({
        id: created.user.id,
        role: "cliente",
        nombre: nombreNuevo,
        email: emailNuevo,
        telefono: telefonoNuevo || null,
      });

      clienteId = created.user.id;
      credencialesNuevoCliente = { email: emailNuevo, password: tempPassword };
    } else {
      if (!clienteExistenteId) throw new Error("Elegí un cliente");
      clienteId = clienteExistenteId;
    }
  }

  // Subida de fotos (si vienen) al bucket "equipos-fotos"
  async function subirFoto(file, prefijo) {
    if (!file || file.size === 0) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${clienteId}/${prefijo}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("equipos-fotos").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      console.error("Error subiendo foto:", error);
      return null;
    }
    const { data: pub } = supabase.storage.from("equipos-fotos").getPublicUrl(path);
    return pub.publicUrl;
  }

  const fotoFrenteFile = formData.get("foto_frente");
  const fotoReversoFile = formData.get("foto_reverso");
  const [fotoFrenteUrl, fotoReversoUrl] = await Promise.all([
    subirFoto(fotoFrenteFile, "frente"),
    subirFoto(fotoReversoFile, "reverso"),
  ]);

  const serial = formData.get("serial")?.toString().trim() || randomSerial();

  const { data: equipo, error } = await supabase
    .from("equipos")
    .insert({
      cliente_id: clienteId,
      tipo: formData.get("tipo"),
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      serial,
      falla: formData.get("falla") || null,
      bateria: formData.get("bateria"),
      cargador: formData.get("cargador") === "on",
      memoria: formData.get("memoria") === "on",
      disco: formData.get("disco") === "on",
      teclado: formData.get("teclado") === "on",
      foto_frente_url: fotoFrenteUrl,
      foto_reverso_url: fotoReversoUrl,
      estado: "registrado",
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("historial_estados").insert({ equipo_id: equipo.id, estado: "registrado" });

  revalidatePath("/panel");
  revalidatePath("/equipos");
  revalidatePath("/mis-equipos");

  return { equipo, credencialesNuevoCliente };
}
