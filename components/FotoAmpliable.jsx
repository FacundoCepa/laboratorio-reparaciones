"use client";

import { useState } from "react";

export default function FotoAmpliable({ src, alt }) {
  const [abierta, setAbierta] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="block w-full rounded-lg overflow-hidden border border-border2 hover:border-accent transition"
      >
        <img src={src} alt={alt} className="w-full aspect-video object-cover" />
      </button>

      {abierta && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setAbierta(false)}
        >
          <img src={src} alt={alt} className="max-w-full max-h-full object-contain rounded-lg" />
          <button
            onClick={() => setAbierta(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface text-ink flex items-center justify-center text-lg"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
