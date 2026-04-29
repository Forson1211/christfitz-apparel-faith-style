import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import tees from "@/assets/collection-tees.jpg";
import essentials from "@/assets/collection-essentials.jpg";
import premium from "@/assets/collection-premium.jpg";

const items = [
  { title: "Oversized Tees", count: "12 Pieces", img: tees, tag: "Daily wear" },
  { title: "Faith Essentials", count: "18 Pieces", img: essentials, tag: "Bestseller" },
  { title: "Premium Streetwear", count: "9 Pieces", img: premium, tag: "Limited" },
];

export function Collections() {
  return (
    <section id="collections" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Curated Drops</p>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance">
              Collections built<br /><span className="italic">to inspire.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Three signature lines, each crafted with intention. Soft hands, bold spirit.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.a
              key={item.title}
              href="#products"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft"
            >
              <img
                src={item.img}
                alt={item.title}
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa via-cocoa/40 to-transparent opacity-90" />

              <div className="absolute left-5 top-5">
                <span className="rounded-full glass-dark px-3 py-1 text-[10px] uppercase tracking-widest text-cream">
                  {item.tag}
                </span>
              </div>

              <div className="absolute inset-x-5 bottom-5 text-cream">
                <div className="rounded-2xl glass-dark p-5 transition-all duration-500 group-hover:translate-y-[-4px]">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl">{item.title}</h3>
                      <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">{item.count}</p>
                    </div>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-cocoa transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
