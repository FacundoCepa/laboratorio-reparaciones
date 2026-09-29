"use client";

import { useState } from "react";

export default function InstalarAppModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent shrink-0"
        title="Cómo instalar la app"
      >
        📲
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-md max-h-[85vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Instalar la app</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted hover:text-ink shrink-0"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-dim mb-5">
              Podés agregar esta página a la pantalla de inicio de tu celular y usarla como una app, con ícono propio y sin escribir la dirección cada vez.
            </p>

            <div className="mb-5">
              <div className="eyebrow"> iPhone (Safari)</div>
              <ol className="text-sm text-ink space-y-2 list-decimal list-inside">
                <li>Abrí esta página desde <b>Safari</b> (no funciona desde Chrome en iPhone).</li>
                <li>
                  Tocá el botón de <b>Compartir</b> (el cuadrado con la flecha hacia arriba), abajo en el centro de la pantalla.
                </li>
                <li>
                  Deslizá hacia abajo y elegí <b>"Agregar a pantalla de inicio"</b>.
                </li>
                <li>
                  Tocá <b>"Agregar"</b> arriba a la derecha.
                </li>
              </ol>
            </div>

            <div>
              <div className="eyebrow">🤖 Android (Chrome)</div>
              <ol className="text-sm text-ink space-y-2 list-decimal list-inside">
                <li>Abrí esta página desde <b>Chrome</b>.</li>
                <li>
                  Tocá los <b>tres puntitos</b> (⋮) arriba a la derecha.
                </li>
                <li>
                  Elegí <b>"Agregar a pantalla de inicio"</b> o <b>"Instalar app"</b> (el texto puede variar un poco según la versión).
                </li>
                <li>
                  Confirmá tocando <b>"Agregar"</b> o <b>"Instalar"</b>.
                </li>
              </ol>
            </div>

            <p className="text-[11px] text-dim mt-5">
              Una vez agregada, el ícono va a aparecer junto a tus otras apps y se abre directo, sin pasar por el navegador.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
