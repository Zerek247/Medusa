import type { Metadata } from "next";
import "./globals.css";
import { CarritoProvider } from "@/lib/carrito-context";

export const metadata: Metadata = {
  title: "BioBackup — Equipo médico + consumibles",
  description:
    "Maqueta visual de la tienda y el panel de administración de BioBackup.",
  icons: { icon: "/logo/biobackup-vertical.jpeg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white font-sans antialiased">
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}
