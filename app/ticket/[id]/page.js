import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { NEGOCIO } from "@/lib/config";

export default async function TicketPage({ params }) {
  const supabase = createAdminClient();
  const { data: equipo } = await supabase
    .from("equipos")
    .select("*, cliente:profiles!equipos_cliente_id_fkey(nombre, email)")
    .eq("id", params.id)
    .single();

  if (!equipo) return <div className="p-8 text-center text-dim">Comprobante no encontrado.</div>;

  const host = headers().get("host");
  const proto = host?.includes("localhost") ? "http" : "https";
  const siteUrl = `${proto}://${host}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(siteUrl + "/login")}`;

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      <div id="etiqueta" className="w-full max-w-[340px] border-2 border-dashed border-black p-5 font-mono text-black">
        <div className="text-[10px] tracking-widest uppercase text-gray-500 text-center">{NEGOCIO.nombre}</div>
        <div className="text-sm font-bold uppercase text-center mt-1 mb-3 pb-2 border-b border-black">
          Comprobante de registro
        </div>

        <div className="text-3xl font-black text-center my-2">#{String(equipo.numero).padStart(5, "0")}</div>
        <div className="text-[11px] text-center text-gray-600 mb-3">
          {new Date(equipo.creado_at || Date.now()).toLocaleString("es-AR")}
        </div>

        <div className="text-[12px] font-bold uppercase mb-2 text-center">
          {equipo.tipo} · {equipo.marca} {equipo.modelo}
        </div>

        <div className="flex justify-between text-[11px] py-1 border-b border-dotted border-gray-400">
          <span>Serial</span>
          <b>{equipo.serial}</b>
        </div>
        <div className="flex justify-between text-[11px] py-1 border-b border-dotted border-gray-400">
          <span>Cliente</span>
          <b className="text-right">{equipo.cliente?.nombre}</b>
        </div>

        <div className="text-[10px] text-gray-600 mt-4 mb-2 text-center leading-relaxed">
          Guardá este comprobante como control de que enviaste el equipo al laboratorio. Podés seguir el estado
          ingresando con tu email:
        </div>
        <div className="text-[11px] font-bold text-center mb-3">{equipo.cliente?.email}</div>

        <div className="flex justify-center mb-2">
          <img src={qrUrl} alt="Código QR de acceso" width={120} height={120} />
        </div>
        <div className="text-[9px] text-gray-500 text-center break-all">{siteUrl}</div>

        <div className="text-[9px] text-gray-400 text-center mt-4 pt-2 border-t border-gray-300">
          ⚠️ No es la etiqueta del equipo — recordá imprimir y pegar también el cupón del equipo.
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => window.print(), 400);` }} />
    </div>
  );
}
