import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 sm:pt-32"
        >
          <div className="absolute inset-0 bg-cocoa/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-cream text-cocoa shadow-luxe"
          >
            <div className="flex items-center gap-3 border-b border-cocoa/10 px-5 py-4">
              <SearchIcon className="h-5 w-5 text-cocoa/60" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tees, hoodies, accessories…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-cocoa/40"
              />
              <button
                onClick={onClose}
                aria-label="Close search"
                className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-cocoa/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for "{query}"
                </p>
              ) : (
                <ul className="flex flex-col">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          addItem(p);
                          onClose();
                        }}
                        className="flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition hover:bg-cocoa/5"
                      >
                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-cocoa/5">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            {p.category}
                          </p>
                        </div>
                        <span className="text-sm tabular-nums">${p.price}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
