import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Plus, Minus, ShoppingBag, Truck, Shield, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import type { DBProduct } from "@/lib/site";
import { productImage } from "@/lib/site";

interface Props {
  product: DBProduct | null;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setSize(product.sizes[Math.min(2, product.sizes.length - 1)] ?? "");
      setQty(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-12"
        >
          <div className="absolute inset-0 bg-cocoa/75 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-cream text-cocoa shadow-luxe"
            role="dialog"
            aria-label={product.name}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-cocoa shadow-soft transition hover:bg-cream"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid max-h-[90vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
              <div className="relative aspect-square bg-sand/40 md:aspect-auto">
                <img
                  src={productImage(product)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-widest text-cocoa">
                  {product.category}
                </span>
              </div>

              <div className="flex flex-col gap-5 p-6 sm:p-9">
                <div>
                  {product.verse && (
                    <p className="text-xs uppercase tracking-[0.3em] text-coffee">— {product.verse}</p>
                  )}
                  <h2 className="mt-2 font-display text-3xl sm:text-4xl">{product.name}</h2>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(product.rating) ? "fill-gold text-gold" : "text-cocoa/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {product.rating} · {product.reviews} reviews
                    </span>
                  </div>
                  <p className="mt-4 font-display text-3xl">${product.price.toFixed(2)}</p>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

                {product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-[0.25em]">Size</h3>
                      <button className="text-xs text-coffee underline-offset-2 hover:underline">Size guide</button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`min-w-[3rem] rounded-full border px-4 py-2 text-sm transition ${
                            size === s ? "border-cocoa bg-cocoa text-cream" : "border-cocoa/20 hover:border-cocoa"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-cocoa/20">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-cocoa/5">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center tabular-nums">{qty}</span>
                    <button onClick={() => setQty((q) => q + 1)} aria-label="Increase" className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-cocoa/5">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      for (let i = 0; i < qty; i++) addItem(product);
                      onClose();
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-cocoa px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-coffee"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to cart
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-sand/50 p-3 text-[11px] text-cocoa/70">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Truck className="h-4 w-4" />
                    Free over $100
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <RotateCcw className="h-4 w-4" />
                    30-day returns
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Shield className="h-4 w-4" />
                    Secure checkout
                  </div>
                </div>

                {product.details.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.25em]">Details</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {product.details.map((d) => (
                        <li key={d} className="flex gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-coffee" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
