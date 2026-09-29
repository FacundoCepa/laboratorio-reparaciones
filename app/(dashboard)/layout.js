import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BannerPromocional from "@/components/BannerPromocional";
import { getContexto, tallerHabilitado, diasParaVencer } from "@/lib/taller";

export default async function DashboardLayout({ children }) {
  const ctx = await getContexto();
  if (!ctx) redirect("/login");
  const { profile, taller, isStaff } = ctx;

  // Usuario autenticado pero sin perfil (no debería pasar en uso normal)
  if (!profile || !taller) redirect("/login");

  const header = (
    <Header nombre={profile.nombre} role={profile.role} superadmin={profile.superadmin} taller={taller} />
  );

  if (!tallerHabilitado(taller) && !profile.superadmin) {
    return (
      <div className="min-h-screen">
        {header}
        <div className="max-w-md mx-auto px-5 py-16">
          <div className="card p-8 text-center">
            <div className="text-3xl mb-3">⏸</div>
            <div className="text-lg font-bold text-ink mb-2">Servicio suspendido</div>
            <p className="text-sm text-dim">
              {isStaff
                ? "La suscripción de tu taller está suspendida o vencida. Comunicate con el proveedor del sistema para reactivarla. Tus datos están guardados y no se perdió nada."
                : `El sistema de seguimiento de ${taller.nombre} no está disponible en este momento. Consultá directamente con el taller por el estado de tu equipo.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const dias = diasParaVencer(taller);
  const avisoVencimiento = isStaff && dias !== null && dias <= 7;

  return (
    <div className="min-h-screen">
      {header}
      {avisoVencimiento && (
        <div className="bg-[#3a2f18] border-b border-[#5c4a22] text-warn text-xs text-center px-4 py-2">
          {dias <= 0 ? "Tu suscripción vence hoy." : `Tu suscripción vence en ${dias} día${dias === 1 ? "" : "s"}.`}{" "}
          Comunicate con el proveedor del sistema para renovarla.
        </div>
      )}
      <div>{children}</div>
      {profile.role === "cliente" && <BannerPromocional image={taller.banner_url} href={taller.banner_link} />}
    </div>
  );
}
