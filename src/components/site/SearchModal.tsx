import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSite, productImage } from "@/lib/site";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { products, categories } = useSite();

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

    // 1. Static Pages with Keywords
    const pages = [
      {
        name: "About ChristFitz",
        category: "Page",
        href: "/about",
        keys: ["story", "mission", "who", "brand"],
      },
      {
        name: "Contact & Support",
        category: "Page",
        href: "/contact",
        keys: ["help", "email", "phone", "address", "support"],
      },
      {
        name: "Shipping & Returns",
        category: "Page",
        href: "/shipping",
        keys: ["delivery", "track", "refund", "exchange", "orders"],
      },
      {
        name: "Frequently Asked Questions",
        category: "Page",
        href: "/faqs",
        keys: ["faq", "help", "how to", "questions"],
      },
      {
        name: "Privacy Policy",
        category: "Page",
        href: "/privacy",
        keys: ["legal", "data", "security", "terms"],
      },
      {
        name: "Terms of Service",
        category: "Page",
        href: "/terms",
        keys: ["legal", "rules", "policy"],
      },
    ].filter((p) => !q || p.name.toLowerCase().includes(q) || p.keys.some((k) => k.includes(q)));

    // 2. Categories
    const cats = categories
      .map((c: any) => ({
        name: c.name,
        category: "Collection",
        href: `/products?category=${c.name}`,
      }))
      .filter((c: any) => !q || c.name.toLowerCase().includes(q));

    // 3. Deep Product Search
    const prods = products
      .filter((p) => {
        if (!q) return false;
        const name = p.name.toLowerCase();
        const cat = p.category.toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const details = (p.details || []).join(" ").toLowerCase();
        return name.includes(q) || cat.includes(q) || desc.includes(q) || details.includes(q);
      })
      .slice(0, q ? 10 : 4);

    if (!q) {
      // Show default "Discover" items when search is empty
      const featuredProds = products.slice(0, 4);
      return { prods: featuredProds, pages: pages.slice(0, 3), cats: cats.slice(0, 3) };
    }
    return { prods, pages, cats };
  }, [query, products, categories]);

  const hasResults =
    results.prods.length > 0 || results.pages.length > 0 || results.cats.length > 0;

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
            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-cream text-cocoa shadow-luxe"
          >
            <div className="flex items-center gap-3 border-b border-cocoa/10 px-6 py-5">
              <SearchIcon className="h-6 w-6 text-gold" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    navigate({ to: "/products", search: { category: query.trim() } });
                    onClose();
                  }
                }}
                placeholder="Search the whole site..."
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-cocoa/30"
              />
              <button
                onClick={onClose}
                aria-label="Close search"
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-cocoa/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4 custom-scrollbar space-y-6">
              {!hasResults ? (
                <div className="py-20 text-center">
                  <p className="text-cocoa/40 italic">
                    We couldn't find anything matching "{query}"
                  </p>
                  <button
                    onClick={() => setQuery("")}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-gold hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  {/* Category Results */}
                  {results.cats.length > 0 && (
                    <div className="space-y-2">
                      <p className="px-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/40 font-bold">
                        Collections
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {results.cats.map((c: any) => (
                          <button
                            key={c.name}
                            onClick={() => {
                              navigate({ to: c.href as any });
                              onClose();
                            }}
                            className="flex items-center gap-3 rounded-2xl bg-cocoa/5 p-3 text-left transition hover:bg-gold hover:text-cocoa"
                          >
                            <span className="font-medium text-sm">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Page Results */}
                  {results.pages.length > 0 && (
                    <div className="space-y-2">
                      <p className="px-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/40 font-bold">
                        Help & Info
                      </p>
                      <div className="grid gap-1">
                        {results.pages.map((p) => (
                          <button
                            key={p.name}
                            onClick={() => {
                              navigate({ to: p.href as any });
                              onClose();
                            }}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-cocoa/5 group"
                          >
                            <span className="text-sm font-medium">{p.name}</span>
                            <span className="text-[10px] uppercase tracking-widest text-cocoa/30 group-hover:text-gold transition-colors">
                              Go to page →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Results */}
                  {results.prods.length > 0 && (
                    <div className="space-y-2">
                      <p className="px-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/40 font-bold">
                        Products
                      </p>
                      <ul className="grid gap-2">
                        {results.prods.map((p) => (
                          <li key={p.id}>
                            <button
                              onClick={() => {
                                navigate({ to: "/products", search: { category: p.category } });
                                onClose();
                              }}
                              className="group flex w-full items-center gap-4 rounded-3xl border border-transparent p-2.5 text-left transition-all hover:bg-cocoa hover:text-cream hover:shadow-luxe"
                            >
                              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-cocoa/5 transition-transform group-hover:scale-105">
                                <img
                                  src={productImage(p)}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-display text-lg leading-tight">
                                  {p.name}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-cocoa/40 group-hover:text-cream/50 mt-0.5">
                                  {p.category}
                                </p>
                              </div>
                              <div className="text-right pr-2">
                                <p className="font-bold tabular-nums">₵{p.price}</p>
                                <p className="text-[9px] uppercase tracking-tighter opacity-40">
                                  View Piece
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
