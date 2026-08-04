import { createAdminClient } from "@/lib/supabase/server";
import { NEGOCIO } from "@/lib/config";
import { estadoInfo } from "@/lib/estados";

export default async function InformePage({ params }) {
  const supabase = createAdminClient();
  const { data: equipo } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email, telefono)")
    .eq("id", params.id)
    .single();

  if (!equipo) return <div className="p-8 text-center text-dim">Informe no encontrado.</div>;

  const total = Number(equipo.costo_mano_obra || 0) + Number(equipo.costo_repuestos || 0);
  const fmt = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 });
  const fechaIngreso = equipo.creado_at ? new Date(equipo.creado_at).toLocaleDateString("es-AR") : "—";
  const fechaFinal = equipo.finalizado_at
    ? new Date(equipo.finalizado_at).toLocaleDateString("es-AR")
    : new Date().toLocaleDateString("es-AR");

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div id="etiqueta" className="w-[560px] p-8 font-sans text-[13px] leading-relaxed">
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
          <div>
            <div className="text-lg font-black">{NEGOCIO.nombre}</div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wide">Informe de reparación</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase text-gray-500">Caso</div>
            <div className="text-2xl font-black">#{String(equipo.numero).padStart(5, "0")}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Cliente</div>
            <div className="font-semibold">{equipo.cliente?.nombre || "—"}</div>
            <div className="text-gray-600 text-[12px]">{equipo.cliente?.email}</div>
            {equipo.cliente?.telefono && <div className="text-gray-600 text-[12px]">{equipo.cliente.telefono}</div>}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Equipo</div>
            <div className="font-semibold">
              {equipo.tipo} · {equipo.marca} {equipo.modelo}
            </div>
            <div className="text-gray-600 text-[12px]">Serial: {equipo.serial}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Fecha de ingreso</div>
            <div>{fechaIngreso}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Fecha de finalización</div>
            <div>{fechaFinal}</div>
          </div>
        </div>

        <Seccion titulo="Falla reportada por el cliente" texto={equipo.falla} />
        <Seccion titulo="Diagnóstico" texto={equipo.diagnostico} />
        <Seccion titulo="Trabajo realizado" texto={equipo.trabajo_realizado} />
        <Seccion titulo="Repuestos utilizados" texto={equipo.repuestos_utilizados} />

        <div className="border border-black rounded-md p-3 my-4">
          <div className="flex justify-between text-[12px] py-0.5">
            <span>Mano de obra</span>
            <span>${fmt(equipo.costo_mano_obra)}</span>
          </div>
          <div className="flex justify-between text-[12px] py-0.5">
            <span>Repuestos</span>
            <span>${fmt(equipo.costo_repuestos)}</span>
          </div>
          <div className="flex justify-between text-[15px] font-black pt-1.5 mt-1.5 border-t border-black">
            <span>TOTAL</span>
            <span>${fmt(total)}</span>
          </div>
        </div>

        <div className="text-[12px] mb-4">
          <b>Garantía:</b> {equipo.garantia_dias ?? 90} días sobre el trabajo realizado, a partir de la fecha de entrega.
        </div>

        <Seccion titulo="Observaciones" texto={equipo.observaciones} />

        {equipo.tecnico_nombre && (
          <div className="text-[12px] text-gray-600 mb-6">Técnico responsable: {equipo.tecnico_nombre}</div>
        )}

        <div className="grid grid-cols-2 gap-8 mt-10 pt-4">
          <div className="text-center">
            <div className="border-t border-black pt-1 text-[11px] text-gray-500">Entregado por</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 text-[11px] text-gray-500">Recibido conforme</div>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 text-center mt-8">
          Estado: {estadoInfo(equipo.estado).label} · Emitido el {new Date().toLocaleDateString("es-AR")}
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => window.print(), 400);` }} />
    </div>
  );
}

function Seccion({ titulo, texto }) {
  if (!texto) return null;
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{titulo}</div>
      <div className="text-[12px] whitespace-pre-wrap">{texto}</div>
    </div>
  );
}
