import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2.5rem] gradient-warm p-10 sm:p-16 text-cream shadow-luxe"
        >
          <div
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl animate-float-slow"
            style={{ background: "oklch(0.78 0.12 80 / 0.4)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full blur-3xl animate-float-slower"
            style={{ background: "oklch(0.96 0.015 80 / 0.15)" }}
          />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-cream/70">— Newsletter</p>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance">
              Join the <span className="italic">movement.</span>
            </h2>
            <p className="mt-4 max-w-xl text-cream/80">
              Early access to drops, devotional notes, and 10% off your first order.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSent(true);
              }}
              className="mt-8 flex flex-col gap-3 rounded-full glass-dark p-2 sm:flex-row sm:items-center"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent px-5 py-3 text-cream placeholder:text-cream/50 outline-none"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-cocoa transition-all hover:scale-[1.03] hover:shadow-luxe"
              >
                {sent ? "Welcome 🤍" : "Subscribe"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
