import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-cocoa text-cream">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display text-2xl">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cream text-cocoa font-bold">
                ✝
              </span>
              ChristFitz
            </div>
            <p className="mt-5 max-w-sm text-cream/70 leading-relaxed">
              Premium Christian streetwear designed for bold believers. Faith meets fashion, stitched into every piece.
            </p>
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
              {["T-Shirts", "Hoodies", "Accessories", "New Arrivals", "Sale"].map((l) => (
                <li key={l}>
                  <a href="#products" className="transition hover:text-cream">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-cream/50">Brand</h4>
            <ul className="mt-5 space-y-3 text-sm text-cream/80">
              {["About", "Mission", "Lookbook", "Contact", "FAQ"].map((l) => (
                <li key={l}>
                  <a href="#about" className="transition hover:text-cream">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row">
          <p>© 2026 ChristFitz Apparel. All rights reserved.</p>
          <p className="font-display italic text-sm">"Be bold, be loved, be Christ-fit."</p>
        </div>
      </div>
    </footer>
  );
}
