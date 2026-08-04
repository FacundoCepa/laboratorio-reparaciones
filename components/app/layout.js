import "./globals.css";
import { NEGOCIO } from "@/lib/config";

export const metadata = {
  title: `${NEGOCIO.nombreCorto} — Laboratorio de reparaciones`,
  description: `Sistema de seguimiento de reparaciones de equipos informáticos de ${NEGOCIO.nombre}`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-bg min-h-screen">{children}</body>
    </html>
  );
}
