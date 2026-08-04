"use client";

import { useEffect, useState } from "react";
import { BANNERS } from "@/lib/config";

export default function BannerPromocional() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (BANNERS.length <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % BANNERS.length), 6000);
    return () => clearInterval(t);
  }, []);

  if (BANNERS.length === 0) return null;
  const banner = BANNERS[i];

  return (
    <div className="max-w-3xl mx-auto px-5 py-6">
      <div className="text-[9px] uppercase tracking-widest text-dim mb-1.5 text-center">Publicidad</div>
      <a
        href={banner.href}
        target="_blank"
        rel="noreferrer"
        className="block h-16 rounded-lg overflow-hidden border border-border2 bg-surface hover:border-accent transition flex items-center justify-center"
      >
        <img src={banner.image} alt={banner.alt} className="h-full w-full object-contain p-1.5" />
      </a>
      {BANNERS.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-1.5">
          {BANNERS.map((_, idx) => (
            <span key={idx} className={`w-1 h-1 rounded-full ${idx === i ? "bg-accent" : "bg-border2"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
