import { createClient } from "@/lib/supabase/server";
import StatusPill from "@/components/StatusPill";
import ProgressRail from "@/components/ProgressRail";
import { estadoInfo } from "@/lib/estados";

export default async function MiEquipoDetallePage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: equipo } = await supabase
    .from("equipos")
    .select("*")
    .eq("id", params.id)
    .eq("cliente_id", user.id) // asegura que solo vea lo suyo
    .single();

  if (!equipo) return <div className="max-w-2xl mx-auto px-5 py-8 text-dim">No encontramos ese equipo.</div>;

  const { data: historial } = await supabase
    .from("historial_estados")
    .select("*")
    .eq("equipo_id", equipo.id)
    .order("fecha", { ascending: true });

  const { data: notificaciones } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("equipo_id", equipo.id)
    .order("fecha", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <a href="/mis-equipos" className="text-sm text-muted hover:text-ink mb-5 inline-block">
        ← Volver
      </a>
      <div className="eyebrow">Caso #{String(equipo.numero).padStart(5, "0")}</div>
      <h1 className="text-2xl font-black text-ink mb-1">
        {equipo.tipo} · {equipo.marca} {equipo.modelo}
      </h1>
      <p className="text-sm text-dim mb-6">
        Serial: <span className="font-mono">{equipo.serial}</span>
      </p>

      <div className="card p-5 mb-5">
        <div className="eyebrow">Estado actual</div>
        <div className="mt-2 mb-4">
          <StatusPill color={estadoInfo(equipo.estado).color}>{estadoInfo(equipo.estado).label}</StatusPill>
        </div>
        <ProgressRail estadoActual={equipo.estado} historial={historial || []} />
      </div>

      <div className="card p-5">
        <div className="eyebrow">Notificaciones recibidas</div>
        <div className="space-y-2 mt-3">
          {(!notificaciones || notificaciones.length === 0) && (
            <p className="text-xs text-dim">Todavía no recibiste notificaciones para este equipo.</p>
          )}
          {notificaciones?.map((n) => (
            <div key={n.id} className="bg-surface2 border border-border2 rounded-lg p-3">
              <p className="text-xs text-ink">{n.texto}</p>
              <p className="text-[10px] text-dim mt-1">{new Date(n.fecha).toLocaleString("es-AR")} · {n.canal}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
