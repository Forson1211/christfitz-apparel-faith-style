import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Book, Truck, RotateCcw, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [{ title: "About Us — ChristFitz Apparel" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Our Story</p>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl">Faith & Fashion</h1>
          <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
            ChristFitz Apparel was born from a simple conviction — that faith and fashion were never
            meant to be separate. We create premium streetwear for the modern believer.
          </p>
        </motion.div>

        <div className="grid gap-12">
          <section className="space-y-6">
            <h2 className="font-display text-3xl">Built on Conviction</h2>
            <div className="prose prose-stone max-w-none text-muted-foreground leading-loose">
              <p>
                Every piece in our collection is designed with intention. We don't just print
                symbols on fabric; we craft garments that serve as a testimony. Our mission is to
                empower believers to wear their faith boldly without compromising on style or
                quality.
              </p>
              <p>
                Based in Accra, we draw inspiration from both global streetwear trends and our
                deep-rooted spiritual heritage. Each collection is a chapter in a larger story of
                redemption and freedom.
              </p>
            </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-8 py-10 border-y border-cocoa/10">
            <div className="space-y-3">
              <Shield className="h-6 w-6 text-gold" />
              <h3 className="font-display text-xl">Our Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To bridge the gap between high-end streetwear and meaningful expression of faith.
              </p>
            </div>
            <div className="space-y-3">
              <Book className="h-6 w-6 text-gold" />
              <h3 className="font-display text-xl">Our Vision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To become a global movement that influences culture through Christ-centered
                creativity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
