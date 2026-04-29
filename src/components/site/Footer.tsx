import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSite } from "@/lib/site";

export function Footer() {
  const { settings, categories, navLinks } = useSite();

  return (
    <footer className="relative bg-cocoa text-cream">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-16 sm:py-20">
        <div className="grid gap-10 sm:gap-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display text-2xl">
              {settings.logo.url ? (
                <img src={settings.logo.url} alt={settings.brand.name} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cream text-cocoa font-bold">
                  {settings.logo.symbol || "✝"}
                </span>
              )}
              {settings.brand.name}
            </div>
            <p className="mt-5 max-w-sm text-cream/70 leading-relaxed">{settings.footer.text}</p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full glass-dark transition hover:bg-cream hover:text-cocoa"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-cream/50">Shop</h4>
            <ul className="mt-5 space-y-3 text-sm text-cream/80">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to="/products" className="transition hover:text-cream">{c.name}</Link>
                </li>
              ))}
              <li><Link to="/products" className="transition hover:text-cream">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-cream/50">Brand</h4>
            <ul className="mt-5 space-y-3 text-sm text-cream/80">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <Link to={l.href} className="transition hover:text-cream">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 sm:mt-16 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row">
          <p>{settings.footer.copyright}</p>
          <p className="font-display text-sm text-center">"Be bold, be loved, be Christ-fit."</p>
        </div>
      </div>
    </footer>
  );
}
