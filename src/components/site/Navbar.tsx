import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/#products" },
  { label: "Collections", href: "/#collections" },
  { label: "About", href: "/#about" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-5 transition-all duration-500 ${
          scrolled ? "" : ""
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass-dark text-cream shadow-soft" : "text-cream"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-cream text-cocoa font-bold">
              ✝
            </span>
            <span>ChristFitz</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="relative opacity-85 transition hover:opacity-100 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="hidden sm:grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition">
              <Search className="h-4 w-4" />
            </button>
            <button className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition">
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-cocoa text-[10px] font-bold">
                2
              </span>
            </button>
            <button
              onClick={() => setOpen(true)}
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
              className="absolute right-0 top-0 h-full w-80 max-w-[85%] glass-dark p-8 text-cream"
            >
              <div className="flex justify-end">
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="mt-10 flex flex-col gap-6 font-display text-3xl">
                {links.map((l, i) => (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
