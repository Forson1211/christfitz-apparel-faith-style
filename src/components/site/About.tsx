import { motion } from "framer-motion";
import aboutImg from "@/assets/about.jpg";
import collectionEss from "@/assets/collection-essentials.jpg";

export function About() {
  return (
    <section id="about" className="relative py-28 sm:py-36 overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{ background: "oklch(0.42 0.05 50 / 0.15)" }}
      />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Our Story</p>
          <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance">
            Faith meets <span className="">fashion.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            ChristFitz was born from a simple belief: streetwear with purpose.
            Every piece is designed to inspire confidence, spark conversations,
            and remind you of who you are — chosen, loved, and called.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Crafted in small batches with premium organic cotton, our garments
            are made to outlast trends. Wear your story. Wear your faith.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["Organic", "100% cotton"],
              ["Limited", "Small batches"],
              ["Ethical", "Fair sourced"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl glass p-4">
                <div className="font-display text-xl text-cocoa">{t}</div>
                <div className="mt-1 text-xs text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative h-[34rem]"
        >
          <motion.img
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src={aboutImg}
            alt="ChristFitz community"
            width={1024}
            height={1280}
            loading="lazy"
            className="absolute right-0 top-0 h-[26rem] w-[72%] rounded-3xl object-cover shadow-luxe"
          />
          <motion.img
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            src={collectionEss}
            alt="Cream hoodie"
            width={1024}
            height={1280}
            loading="lazy"
            className="absolute bottom-0 left-0 h-[20rem] w-[55%] rounded-3xl object-cover shadow-luxe ring-8 ring-cream"
          />
          <div className="absolute bottom-6 right-6 rounded-2xl glass p-5 max-w-[14rem] shadow-soft">
            <div className="font-display text-3xl text-cocoa">Est. 2024</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Built by believers, worn by the bold.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
