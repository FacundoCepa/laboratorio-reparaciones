"use client";

import { useState } from "react";
import Link from "next/link";
import StatusPill from "./StatusPill";
import { estadoInfo } from "@/lib/estados";

export default function ListaEquipos({ equipos, title, emptyMsg, searchable = true, hrefBase = "/equipo" }) {
  const [q, setQ] = useState("");
  const filtered = equipos.filter((e) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [e.serial, e.marca, e.modelo, e.cliente?.nombre, String(e.numero)].some((x) =>
      (x || "").toString().toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="eyebrow">{title}</div>
          <h1 className="text-xl font-bold text-ink">
            {filtered.length} equipo{filtered.length !== 1 ? "s" : ""}
          </h1>
        </div>
        {searchable && (
          <input
            className="input w-56"
            placeholder="Buscar caso, serial, cliente..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-sm text-dim">{emptyMsg}</div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((e) => (
            <Link key={e.id} href={`${hrefBase}/${e.id}`} className="block">
              <div className="card p-4 hover:border-accent transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-dim mb-0.5">
                      CASO #{String(e.numero).padStart(5, "0")}
                    </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
