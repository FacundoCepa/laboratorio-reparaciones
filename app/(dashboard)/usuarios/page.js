import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsuariosTable from "./UsuariosTable";

export default async function UsuariosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isStaff = profile.role === "admin" || profile.role === "tecnico";
  if (!isStaff) redirect("/mis-equipos");

  const { data: usuarios } = await supabase.from("profiles").select("*").order("role").order("nombre");

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="eyebrow">Administración</div>
      <h1 className="text-xl font-bold text-ink mb-6">Usuarios</h1>
      <UsuariosTable usuarios={usuarios || []} />
    </div>
  );
}
