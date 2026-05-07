import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    console.log("[Newsletter] Attempting to subscribe:", email);
    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email }]);

      if (error) {
        console.error("[Newsletter] Supabase error:", error);
        // Handle unique constraint error (already subscribed)
        if (error.code === "23505") {
          setSent(true);
          toast.success("You're already on the list! 🤍");
          return;
        }
        toast.error("Database error: " + error.message);
        return;
      }

      console.log("[Newsletter] Subscription successful");
      setSent(true);
      toast.success("Welcome to the movement! 🤍");
      setEmail("");
    } catch (error: any) {
      console.error("[Newsletter] Unexpected error:", error);
      toast.error("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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
          {/* ... background elements ... */}
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
              Join the <span className="">movement.</span>
            </h2>
            <p className="mt-4 max-w-xl text-cream/80">
              Early access to drops, devotional notes, and 10% off your first order.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:glass-dark sm:p-2"
            >
              <div className="flex-1 rounded-full glass-dark sm:bg-white/5 sm:backdrop-blur-md">
                <input
                  type="email"
                  required
                  value={email}
                  disabled={loading || sent}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-full bg-transparent px-6 py-4 sm:py-3 text-cream placeholder:text-cream/50 outline-none disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || sent}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-cream px-8 py-4 sm:py-3 text-sm font-bold text-cocoa transition-all hover:scale-[1.02] sm:font-medium disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : sent ? (
                    "Welcome 🤍"
                  ) : (
                    "Subscribe"
                  )}
                  {!loading && !sent && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold/20 to-transparent transition-transform duration-500 group-hover:translate-x-0" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
