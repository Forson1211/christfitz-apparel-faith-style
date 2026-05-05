import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User as UserIcon,
  Package,
  Heart,
  LogOut,
} from "lucide-react";
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
  const { user, signOut } = useAuth();
  const location = useLocation();
  const path = location.pathname;
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
          <div className="flex items-center justify-between rounded-full px-4 sm:px-5 py-2.5 sm:py-3 transition-all duration-500 glass-dark text-cream shadow-soft">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 font-display text-lg sm:text-xl tracking-tight"
            >
              {settings.logo.url || "/logo.png" ? (
                <img
                  src={settings.logo.url || "/logo.png"}
                  alt={settings.brand.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-cocoa font-bold">
                  {settings.logo.symbol || "✝"}
                </span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
              {navLinks.map((l) => (
                <Link
                  key={l.id}
                  to={l.href}
                  onClick={() => l.href === "/" && window.scrollTo({ top: 0, behavior: "smooth" })}
                  activeOptions={{ exact: l.href === "/" }}
                  className="relative opacity-70 transition hover:opacity-100 after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-gold after:transition-all hover:after:w-full data-[status=active]:opacity-100 data-[status=active]:after:w-full"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition"
              >
                <Search className="h-4 w-4" />
              </button>
              <div className="relative hidden sm:block group">
                <button className="flex items-center gap-2 h-9 px-3 rounded-full hover:bg-cream/10 transition">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Account</span>
                  <motion.span animate={{ rotate: 0 }} className="text-gold">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.span>
                </button>

                <div className="absolute right-0 mt-2 w-64 origin-top-right invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[60]">
                  <div className="rounded-[2rem] bg-white text-cocoa shadow-luxe overflow-hidden border border-cocoa/5 p-2">
                    {!user ? (
                      <div className="p-4">
                        <Link
                          to="/account"
                          className="flex items-center justify-center w-full rounded-2xl bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-cocoa shadow-soft hover:bg-gold/80 transition-all mb-4"
                        >
                          Sign In
                        </Link>
                        <div className="h-[1px] bg-cocoa/5 mb-2" />
                      </div>
                    ) : (
                      <div className="p-4 pb-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cocoa/40 font-bold mb-1">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold truncate">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <div className="h-[1px] bg-cocoa/5 mt-4 mb-2" />
                      </div>
                    )}

                    <div className="space-y-1">
                      {[
                        { label: "My Account", href: "/account", Icon: UserIcon },
                        { label: "Orders", href: "/account", Icon: Package },
                        { label: "Wishlist", href: "/account", Icon: Heart },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.href as any}
                          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-cocoa/70 hover:bg-cocoa/5 hover:text-cocoa transition-all"
                        >
                          <item.Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {user && (
                      <div className="mt-2 pt-2 border-t border-cocoa/5">
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={openCart}
                aria-label="Open cart"
                className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition"
              >
                <ShoppingCart className="h-4 w-4" />
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
                className="md:hidden relative grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10 transition group"
              >
                <div className="flex flex-col gap-1.5 w-5 items-end group-hover:items-center transition-all duration-300">
                  <motion.span 
                    animate={open ? { rotate: 45, y: 7, width: "100%" } : { rotate: 0, y: 0, width: "100%" }}
                    className="h-0.5 w-full bg-current rounded-full" 
                  />
                  <motion.span 
                    animate={open ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                    className="h-0.5 w-3/4 bg-current rounded-full" 
                  />
                  <motion.span 
                    animate={open ? { rotate: -45, y: -7, width: "100%" } : { rotate: 0, y: 0, width: "60%" }}
                    className="h-0.5 w-full bg-current rounded-full" 
                  />
                </div>
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
              <div
                className="absolute inset-0 bg-cocoa/80 backdrop-blur-xl"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                className="absolute right-0 top-0 h-full w-80 max-w-[85%] glass-dark p-7 text-cream"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display text-xl tracking-tight">
                    {settings.logo.url || "/logo.png" ? (
                      <img
                        src={settings.logo.url || "/logo.png"}
                        alt={settings.brand.name}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-cocoa font-bold">
                        {settings.logo.symbol || "✝"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="mt-8 flex flex-col gap-4">
                  <div className="flex flex-col gap-2 font-display text-3xl">
                    {navLinks.map((l, i) => (
                      <motion.div
                        key={l.id}
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.03 * i }}
                      >
                        <Link
                          to={l.href}
                          onClick={() => setOpen(false)}
                          className="hover:text-gold transition-colors"
                        >
                          {l.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cream/40 font-bold px-1">
                      Account & Settings
                    </p>
                    <div className="grid gap-2">
                      {[
                        { label: "Profile Settings", href: "/account", Icon: UserIcon },
                        { label: "Order History", href: "/account", Icon: Package },
                        { label: "My Wishlist", href: "/account", Icon: Heart },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 + 0.03 * i }}
                        >
                          <Link
                            to={item.href as any}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10 transition-all"
                          >
                            <item.Icon className="h-4 w-4 text-gold" />
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    {!user ? (
                      <Link
                        to="/account"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center w-full rounded-2xl bg-gold py-3.5 text-sm font-bold uppercase tracking-widest text-cocoa shadow-soft hover:scale-[1.02] transition-all"
                      >
                        Sign In / Join
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          signOut();
                          setOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white/5 py-3.5 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    )}
                  </div>

                  {/* Search bar removed from mobile menu as requested */}
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
