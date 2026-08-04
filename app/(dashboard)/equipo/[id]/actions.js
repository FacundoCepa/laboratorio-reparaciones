"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { enviarNotificacionEstado, } from "@/lib/email";
import { MSG_ESTADO } from "@/lib/estados";

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
