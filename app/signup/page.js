import { redirect } from "next/navigation";
import { TALLER_POR_DEFECTO } from "@/lib/config";

// Link viejo de registro: se manda al registro del taller por defecto.
export default function SignupPage() {
  redirect(`/t/${TALLER_POR_DEFECTO}/registro`);
}
