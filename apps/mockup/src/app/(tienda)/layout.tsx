import Header from "@/components/header";
import Footer from "@/components/footer";
import WhatsappWidget from "@/components/whatsapp-widget";

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsappWidget />
    </>
  );
}
