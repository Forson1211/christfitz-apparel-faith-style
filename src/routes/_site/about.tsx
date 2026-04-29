import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About — ChristFitz Apparel" },
      { name: "description", content: "Built on faith. Crafted with intention. The story behind ChristFitz." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pt-20">
      <About />
      <Testimonials />
    </div>
  );
}
