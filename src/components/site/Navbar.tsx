import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, User as UserIcon } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSite } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { SearchModal } from "./SearchModal";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, openCart } = useCart();
  const { settings, navLinks } = useSite();
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const onHome = path === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On non-home pages, the navbar floats over a light background — use dark text
  const tone = onHome && !scrolled ? "text-cream" : scrolled ? "text-cream" : "text-cocoa";

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2 sm:py-3" : "py-4 sm:py-5"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-5">
          <div
            className={`flex items-center justify-between rounded-full px-4 sm:px-5 py-2.5 sm:py-3 transition-all duration-500 ${
              scrolled || !onHome ? "glass-dark text-cream shadow-soft" : tone
            }`}
          >
            <Link to="/" className="flex items-center gap-2 font-display text-lg sm:text-xl tracking-tight">
              {settings.logo.url ? (
                <img src={settings.logo.url} alt={settings.brand.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cream text-cocoa font-bold">
                  {settings.logo.symbol || "✝"}
                </span>
              )}
              <span>{settings.brand.name}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-sm">
              {navLinks.map((l) => (
                <Link
                  key={l.id}
                  to={l.href}
                  activeOptions={{ exact: l.href === "/" }}
                  className="relative opacity-85 transition hover:opacity-100 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-all hover:after:w-full data-[status=active]:opacity-100 data-[status=active]:after:w-full"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden sm:grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition"
              >
                <Search className="h-4 w-4" />
              </button>
              <Link
                to="/account"
                aria-label={user ? "Account" : "Sign in"}
                className="hidden sm:grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition relative"
              >
                <UserIcon className="h-4 w-4" />
                {user && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold" />}
              </Link>
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition"
              >
                <ShoppingBag className="h-4 w-4" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-gold text-cocoa text-[10px] font-bold"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="md:hidden grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-cocoa/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 24 }}
                className="absolute right-0 top-0 h-full w-80 max-w-[85%] glass-dark p-7 text-cream"
              >
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="mt-10 flex flex-col gap-5 font-display text-3xl">
                  {navLinks.map((l, i) => (
                    <motion.div
                      key={l.id}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      <Link to={l.href} onClick={() => setOpen(false)}>
                        {l.label}
                      </Link>
                    </motion.div>
                  ))}
                  <button
                    onClick={() => { setOpen(false); setSearchOpen(true); }}
                    className="text-left"
                  >
                    Search
                  </button>
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
