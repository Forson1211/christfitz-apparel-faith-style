import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { FloatingOrbs } from "./FloatingOrbs";
import { useSite } from "@/lib/site";

export function Hero() {
  const { settings } = useSite();
  const h = settings.hero;

  return (
    <section className="relative min-h-screen w-full overflow-hidden text-cream">
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={heroImg}
          alt="Model wearing ChristFitz oversized tee"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa/40 via-cocoa/55 to-cocoa" />
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa/80 via-cocoa/30 to-transparent" />
      </motion.div>

      <FloatingOrbs variant="dark" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 sm:px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="inline-flex w-fit items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {h.eyebrow}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-5xl leading-[0.95] sm:text-7xl md:text-8xl lg:text-9xl text-balance max-w-5xl"
        >
          {h.title}
          <br />
          <span className="font-light marquee-text">{h.titleAccent}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg text-cream/80 leading-relaxed"
        >
          {h.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <Link
            to="/products"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-cream px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-medium text-cocoa transition-all hover:scale-[1.03] hover:shadow-luxe"
          >
            <span className="relative z-10">{h.primaryCta}</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold to-cream transition-transform duration-500 group-hover:translate-x-0" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full glass-dark px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-medium transition hover:bg-cream/10"
          >
            {h.secondaryCta}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-16 sm:mt-20 grid max-w-2xl grid-cols-3 gap-6 sm:gap-8 border-t border-cream/15 pt-6 sm:pt-8"
        >
          {[
            ["50K+", "Believers"],
            ["120+", "Designs"],
            ["4.9★", "Rated"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="font-display text-2xl sm:text-3xl md:text-4xl">{v}</div>
              <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-widest text-cream/60">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-cream/40 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="h-1.5 w-1 rounded-full bg-cream"
          />
        </div>
      </motion.div>
    </section>
  );
}
