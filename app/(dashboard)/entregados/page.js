import { createClient } from "@/lib/supabase/server";
import ListaEquipos from "@/components/ListaEquipos";

export default async function EntregadosPage() {
  const supabase = createClient();
  const { data: equipos } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre)")
    .in("estado", ["entrega", "finalizado", "entregado"])
    .order("numero", { ascending: false });

  return (
    <ListaEquipos
      equipos={equipos || []}
      title="Entregados"
      emptyMsg="Todavía no hay equipos finalizados o entregados."
    />
  );
}
