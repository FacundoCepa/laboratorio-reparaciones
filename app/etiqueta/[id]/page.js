import { createAdminClient } from "@/lib/supabase/server";
import { NEGOCIO } from "@/lib/config";

// Nota: esta página es de solo lectura y se accede por un link directo con
// el UUID del caso (no listado, no indexado). Usa el cliente admin porque
// se abre sin sesión (por ejemplo desde el celular de un técnico en el
// mostrador). Si preferís que requiera login, sacala de la lista de rutas
// públicas en middleware.js.
export default async function EtiquetaPage({ params }) {
  const supabase = createAdminClient();
  const { data: equipo } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre)")
    .eq("id", params.id)
    .single();

  if (!equipo) return <div className="p-8 text-center text-dim">Etiqueta no encontrada.</div>;

  const lineas = [
    ["Cliente", equipo.cliente?.nombre || "—"],
    ["Serial", equipo.serial],
    ["Fecha", new Date(equipo.creado_at || Date.now()).toLocaleString("es-AR")],
    ["Bat / Carg", `${equipo.bateria !== "no_tiene" ? "Sí" : "No"} / ${equipo.cargador ? "Sí" : "No"}`],
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div id="etiqueta" className="w-full max-w-[320px] border-2 border-dashed border-black p-4 font-mono text-black">
        <div className="text-[10px] tracking-widest uppercase text-gray-500">
          {NEGOCIO.nombre} · Etiqueta
        </div>
        <div className="text-sm font-bold uppercase mt-1 mb-2 pb-1.5 border-b border-black">
          {equipo.tipo} · {equipo.marca} {equipo.modelo}
        </div>
        <div className="text-4xl font-black tracking-wide my-2">#{String(equipo.numero).padStart(5, "0")}</div>
        {equipo.falla && (
          <div className="border-2 border-black rounded p-2 my-2 text-left">
            <div className="text-[9px] uppercase tracking-widest text-gray-500">Falla reportada</div>
            <div className="text-[15px] font-bold leading-snug">{equipo.falla}</div>
          </div>
        )}
        {lineas.map(([label, value]) => (
          <div key={label} className="flex justify-between text-[11px] py-1 border-b border-dotted border-gray-400">
            <span>{label}</span>
            <b className="uppercase">{value}</b>
          </div>
        ))}
        <div className="h-8 mt-3" style={{ background: "repeating-linear-gradient(90deg,#111 0 2px, transparent 2px 5px)" }} />
        <div className="text-[9px] text-gray-500 text-center mt-2">Conservar esta etiqueta adherida al equipo</div>
      </div>
      <PrintScript />
    </div>
  );
}

function PrintScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `setTimeout(() => window.print(), 400);`,
      }}
    />
  );
}
