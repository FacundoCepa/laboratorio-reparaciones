import { createClient } from "@/lib/supabase/server";
import StatusPill from "@/components/StatusPill";
import ProgressRail from "@/components/ProgressRail";
import { ESTADOS, estadoInfo, estadoIndex } from "@/lib/estados";
import EstadoActions from "./EstadoActions";
import InformeForm from "./InformeForm";

export default async function EquipoDetallePage({ params }) {
  const supabase = createClient();
  const { data: equipo } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email, telefono)")
    .eq("id", params.id)
    .single();

  if (!equipo) return <div className="max-w-4xl mx-auto px-5 py-8 text-dim">Equipo no encontrado.</div>;

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

  const idx = estadoIndex(equipo.estado);
  const nextEstado = ESTADOS[idx + 1];

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <a href="/equipos" className="text-sm text-muted hover:text-ink mb-5 inline-block">
        ← Volver
      </a>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="eyebrow">Caso #{String(equipo.numero).padStart(5, "0")}</div>
          <h1 className="text-2xl font-black text-ink">
            {equipo.tipo} · {equipo.marca} {equipo.modelo}
          </h1>
          <p className="text-sm text-dim mt-1">
            Cliente: {equipo.cliente?.nombre} · Serial: <span className="font-mono">{equipo.serial}</span>
          </p>
        </div>
        <StatusPill color={estadoInfo(equipo.estado).color}>{estadoInfo(equipo.estado).label}</StatusPill>
      </div>

      <div className="grid md:grid-cols-[1fr_1.3fr] gap-6">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="eyebrow">Acciones</div>
            <EstadoActions equipoId={equipo.id} estadoActual={equipo.estado} nextEstado={nextEstado} />
            <a href={`/etiqueta/${equipo.id}`} target="_blank" rel="noreferrer" className="btn-ghost w-full mt-2">
              🖨️ Ver / reimprimir etiqueta
            </a>
          </div>

          <div className="card p-5">
            <div className="eyebrow">Detalle técnico</div>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Falla reportada" value={equipo.falla || "—"} />
              <Row
                label="Batería"
                value={equipo.bateria === "si" ? "Sí (removible)" : equipo.bateria === "interna" ? "Interna" : "No tiene"}
              />
              <Row label="Cargador" value={equipo.cargador ? "Sí" : "No"} />
              <Row label="Memoria" value={equipo.memoria ? "Sí" : "No"} />
              <Row label="Disco" value={equipo.disco ? "Sí" : "No"} />
              <Row label="Teclado" value={equipo.teclado ? "Sí" : "No"} />
            </div>
          </div>

          {(equipo.foto_frente_url || equipo.foto_reverso_url) && (
            <div className="card p-5">
              <div className="eyebrow">Fotos</div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {equipo.foto_frente_url && (
                  <img src={equipo.foto_frente_url} className="rounded-lg w-full aspect-video object-cover" />
                )}
                {equipo.foto_reverso_url && (
                  <img src={equipo.foto_reverso_url} className="rounded-lg w-full aspect-video object-cover" />
                )}
              </div>
            </div>
          )}

          <div className="card p-5">
            <div className="eyebrow">Informe de reparación y costo</div>
            <p className="text-xs text-dim mt-1 mb-3">
              Completalo cuando el equipo esté reparado o finalizado. Se puede editar e imprimir las veces que haga falta.
            </p>
            <InformeForm equipo={equipo} />
          </div>
        </div>

        <div>
          <div className="card p-5 mb-5">
            <div className="eyebrow">Seguimiento</div>
            <div className="mt-4">
              <ProgressRail estadoActual={equipo.estado} historial={historial || []} />
            </div>
          </div>

          <div className="card p-5">
            <div className="eyebrow">Notificaciones enviadas</div>
            <div className="space-y-2 mt-3">
              {(!notificaciones || notificaciones.length === 0) && (
                <p className="text-xs text-dim">Aún no se enviaron notificaciones.</p>
              )}
              {notificaciones?.map((n) => (
                <div key={n.id} className="bg-surface2 border border-border2 rounded-lg p-3">
                  <p className="text-xs text-ink">{n.texto}</p>
                  <p className="text-[10px] text-dim mt-1">
                    {new Date(n.fecha).toLocaleString("es-AR")} · {n.canal}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-border2 last:border-0">
      <span className="text-dim">{label}</span>
      <span className="text-ink font-medium text-right">{value}</span>
    </div>
  );
}
