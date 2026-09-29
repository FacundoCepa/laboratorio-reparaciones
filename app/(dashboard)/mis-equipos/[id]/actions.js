"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { avisarStaffDelTaller, plantillaEmail, nombreRemitente, casoNum, esc } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function responderPresupuesto(equipoId, respuesta) {
  try {
    if (respuesta !== "aceptado" && respuesta !== "rechazado") return { error: "Respuesta inválida." };

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado." };

    // Verificamos la titularidad con el cliente normal (respeta RLS: solo
    // puede leer sus propios equipos). Recién si esto confirma que es el
    // dueño, usamos el cliente admin para poder escribir el cambio, porque
    // la política de UPDATE de "equipos" solo permite escribir al staff.
    const { data: equipo, error: fetchErr } = await supabase
      .from("equipos")
      .select("*")
      .eq("id", equipoId)
      .eq("cliente_id", user.id)
      .single();
    if (fetchErr || !equipo) return { error: "No encontramos ese equipo." };

    const admin = createAdminClient();

    const { error } = await admin
      .from("equipos")
      .update({
        presupuesto_respuesta: respuesta,
        presupuesto_respuesta_at: new Date().toISOString(),
      })
      .eq("id", equipoId);
    if (error) return { error: error.message };

    // Avisar por email al staff (admin/técnicos) de ESTE taller.
    const { data: taller } = await admin.from("talleres").select("*").eq("id", equipo.taller_id).single();
    const total = Number(equipo.presupuesto_mano_obra || 0) + Number(equipo.presupuesto_repuestos || 0);
    const asunto = `${nombreRemitente(taller)} — Presupuesto ${respuesta} (Caso #${casoNum(equipo.numero)})`;
    const html = plantillaEmail(
      taller,
      `Presupuesto ${respuesta === "aceptado" ? "ACEPTADO ✓" : "RECHAZADO ✕"}`,
      `<p style="font-size:15px; color:#222;">Caso #${casoNum(equipo.numero)} — ${esc(equipo.tipo)} ${esc(equipo.marca)} ${esc(equipo.modelo)}</p>
       <p style="font-size:14px; color:#444;">Monto presupuestado: $${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
       ${respuesta === "aceptado" ? '<p style="font-size:13px; color:#888;">Entrá al caso en el sistema para pasarlo a "En proceso de reparación" cuando quieras.</p>' : ""}`,
      respuesta === "aceptado" ? "#7FBF7F" : "#E86A5C"
    );
    if (taller) await avisarStaffDelTaller(admin, taller, asunto, html);

    revalidatePath(`/mis-equipos/${equipoId}`);
    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath("/panel");
    revalidatePath("/equipos");

    return { ok: true };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al registrar tu respuesta." };
  }
}

export async function marcarRecibidoCliente(equipoId) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado." };

    const { data: equipo, error: fetchErr } = await supabase
      .from("equipos")
      .select("*")
      .eq("id", equipoId)
      .eq("cliente_id", user.id)
      .single();
    if (fetchErr || !equipo) return { error: "No encontramos ese equipo." };

    const admin = createAdminClient();
    const patch = { recibido_cliente_at: new Date().toISOString() };
    const finalizarAhora = Boolean(equipo.entregado_admin_at);
    if (finalizarAhora) patch.estado = "entregado";

    const { error } = await admin.from("equipos").update(patch).eq("id", equipoId);
    if (error) return { error: error.message };

    if (finalizarAhora) {
      await admin.from("historial_estados").insert({ equipo_id: equipoId, estado: "entregado" });
    }

    const { data: taller } = await admin.from("talleres").select("*").eq("id", equipo.taller_id).single();
    const asunto = `${nombreRemitente(taller)} — ${finalizarAhora ? "Entrega confirmada" : "¿Entregaste este equipo?"} (Caso #${casoNum(equipo.numero)})`;
    const html = plantillaEmail(
      taller,
      finalizarAhora ? "Entrega confirmada ✓" : "¿Entregaste este equipo?",
      `<p style="font-size:15px; color:#222;">Caso #${casoNum(equipo.numero)} — el cliente dice que ${
        finalizarAhora ? "ya está todo confirmado." : "ya recibió el equipo. Confirmalo desde el sistema."
      }</p>`,
      finalizarAhora ? "#7FBF7F" : "#E8873A"
    );
    if (taller) await avisarStaffDelTaller(admin, taller, asunto, html);

    revalidatePath(`/mis-equipos/${equipoId}`);
    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath("/panel");
    revalidatePath("/entregados");

    return { ok: true, finalizado: finalizarAhora };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al confirmar." };
  }
}
