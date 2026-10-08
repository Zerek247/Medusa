import Header from "@/components/header";
import Footer from "@/components/footer";
import WhatsappWidget from "@/components/whatsapp-widget";

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tienda-root fondo-tienda relative min-h-screen font-brand">
      {/* Esferas de color decorativas -- solo ambiente, no reciben clics. */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-24 h-80 w-80 animate-flotar-lento rounded-full bg-biobackup-skyLight/50 blur-3xl dark:bg-biobackup-blue/25" />
        <div className="absolute -right-20 top-[38rem] h-96 w-96 animate-flotar-lento-2 rounded-full bg-biobackup-green/30 blur-3xl dark:bg-biobackup-teal/20" />
        <div className="absolute -left-32 top-[90rem] h-96 w-96 animate-flotar-lento-2 rounded-full bg-biobackup-blue/20 blur-3xl dark:bg-biobackup-navy/40" />
      </div>

      <div className="relative z-10">
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsappWidget />
      </div>
    </div>
  );
}
