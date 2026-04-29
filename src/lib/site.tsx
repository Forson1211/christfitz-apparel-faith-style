import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "./assetMap";

export interface DBProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description: string | null;
  details: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  verse: string | null;
  position: number;
  active: boolean;
}

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  position: number;
}

export interface DBNavLink {
  id: string;
  label: string;
  href: string;
  position: number;
  visible: boolean;
}

export interface SiteSettings {
  brand: { name: string; tagline: string };
  colors: { cocoa: string; coffee: string; cream: string; gold: string };
  logo: { url: string; symbol: string };
  favicon: { url: string };
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: { eyebrow: string; title: string; body: string };
  footer: { text: string; copyright: string };
}

export const defaultSettings: SiteSettings = {
  brand: { name: "ChristFitz", tagline: "Premium Christian Streetwear" },
  colors: { cocoa: "#3B2418", coffee: "#6B4A3A", cream: "#F8F4EF", gold: "#C9A96E" },
  logo: { url: "", symbol: "✝" },
  favicon: { url: "" },
  hero: {
    eyebrow: "Faith · Fashion · Freedom",
    title: "Wear Your Faith.",
    titleAccent: "Boldly.",
    subtitle:
      "Premium streetwear designed for the modern believer. Crafted with intention. Worn with conviction.",
    primaryCta: "Shop Collection",
    secondaryCta: "Our Story",
  },
  about: {
    eyebrow: "Our Story",
    title: "Built on faith. Crafted with intention.",
    body: "ChristFitz Apparel was born from a simple conviction — that faith and fashion were never meant to be separate.",
  },
  footer: {
    text: "Premium streetwear for the modern believer. Crafted with intention.",
    copyright: "© 2026 ChristFitz Apparel. All rights reserved.",
  },
};

interface SiteContextValue {
  settings: SiteSettings;
  products: DBProduct[];
  categories: DBCategory[];
  navLinks: DBNavLink[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [navLinks, setNavLinks] = useState<DBNavLink[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [s, p, c, n] = await Promise.all([
      supabase.from("site_settings").select("key, value"),
      supabase.from("products").select("*").order("position"),
      supabase.from("categories").select("*").order("position"),
      supabase.from("nav_links").select("*").order("position"),
    ]);

    if (s.data) {
      const merged = { ...defaultSettings };
      for (const row of s.data) {
        (merged as any)[row.key] = row.value;
      }
      setSettings(merged);
    }
    if (p.data) {
      setProducts(
        p.data.map((row: any) => ({
          ...row,
          price: Number(row.price),
          rating: Number(row.rating),
          details: Array.isArray(row.details) ? row.details : [],
          sizes: Array.isArray(row.sizes) ? row.sizes : [],
        }))
      );
    }
    if (c.data) setCategories(c.data as any);
    if (n.data) setNavLinks((n.data as any).filter((l: DBNavLink) => l.visible));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  // Apply theme colors as CSS variables (with hex -> use directly via custom prop)
  useEffect(() => {
    const r = document.documentElement;
    const c = settings.colors;
    r.style.setProperty("--cocoa-hex", c.cocoa);
    r.style.setProperty("--coffee-hex", c.coffee);
    r.style.setProperty("--cream-hex", c.cream);
    r.style.setProperty("--gold-hex", c.gold);
  }, [settings.colors]);

  // Apply favicon
  useEffect(() => {
    if (!settings.favicon.url) return;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.favicon.url;
  }, [settings.favicon.url]);

  return (
    <SiteContext.Provider value={{ settings, products, categories, navLinks, loading, refresh }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}

// Helper for product cards/cart that need a usable image URL
export function productImage(p: DBProduct): string {
  return resolveImage(p.image_url);
}
