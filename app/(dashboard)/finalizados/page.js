import { createClient } from "@/lib/supabase/server";
import ListaEquipos from "@/components/ListaEquipos";

export default async function FinalizadosPage() {
  const supabase = createClient();
  const { data: equipos } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre)")
    .eq("estado", "finalizado")
    .order("numero", { ascending: false });

  return (
    <ListaEquipos
      equipos={equipos || []}
      title="Finalizados"
      emptyMsg="Todavía no hay equipos finalizados pendientes de entrega."
    />
  );
}
