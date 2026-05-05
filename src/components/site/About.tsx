import { motion } from "framer-motion";
import { useSite, resolveImage } from "@/lib/site";

export function About() {
  const { settings } = useSite();
  const a = settings.about;

  return (
    <section id="about" className="relative py-20 sm:py-28 md:py-36 overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{ background: "oklch(0.42 0.05 50 / 0.15)" }}
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:gap-16 px-5 sm:px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coffee">— {a.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl md:text-6xl text-balance">
            {a.title}
          </h2>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
            {a.body}
          </p>

          <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 sm:gap-4">
            {a.features.map((f) => (
              <div key={f.title} className="rounded-2xl glass p-3 sm:p-4">
                <div className="font-display text-base sm:text-xl text-cocoa">{f.title}</div>
                <div className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{f.subtitle}</div>
              </div>
            ))}
          </div>
        </motion.div>
 
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative h-[26rem] sm:h-[34rem]"
        >
          <motion.img
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src={resolveImage(a.images.main)}
            alt="ChristFitz community"
            loading="lazy"
            className="absolute right-0 top-0 h-[20rem] sm:h-[26rem] w-[72%] rounded-3xl object-cover shadow-luxe"
          />
          <motion.img
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            src={resolveImage(a.images.secondary)}
            alt="Cream hoodie"
            loading="lazy"
            className="absolute bottom-0 left-0 h-[16rem] sm:h-[20rem] w-[55%] rounded-3xl object-cover shadow-luxe ring-4 sm:ring-8 ring-cream"
          />
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 rounded-2xl glass p-4 sm:p-5 max-w-[14rem] shadow-soft">
            <div className="font-display text-2xl sm:text-3xl text-cocoa">{a.stat.label}</div>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
              {a.stat.text}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
