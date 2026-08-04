import { createClient } from "@/lib/supabase/server";
import ListaEquipos from "@/components/ListaEquipos";

export default async function MisEquiposPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: equipos } = await supabase
    .from("equipos")
    .select("*")
    .eq("cliente_id", user.id)
    .order("numero", { ascending: false });

  return (
    <ListaEquipos
      equipos={equipos || []}
      title="Mis equipos"
      emptyMsg="Todavía no registraste ningún equipo."
      searchable={false}
      hrefBase="/mis-equipos"
    />
  );
}
