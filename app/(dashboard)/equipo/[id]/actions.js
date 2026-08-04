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

  const { error } = await supabase.from("equipos").update({ estado: nuevoEstado }).eq("id", equipoId);
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
