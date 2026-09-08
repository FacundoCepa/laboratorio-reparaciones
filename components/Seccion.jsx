"use client";

import { useState } from "react";

export default function Seccion({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="eyebrow mb-0">{title}</span>
        <span className="flex items-center gap-2 shrink-0">
          {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface2 text-dim">{badge}</span>}
          <span className={`text-dim text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        </span>
      </button>
      {open && <div className="px-5 pb-5 -mt-1">{children}</div>}
    </div>
  );
}
