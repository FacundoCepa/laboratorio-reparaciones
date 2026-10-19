import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContexto } from "@/lib/taller";
import { calcularResumen, nombreMes, claveMes } from "@/lib/resumen";

const pesos = (n) => `$${Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

function Dato({ label, value, color = "text-ink" }) {
  return (
    <div className="bg-surface2 border border-border2 rounded-lg p-3 min-w-0">
      <div className={`text-xl font-black ${color} truncate`}>{value}</div>
      <div className="text-[10px] text-dim uppercase tracking-wide font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function Mes({ m, actual, maxFacturado }) {
  const ancho = maxFacturado > 0 ? Math.max(2, Math.round((m.facturado / maxFacturado) * 100)) : 0;
  return (
    <div className={`card p-5 ${actual ? "border-accent" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-ink">{nombreMes(m.clave)}</h2>
        {actual && <span className="text-[10px] font-bold text-accent uppercase tracking-wide">Mes en curso</span>}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <Dato label="Ingresados" value={m.ingresados} color="text-info" />
        <Dato label="Reparados" value={m.reparados} color="text-good" />
        <Dato label="No reparados" value={m.noReparados} color="text-bad" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Dato label={`Facturado (${m.finalizados} finalizado${m.finalizados === 1 ? "" : "s"})`} value={pesos(m.facturado)} />
        <Dato label="Ganancia en reparaciones" value={pesos(m.manoObra)} color="text-good" />
      </div>
      {m.facturado > 0 && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${ancho}%` }} />
          </div>
          <div className="text-[10px] text-dim mt-1">
            Repuestos cobrados: {pesos(m.repuestos)}
          </div>
        </div>
      )}
    </div>
  );
}

// Supabase devuelve como máximo 1000 filas por consulta: se lee de a tandas.
async function leerTodo(armarConsulta) {
  const TANDA = 1000;
  const filas = [];
  for (let desde = 0; ; desde += TANDA) {
    const { data, error } = await armarConsulta().range(desde, desde + TANDA - 1);
    if (error) throw new Error(error.message);
    filas.push(...(data || []));
    if (!data || data.length < TANDA) return filas;
  }
}

export default async function ResumenesPage() {
  const ctx = await getContexto();
  if (!ctx?.profile) redirect("/login");
  if (ctx.profile.role !== "admin") redirect("/panel");

  const supabase = createClient();
  const [equipos, historial] = await Promise.all([
    leerTodo(() =>
      supabase.from("equipos").select("id, estado, creado_at, finalizado_at, costo_mano_obra, costo_repuestos").order("id")
    ),
    leerTodo(() => supabase.from("historial_estados").select("equipo_id, estado, fecha").order("id")),
  ]);

  const meses = calcularResumen(equipos, historial);
  const actual = claveMes(new Date());
  if (!meses.some((m) => m.clave === actual)) {
    meses.unshift({ clave: actual, ingresados: 0, reparados: 0, noReparados: 0, finalizados: 0, facturado: 0, manoObra: 0, repuestos: 0 });
  }
  const maxFacturado = Math.max(0, ...meses.map((m) => m.facturado));

  const total = meses.reduce(
    (t, m) => ({ facturado: t.facturado + m.facturado, manoObra: t.manoObra + m.manoObra, ingresados: t.ingresados + m.ingresados }),
    { facturado: 0, manoObra: 0, ingresados: 0 }
  );

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="eyebrow">Números del taller</div>
      <h1 className="text-xl font-bold text-ink mb-1">Resúmenes por mes</h1>
      <p className="text-xs text-dim mb-6">
        Lo facturado se cuenta en el mes en que se finalizó cada equipo, según el informe de reparación. La
        ganancia es la mano de obra (lo cobrado en repuestos se toma como costo).
      </p>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <Dato label="Equipos ingresados (total)" value={total.ingresados} color="text-info" />
        <Dato label="Facturado (total)" value={pesos(total.facturado)} />
        <Dato label="Ganancia (total)" value={pesos(total.manoObra)} color="text-good" />
      </div>

      <div className="space-y-3">
        {meses.map((m) => (
          <Mes key={m.clave} m={m} actual={m.clave === actual} maxFacturado={maxFacturado} />
        ))}
      </div>
    </div>
  );
}
