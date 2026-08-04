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
    <div className="max-w-3xl mx-auto px-5 pt-6">
      <a
        href={banner.href}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl overflow-hidden border border-border hover:border-accent transition"
      >
        <img src={banner.image} alt={banner.alt} className="w-full max-h-40 object-cover bg-surface" />
      </a>
      {BANNERS.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {BANNERS.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full ${idx === i ? "bg-accent" : "bg-border2"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
