import { createClient } from "@/lib/supabase/server";
import ListaEquipos from "@/components/ListaEquipos";

export default async function EquiposPage() {
  const supabase = createClient();
  const { data: equipos } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre)")
    .neq("estado", "finalizado")
    .order("numero", { ascending: false });

  return (
    <ListaEquipos
      equipos={equipos || []}
      title="Laboratorio"
      emptyMsg="No hay equipos activos."
    />
  );
}
