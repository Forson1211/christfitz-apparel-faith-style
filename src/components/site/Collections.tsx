import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import tees from "@/assets/collection-tees.jpg";
import essentials from "@/assets/collection-essentials.jpg";
import premium from "@/assets/collection-premium.jpg";
import { useSite } from "@/lib/site";
import { resolveImage } from "@/lib/assetMap";

const fallbackImgs = [tees, essentials, premium];
const tags = ["Daily wear", "Bestseller", "Limited"];

export function Collections({ limit = 3 }: { limit?: number }) {
  const { categories, products, settings } = useSite();
  const content = settings.collections || {
    title: "Collections built to inspire.",
    subtitle: "Signature lines, each crafted with intention. Soft hands, bold spirit."
  };

  const displayedCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <section id="collections" className="relative py-20 sm:py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-start justify-between gap-5 sm:gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Curated Drops</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl md:text-6xl whitespace-nowrap sm:whitespace-normal">
              {content.title}
            </h2>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-4">
            <p className="max-w-sm text-muted-foreground sm:text-right">
              {content.subtitle}
            </p>
            {limit && categories.length > limit && (
              <Link
                to="/categories"
                className="text-xs font-bold uppercase tracking-widest text-coffee border-b border-coffee/20 pb-1 hover:border-coffee transition-colors"
              >
                View all collections
              </Link>
            )}
          </div>
        </motion.div>

        <div className="mt-12 sm:mt-16 grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCategories.map((cat, i) => {
            const count = products.filter((p) => p.category === cat.name).length;
            const img = cat.image_url
              ? resolveImage(cat.image_url)
              : (fallbackImgs[i] ?? fallbackImgs[0]);

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
              >
                <Link
                  to="/products"
                  className="group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-soft"
                >
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa via-cocoa/40 to-transparent opacity-90" />

                  <div className="absolute left-5 top-5">
                    <span className="rounded-full glass-dark px-3 py-1 text-[10px] uppercase tracking-widest text-cream">
                      {cat.tag || "Collection"}
                    </span>
                  </div>

                  <div className="absolute inset-x-5 bottom-5 text-cream">
                    <div className="rounded-2xl glass-dark p-5 transition-all duration-500 group-hover:translate-y-[-4px]">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl">{cat.name}</h3>
                          <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">
                            {count} {count === 1 ? "Piece" : "Pieces"}
                          </p>
                        </div>
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-cocoa transition-transform group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
