import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Collections } from "@/components/site/Collections";
import { Products } from "@/components/site/Products";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { InstagramGallery } from "@/components/site/Instagram";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/_site/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Collections />
      <Products limit={8} />
      <About />
      <Testimonials />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}
