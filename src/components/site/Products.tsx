import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import { products, type Category, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { ProductDetail } from "./ProductDetail";

const tabs: ("All" | Category)[] = ["All", "T-Shirts", "Hoodies", "Accessories"];

export function Products() {
  const [active, setActive] = useState<(typeof tabs)[number]>("All");
  const [selected, setSelected] = useState<Product | null>(null);
  const { addItem } = useCart();
  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <section id="products" className="relative py-28 sm:py-36 bg-sand/40">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-coffee">— The Collection</p>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance">
              Pieces for the faithful.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 rounded-full glass p-1.5">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`relative rounded-full px-5 py-2 text-sm transition ${
                  active === t ? "text-cream" : "text-cocoa/70 hover:text-cocoa"
                }`}
              >
                {active === t && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-cocoa"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div layout className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
                onClick={() => setSelected(p)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl glass shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-luxe"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(p);
                    }}
                    aria-label={`Quick view ${p.name}`}
                    className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full glass-dark text-cream opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <span className="absolute left-3 top-3 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-widest text-cocoa">
                    {p.category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-cocoa">{p.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">${p.price}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(p);
                    }}
                    aria-label={`Add ${p.name} to cart`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cocoa text-cream transition-transform hover:rotate-90 hover:bg-coffee"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProductDetail product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
