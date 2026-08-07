"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { enviarNotificacionEstado, enviarEmail } from "@/lib/email";
import { MSG_ESTADO } from "@/lib/estados";
import { NEGOCIO } from "@/lib/config";

export async function actualizarDetalleTecnico(equipoId, formData) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("equipos")
      .update({
        falla: formData.get("falla")?.toString().trim() || null,
        bateria: formData.get("bateria")?.toString() || "no_tiene",
        cargador: formData.get("cargador") === "on",
        memoria: formData.get("memoria") === "on",
        disco: formData.get("disco") === "on",
        teclado: formData.get("teclado") === "on",
      })
      .eq("id", equipoId);

    if (error) return { error: error.message };

    revalidatePath(`/equipo/${equipoId}`);
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al guardar el detalle técnico." };
  }
}

export async function marcarEntregadoAdmin(equipoId) {
  try {
    const supabase = createClient();
    const { data: equipo, error: fetchErr } = await supabase
      .from("equipos")
      .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email)")
      .eq("id", equipoId)
      .single();
    if (fetchErr || !equipo) return { error: "Equipo no encontrado." };

    const patch = { entregado_admin_at: new Date().toISOString() };
    const finalizarAhora = Boolean(equipo.recibido_cliente_at);
    if (finalizarAhora) patch.estado = "entregado";

    const { error } = await supabase.from("equipos").update(patch).eq("id", equipoId);
    if (error) return { error: error.message };

    if (finalizarAhora) {
      await supabase.from("historial_estados").insert({ equipo_id: equipoId, estado: "entregado" });
    }

    const nombre = equipo.cliente?.nombre?.split(" ")[0] || "cliente";
    const texto = finalizarAhora
      ? `¡Listo ${nombre}! Quedó confirmada la entrega de tu equipo (caso #${equipo.numero}).`
      : `Hola ${nombre}, marcamos tu equipo (caso #${equipo.numero}) como entregado. ¿Lo recibiste? Confirmalo desde tu cuenta.`;

    await supabase.from("notificaciones").insert({ equipo_id: equipoId, texto, canal: "email" });

    if (equipo.cliente?.email) {
      await enviarEmail({
        to: equipo.cliente.email,
        subject: `${NEGOCIO.nombreCorto} — ${finalizarAhora ? "Entrega confirmada" : "¿Recibiste tu equipo?"} (Caso #${String(equipo.numero).padStart(5, "0")})`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
            <p style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#999;">${NEGOCIO.nombre}</p>
            <h2 style="color:#E8873A;">Caso #${String(equipo.numero).padStart(5, "0")}</h2>
            <p style="font-size:15px; color:#222;">${texto}</p>
          </div>
        `,
      });
    }

    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath(`/mis-equipos/${equipoId}`);
    revalidatePath("/panel");
    revalidatePath("/equipos");
    revalidatePath("/entregados");

    return { ok: true, finalizado: finalizarAhora };
  } catch (err) {
    return { error: err.message || "Ocurrió un error." };
  }
}

export async function actualizarDatosEquipo(equipoId, formData) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("equipos")
      .update({
        tipo: formData.get("tipo")?.toString(),
        marca: formData.get("marca")?.toString().trim(),
        modelo: formData.get("modelo")?.toString().trim(),
        serial: formData.get("serial")?.toString().trim(),
      })
      .eq("id", equipoId);

    if (error) return { error: error.message };

    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath("/equipos");
    revalidatePath("/historial");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al guardar los datos del equipo." };
  }
}

export async function eliminarEquipo(equipoId) {
  try {
    const supabase = createClient();

    const { data: equipo } = await supabase
      .from("equipos")
      .select("foto_frente_url, foto_reverso_url")
      .eq("id", equipoId)
      .single();

    const { error } = await supabase.from("equipos").delete().eq("id", equipoId);
    if (error) return { error: error.message };

    // Limpieza de fotos en storage (no bloqueante si falla algo acá).
    try {
      const marker = "/equipos-fotos/";
      const paths = [equipo?.foto_frente_url, equipo?.foto_reverso_url]
        .filter(Boolean)
        .map((url) => {
          const idx = url.indexOf(marker);
          return idx >= 0 ? url.slice(idx + marker.length) : null;
        })
        .filter(Boolean);
      if (paths.length > 0) await supabase.storage.from("equipos-fotos").remove(paths);
    } catch (e) {
      console.error("No se pudieron borrar las fotos del storage:", e);
    }

    revalidatePath("/panel");
    revalidatePath("/equipos");
    revalidatePath("/historial");
    revalidatePath("/entregados");
    revalidatePath("/mis-equipos");

    return { ok: true };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al eliminar el equipo." };
  }
}

export async function subirFotoEquipo(equipoId, formData) {
  try {
    const supabase = createClient();
    const which = formData.get("which")?.toString(); // "frente" | "reverso"
    const file = formData.get("foto");
    if (!file || file.size === 0) return { error: "No se recibió ninguna imagen." };
    if (which !== "frente" && which !== "reverso") return { error: "Posición de foto inválida." };

    const { data: equipo } = await supabase.from("equipos").select("cliente_id").eq("id", equipoId).single();
    if (!equipo) return { error: "Equipo no encontrado." };

    const ext = file.name?.split(".").pop() || "jpg";
    const path = `${equipo.cliente_id}/${which}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("equipos-fotos").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) return { error: upErr.message };

    const { data: pub } = supabase.storage.from("equipos-fotos").getPublicUrl(path);
    const columna = which === "frente" ? "foto_frente_url" : "foto_reverso_url";

    const { error: updErr } = await supabase.from("equipos").update({ [columna]: pub.publicUrl }).eq("id", equipoId);
    if (updErr) return { error: updErr.message };

    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath(`/mis-equipos/${equipoId}`);
    return { ok: true, url: pub.publicUrl };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al subir la foto." };
  }
}

export async function cambiarEstado(equipoId, nuevoEstado) {
  const supabase = createClient();

  const { data: equipo, error: fetchErr } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email)")
    .eq("id", equipoId)
    .single();
  if (fetchErr) throw fetchErr;

  const patch = { estado: nuevoEstado };
  if (nuevoEstado === "finalizado" && !equipo.finalizado_at) {
    patch.finalizado_at = new Date().toISOString();
  }

  const { error } = await supabase.from("equipos").update(patch).eq("id", equipoId);
  if (error) throw error;

  await supabase.from("historial_estados").insert({ equipo_id: equipoId, estado: nuevoEstado });

  if (MSG_ESTADO[nuevoEstado] && equipo.cliente?.email) {
    const texto = MSG_ESTADO[nuevoEstado](equipo.cliente.nombre?.split(" ")[0] || "cliente", equipo.numero);
    await supabase.from("notificaciones").insert({ equipo_id: equipoId, texto, canal: "email" });
    await enviarNotificacionEstado({
      email: equipo.cliente.email,
      nombre: equipo.cliente.nombre,
      numero: equipo.numero,
      estado: nuevoEstado,
    });
  }

  revalidatePath(`/equipo/${equipoId}`);
  revalidatePath("/panel");
  revalidatePath("/equipos");
  revalidatePath("/historial");
  revalidatePath("/mis-equipos");
}

export async function guardarInforme(equipoId, formData) {
  try {
    const supabase = createClient();

    const num = (v) => {
      const n = parseFloat((v || "0").toString().replace(",", "."));
      return isNaN(n) ? 0 : n;
    };

    const { error } = await supabase
      .from("equipos")
      .update({
        diagnostico: formData.get("diagnostico")?.toString().trim() || null,
        trabajo_realizado: formData.get("trabajo_realizado")?.toString().trim() || null,
        repuestos_utilizados: formData.get("repuestos_utilizados")?.toString().trim() || null,
        costo_mano_obra: num(formData.get("costo_mano_obra")),
        costo_repuestos: num(formData.get("costo_repuestos")),
        garantia_dias: parseInt(formData.get("garantia_dias") || "90", 10) || 0,
        observaciones: formData.get("observaciones")?.toString().trim() || null,
        tecnico_nombre: formData.get("tecnico_nombre")?.toString().trim() || null,
      })
      .eq("id", equipoId);

    if (error) return { error: error.message };

    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath(`/informe/${equipoId}`);
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al guardar el informe." };
  }
}

export async function enviarPresupuesto(equipoId, formData) {
  try {
    const supabase = createClient();

    const num = (v) => {
      const n = parseFloat((v || "0").toString().replace(",", "."));
      return isNaN(n) ? 0 : n;
    };

    const manoObra = num(formData.get("presupuesto_mano_obra"));
    const repuestos = num(formData.get("presupuesto_repuestos"));
    const detalle = formData.get("presupuesto_detalle")?.toString().trim() || null;

    const { data: equipo, error: fetchErr } = await supabase
      .from("equipos")
      .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email)")
      .eq("id", equipoId)
      .single();
    if (fetchErr) return { error: fetchErr.message };

    const { error } = await supabase
      .from("equipos")
      .update({
        presupuesto_detalle: detalle,
        presupuesto_mano_obra: manoObra,
        presupuesto_repuestos: repuestos,
        presupuesto_enviado_at: new Date().toISOString(),
        presupuesto_respuesta: null,
        presupuesto_respuesta_at: null,
        estado: "espera_presupuesto",
      })
      .eq("id", equipoId);
    if (error) return { error: error.message };

    await supabase.from("historial_estados").insert({ equipo_id: equipoId, estado: "espera_presupuesto" });

    const total = manoObra + repuestos;
    const nombre = equipo.cliente?.nombre?.split(" ")[0] || "cliente";
    const texto = `Hola ${nombre}, el presupuesto de tu equipo (caso #${equipo.numero}) ya está listo: $${total.toLocaleString(
      "es-AR",
      { minimumFractionDigits: 2 }
    )}. Ingresá a tu cuenta para verlo en detalle y aceptarlo o rechazarlo.`;

    await supabase.from("notificaciones").insert({ equipo_id: equipoId, texto, canal: "email" });

    if (equipo.cliente?.email) {
      await enviarEmail({
        to: equipo.cliente.email,
        subject: `${NEGOCIO.nombreCorto} — Presupuesto listo (Caso #${String(equipo.numero).padStart(5, "0")})`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
            <p style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#999;">${NEGOCIO.nombre}</p>
            <h2 style="color:#E8873A; margin-top:0;">Presupuesto — Caso #${String(equipo.numero).padStart(5, "0")}</h2>
            <p style="font-size:15px; color:#222;">${texto}</p>
            ${detalle ? `<p style="font-size:13px; color:#444; background:#f5f5f5; padding:10px; border-radius:6px;">${detalle}</p>` : ""}
            <p style="font-size:20px; font-weight:bold; color:#222;">Total: $${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
            <p style="font-size:12px; color:#888;">Iniciá sesión en el sistema para aceptarlo o rechazarlo.</p>
          </div>
        `,
      });
    }

    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath("/panel");
    revalidatePath("/equipos");
    revalidatePath("/mis-equipos");

    return { ok: true };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al enviar el presupuesto." };
  }
}
