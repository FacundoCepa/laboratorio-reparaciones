import { getTallerPorSlug, tallerHabilitado } from "@/lib/taller";
import RegistroForm from "@/components/RegistroForm";

export default async function RegistroTallerPage({ params }) {
  const taller = await getTallerPorSlug(params.slug);

  if (!taller || !tallerHabilitado(taller)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <div className="text-lg font-bold text-ink mb-2">Link no disponible</div>
          <p className="text-sm text-dim">
            Este link de registro no existe o el taller no está habilitado. Pedile el link correcto al taller.
          </p>
        </div>
      </div>
    );
  }

  return <RegistroForm taller={taller} />;
}
