import { createClient } from "@/lib/supabase/server";
import ListaEquipos from "@/components/ListaEquipos";
import { getContexto } from "@/lib/taller";
import { TALLERES_CON_ERP } from "@/lib/config";
import { completarVentasErp } from "@/lib/erp";

export default async function FinalizadosPage() {
  const supabase = createClient();
  const ctx = await getContexto();
  const usaErp = TALLERES_CON_ERP.includes(ctx?.taller?.slug);

  const { data } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email)")
    .eq("estado", "finalizado")
    .order("numero", { ascending: false });

  const equipos = usaErp ? await completarVentasErp(supabase, data || []) : data || [];

  return (
    <ListaEquipos
      equipos={equipos}
      title="Finalizados"
      emptyMsg="Todavía no hay equipos finalizados pendientes de entrega."
      mostrarVenta={usaErp}
    />
  );
}
