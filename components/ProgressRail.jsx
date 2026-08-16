import { ESTADOS, estadoIndex, pasosParaRiel } from "@/lib/estados";

export default function ProgressRail({ estadoActual, historial = [] }) {
  const idx = estadoIndex(estadoActual);
  const pasos = pasosParaRiel(estadoActual);
  return (
    <div>
      {pasos.map((e, i) => {
        const done = i < idx;
        const active = i === idx;
        const h = historial.find((x) => x.estado === e.key);
        return (
          <div key={e.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                style={{ backgroundColor: done || active ? e.color : "#3a372f", color: "#1C1B18" }}
              >
                {done ? "✓" : ""}
              </div>
              {i < pasos.length - 1 && (
                <div
                  className="w-px flex-1 min-h-[22px]"
                  style={{ backgroundColor: done ? e.color : "#3a372f" }}
                />
              )}
            </div>
            <div className="pb-5 -mt-0.5">
              <div
                className={`text-sm font-semibold ${
                  active ? "text-ink" : done ? "text-[#c9c3b5]" : "text-[#7a7568]"
                }`}
              >
                {e.label}
              </div>
              {h && <div className="text-xs text-dim mt-0.5">{new Date(h.fecha).toLocaleString("es-AR")}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
