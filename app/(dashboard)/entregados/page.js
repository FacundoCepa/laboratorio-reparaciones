import { createClient } from "@/lib/supabase/server";
import ListaEquipos from "@/components/ListaEquipos";
import { getContexto } from "@/lib/taller";
import { TALLERES_CON_ERP } from "@/lib/config";
import { completarVentasErp } from "@/lib/erp";

export default async function EntregadosPage() {
  const supabase = createClient();
  const ctx = await getContexto();
  const usaErp = TALLERES_CON_ERP.includes(ctx?.taller?.slug);

  const { data } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email)")
    .in("estado", ["entrega", "entregado"])
    .order("numero", { ascending: false });

  const equipos = usaErp ? await completarVentasErp(supabase, data || []) : data || [];

  return (
    <ListaEquipos
      equipos={equipos}
      title="Entregados"
      emptyMsg="Todavía no hay equipos en proceso de entrega o entregados."
      mostrarVenta={usaErp}
    />
  );
}
