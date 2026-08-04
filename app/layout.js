import "./globals.css";

export const metadata = {
  title: "Laboratorio de Reparaciones",
  description: "Sistema de seguimiento de reparaciones de equipos informáticos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-bg min-h-screen">{children}</body>
    </html>
  );
}
