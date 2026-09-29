import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getContexto, diasParaVencer } from "@/lib/taller";
import MiTallerForm from "./MiTallerForm";

export default async function MiTallerPage() {
  const ctx = await getContexto();
  if (!ctx?.profile) redirect("/login");
  if (ctx.profile.role !== "admin") redirect("/panel");
  const { taller } = ctx;

  const host = headers().get("host");
  const proto = host?.includes("localhost") ? "http" : "https";
  const base = `${proto}://${host}/t/${taller.slug}`;
  const dias = diasParaVencer(taller);

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="eyebrow">Configuración</div>
      <h1 className="text-xl font-bold text-ink mb-6">Mi taller</h1>

      <div className="card p-5 mb-5">
        <div className="eyebrow">Tus links para compartir</div>
        <div className="space-y-3 mt-3 text-sm">
          <div>
            <div className="text-[11px] text-dim mb-0.5">Ingreso (clientes y staff)</div>
            <div className="font-mono text-ink break-all">{base}</div>
          </div>
          <div>
            <div className="text-[11px] text-dim mb-0.5">Registro de clientes nuevos</div>
            <div className="font-mono text-ink break-all">{base}/registro</div>
          </div>
        </div>
        <div className="text-[11px] text-dim mt-4 pt-3 border-t border-border2">
          Plan: <b className="text-ink uppercase">{taller.plan}</b>
          {taller.vence_at
            ? ` · Vence el ${new Date(taller.vence_at + "T00:00:00").toLocaleDateString("es-AR")}${
                dias !== null && dias >= 0 ? ` (faltan ${dias} días)` : ""
              }`
            : " · Sin vencimiento"}
        </div>
      </div>

      <MiTallerForm taller={taller} />
    </div>
  );
}
