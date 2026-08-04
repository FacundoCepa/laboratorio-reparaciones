import { createClient } from "@/lib/supabase/server";
import CargarForm from "./CargarForm";

export default async function CargarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isStaff = profile.role === "admin" || profile.role === "tecnico";

  let clientes = [];
  if (isStaff) {
    const { data } = await supabase.from("profiles").select("id, nombre, email").eq("role", "cliente").order("nombre");
    clientes = data || [];
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="eyebrow">{isStaff ? "Recepción" : "Solicitud"}</div>
      <h1 className="text-xl font-bold text-ink mb-6">Registrar equipo</h1>
      <CargarForm isStaff={isStaff} clientes={clientes} />
    </div>
  );
}
