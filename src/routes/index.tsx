import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Collections } from "@/components/site/Collections";
import { Products } from "@/components/site/Products";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { InstagramGallery } from "@/components/site/Instagram";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";
import { CursorGlow } from "@/components/site/CursorGlow";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { CartDrawer } from "@/components/site/CartDrawer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <LoadingScreen />
      <CursorGlow />
      <Navbar />
      <Hero />
      <Collections />
      <Products />
      <About />
      <Testimonials />
      <InstagramGallery />
      <Newsletter />
      <Footer />
      <CartDrawer />
    </main>
  );
}
