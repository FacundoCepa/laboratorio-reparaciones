import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { getContexto, tallerHabilitado } from "@/lib/taller";
import AdminTalleres from "./AdminTalleres";

export default async function AdminPage() {
  const ctx = await getContexto();
  if (!ctx?.profile?.superadmin) redirect("/panel");

  const admin = createAdminClient();
  const { data: talleres } = await admin.from("talleres").select("*").order("creado_at");

  const filas = await Promise.all(
    (talleres || []).map(async (t) => {
      const [{ count: equipos }, { count: usuarios }, { data: admins }] = await Promise.all([
        admin.from("equipos").select("id", { count: "exact", head: true }).eq("taller_id", t.id),
        admin.from("profiles").select("id", { count: "exact", head: true }).eq("taller_id", t.id),
        admin.from("profiles").select("nombre, email").eq("taller_id", t.id).eq("role", "admin"),
      ]);
      return { ...t, equipos: equipos || 0, usuarios: usuarios || 0, admins: admins || [], habilitado: tallerHabilitado(t) };
    })
  );

  const host = headers().get("host");
  const proto = host?.includes("localhost") ? "http" : "https";

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="eyebrow">Superadministrador</div>
      <h1 className="text-xl font-bold text-ink mb-6">Talleres del sistema</h1>
      <AdminTalleres talleres={filas} baseUrl={`${proto}://${host}`} miTallerId={ctx.profile.taller_id} />
    </div>
  );
}
