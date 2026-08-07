"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { enviarEmail } from "@/lib/email";
import { NEGOCIO } from "@/lib/config";
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

    // Avisar al staff (todos los admin/técnico) por email.
    const { data: staff } = await admin.from("profiles").select("email, nombre").in("role", ["admin", "tecnico"]);
    const total = Number(equipo.presupuesto_mano_obra || 0) + Number(equipo.presupuesto_repuestos || 0);
    const asunto = `${NEGOCIO.nombreCorto} — Presupuesto ${respuesta} (Caso #${String(equipo.numero).padStart(5, "0")})`;
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:${respuesta === "aceptado" ? "#7FBF7F" : "#E86A5C"};">
          Presupuesto ${respuesta === "aceptado" ? "ACEPTADO ✓" : "RECHAZADO ✕"}
        </h2>
        <p style="font-size:15px; color:#222;">
          Caso #${String(equipo.numero).padStart(5, "0")} — ${equipo.tipo} ${equipo.marca} ${equipo.modelo}
        </p>
        <p style="font-size:14px; color:#444;">Monto presupuestado: $${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
        ${respuesta === "aceptado" ? '<p style="font-size:13px; color:#888;">Entrá al caso en el sistema para pasarlo a "En proceso de reparación" cuando quieras.</p>' : ""}
      </div>
    `;
    for (const s of staff || []) {
      if (s.email) await enviarEmail({ to: s.email, subject: asunto, html });
    }

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

    const { data: staff } = await admin.from("profiles").select("email").in("role", ["admin", "tecnico"]);
    const asunto = `${NEGOCIO.nombreCorto} — ${finalizarAhora ? "Entrega confirmada" : "¿Entregaste este equipo?"} (Caso #${String(equipo.numero).padStart(5, "0")})`;
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:${finalizarAhora ? "#7FBF7F" : "#E8873A"};">
          ${finalizarAhora ? "Entrega confirmada ✓" : "¿Entregaste este equipo?"}
        </h2>
        <p style="font-size:15px; color:#222;">
          Caso #${String(equipo.numero).padStart(5, "0")} — el cliente dice que ${
      finalizarAhora ? "ya está todo confirmado." : "ya recibió el equipo. Confirmalo desde el sistema."
    }
        </p>
      </div>
    `;
    for (const s of staff || []) {
      if (s.email) await enviarEmail({ to: s.email, subject: asunto, html });
    }

    revalidatePath(`/mis-equipos/${equipoId}`);
    revalidatePath(`/equipo/${equipoId}`);
    revalidatePath("/panel");
    revalidatePath("/entregados");

    return { ok: true, finalizado: finalizarAhora };
  } catch (err) {
    return { error: err.message || "Ocurrió un error al confirmar." };
  }
}
