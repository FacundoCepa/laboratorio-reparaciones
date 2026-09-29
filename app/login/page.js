import { getTallerPorSlug } from "@/lib/taller";
import { TALLER_POR_DEFECTO } from "@/lib/config";
import LoginForm from "@/components/LoginForm";

// El login es el mismo para todos; solo cambia la marca según el link
// del taller (/t/<slug> → /login?t=<slug>).
export default async function LoginPage({ searchParams }) {
  const taller =
    (await getTallerPorSlug(searchParams?.t)) ||
    (await getTallerPorSlug(TALLER_POR_DEFECTO)) || { slug: TALLER_POR_DEFECTO, nombre: "Iniciar sesión" };
  return <LoginForm taller={taller} />;
}
