import { createClient } from "@/lib/supabase/server";
import ListaEquipos from "@/components/ListaEquipos";

export default async function HistorialPage() {
  const supabase = createClient();
  const { data: equipos } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre)")
    .order("numero", { ascending: false });

  return (
    <ListaEquipos
      equipos={equipos || []}
      title="Historial completo"
      emptyMsg="Todavía no hay equipos registrados."
    />
  );
}
