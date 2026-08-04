import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import BannerPromocional from "@/components/BannerPromocional";

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) {
    // Usuario autenticado pero sin perfil (no debería pasar en uso normal)
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Header nombre={profile.nombre} role={profile.role} />
      <div>{children}</div>
      {profile.role === "cliente" && <BannerPromocional />}
    </div>
  );
}
