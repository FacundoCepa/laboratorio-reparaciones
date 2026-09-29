import "./globals.css";
import { SISTEMA } from "@/lib/config";

export const metadata = {
  title: SISTEMA.nombre,
  description: "Seguimiento de reparaciones de equipos informáticos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-bg min-h-screen">{children}</body>
    </html>
  );
}
