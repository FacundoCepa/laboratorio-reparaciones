"use server";

import { createClient } from "@/lib/supabase/server";
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

    // Solo puede responder el dueño del equipo (lo refuerza también la RLS).
    const { data: equipo, error: fetchErr } = await supabase
      .from("equipos")
      .select("*")
      .eq("id", equipoId)
      .eq("cliente_id", user.id)
      .single();
    if (fetchErr || !equipo) return { error: "No encontramos ese equipo." };

    const patch = {
      presupuesto_respuesta: respuesta,
      presupuesto_respuesta_at: new Date().toISOString(),
    };
    if (respuesta === "aceptado") patch.estado = "reparacion";

    const { error } = await supabase.from("equipos").update(patch).eq("id", equipoId);
    if (error) return { error: error.message };

    if (respuesta === "aceptado") {
      await supabase.from("historial_estados").insert({ equipo_id: equipoId, estado: "reparacion" });
    }

    // Avisar al staff (todos los admin/técnico) por email.
    const { data: staff } = await supabase.from("profiles").select("email, nombre").in("role", ["admin", "tecnico"]);
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
