import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusPill from "@/components/StatusPill";
import { estadoInfo } from "@/lib/estados";

export default async function PanelPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isStaff = profile.role === "admin" || profile.role === "tecnico";
  if (!isStaff) redirect("/mis-equipos");

  const { data: equipos } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre)")
    .order("numero", { ascending: false });

  const all = equipos || [];
  const pendientes = all.filter((e) => e.estado === "registrado");
  const enLab = all.filter((e) => !["registrado", "finalizado", "entrega"].includes(e.estado));
  const listos = all.filter((e) => ["finalizado", "entrega"].includes(e.estado));

  const Stat = ({ label, value, color }) => (
    <div className="card p-5 flex-1 min-w-[140px]">
      <div className="text-3xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-dim mt-1 uppercase tracking-wide font-semibold">{label}</div>
    </div>
  );

  const EquipoRow = ({ e }) => (
    <Link href={`/equipo/${e.id}`} className="block">
      <div className="card p-4 hover:border-accent transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-dim mb-0.5">CASO #{String(e.numero).padStart(5, "0")}</div>
            <div className="font-bold text-ink text-sm truncate">
              {e.tipo} · {e.marca} {e.modelo}
            </div>
            <div className="text-xs text-dim mt-0.5 truncate">
              {e.cliente?.nombre} · {e.serial}
            </div>
          </div>
          <StatusPill color={estadoInfo(e.estado).color}>{estadoInfo(e.estado).label}</StatusPill>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="eyebrow">Vista general</div>
      <h1 className="text-xl font-bold text-ink mb-6">Panel del laboratorio</h1>

      <div className="flex gap-3 flex-wrap mb-8">
        <Stat label="Pendientes de ingreso" value={pendientes.length} color="#8a8578" />
        <Stat label="En laboratorio" value={enLab.length} color="#E8873A" />
        <Stat label="Listos / entrega" value={listos.length} color="#7FBF7F" />
        <Stat label="Total histórico" value={all.length} color="#6FA8DC" />
      </div>

      {pendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-ink mb-3">Pendientes de ingreso físico</h2>
          <div className="space-y-2.5">
            {pendientes.slice(0, 5).map((e) => (
              <EquipoRow key={e.id} e={e} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-ink mb-3">En laboratorio ahora</h2>
        {enLab.length === 0 ? (
          <div className="card p-8 text-center text-sm text-dim">No hay equipos en proceso.</div>
        ) : (
          <div className="space-y-2.5">
            {enLab.slice(0, 6).map((e) => (
              <EquipoRow key={e.id} e={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
