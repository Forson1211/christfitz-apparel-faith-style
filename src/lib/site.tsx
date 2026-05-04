import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { resolveImage } from "./assetMap";
export { resolveImage };

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
    background: string;
  };
  about: { eyebrow: string; title: string; body: string };
  instagram: {
    handle: string;
    title: string;
    cta: string;
    url: string;
    images: { url: string; span: string }[];
  };
  footer: { text: string; copyright: string };
}

export const defaultSettings: SiteSettings = {
  brand: { name: "ChristFitz", tagline: "Premium Christian Streetwear" },
  colors: { cocoa: "#3B2418", coffee: "#6B4A3A", cream: "#F8F4EF", gold: "#C9A96E" },
  logo: { url: "/logo.png", symbol: "✝" },
  favicon: { url: "/favicon.png" },
  hero: {
    eyebrow: "Faith · Fashion · Freedom",
    title: "Wear Your Faith",
    titleAccent: "Boldly",
    subtitle:
      "Premium streetwear designed for the modern believer. Crafted with intention. Worn with conviction.",
    primaryCta: "Shop Collection",
    secondaryCta: "Our Story",
    background: "/background.png",
  },
  about: {
    eyebrow: "Our Story",
    title: "Built on faith. Crafted with intention.",
    body: "ChristFitz Apparel was born from a simple conviction — that faith and fashion were never meant to be separate.",
  },
  instagram: {
    handle: "@christfitz",
    title: "Live the movement.",
    cta: "Follow on Instagram",
    url: "https://instagram.com/christfitz",
    images: [
      { url: "hero.jpg", span: "row-span-2" },
      { url: "p2.jpg", span: "" },
      { url: "p5.jpg", span: "" },
      { url: "about.jpg", span: "row-span-2" },
      { url: "p1.jpg", span: "" },
      { url: "collection-essentials.jpg", span: "" },
      { url: "p4.jpg", span: "" },
      { url: "p6.jpg", span: "" },
    ],
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
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem("cf_site_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          // Deep merge simple objects
          const merged = { ...defaultSettings };
          Object.keys(parsed).forEach((key) => {
            if (
              parsed[key] &&
              typeof parsed[key] === "object" &&
              !Array.isArray(parsed[key]) &&
              merged[key as keyof SiteSettings]
            ) {
              (merged as any)[key] = {
                ...(merged[key as keyof SiteSettings] as object),
                ...parsed[key],
              };
            } else {
              (merged as any)[key] = parsed[key];
            }
          });
          return merged;
        }
      }
    } catch {}
    return defaultSettings;
  });
  const [products, setProducts] = useState<DBProduct[]>(() => {
    try {
      const cached = localStorage.getItem("cf_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [categories, setCategories] = useState<DBCategory[]>(() => {
    try {
      const cached = localStorage.getItem("cf_categories");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [navLinks, setNavLinks] = useState<DBNavLink[]>(() => {
    try {
      const cached = localStorage.getItem("cf_nav_links");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    // Global Throttle Check
    const throttleUntil = (window as any)._supabaseThrottleUntil || 0;
    if (Date.now() < throttleUntil) {
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled([
        supabase.from("site_settings").select("key, value"),
        supabase.from("products").select("*").order("position"),
        supabase.from("categories").select("*").order("position"),
        supabase.from("nav_links").select("*").order("position"),
      ]);

      // 1. Process Settings
      const sResult = results[0];
      if (sResult.status === "fulfilled" && sResult.value.data) {
        const nextSettings = { ...defaultSettings };
        sResult.value.data.forEach((row: any) => {
          const parts = row.key.split(".");
          if (parts.length === 2) {
            // Handle nested keys: e.g. "brand.name"
            const parentKey = parts[0] as keyof SiteSettings;
            if (nextSettings[parentKey] && typeof nextSettings[parentKey] === "object") {
              (nextSettings as any)[parentKey][parts[1]] = row.value;
            }
          } else if (parts.length === 1) {
            // Handle top-level keys: e.g. "colors", "logo", "hero"
            const key = parts[0] as keyof SiteSettings;
            if (nextSettings[key] !== undefined) {
              if (typeof row.value === "object" && row.value !== null && !Array.isArray(row.value)) {
                (nextSettings as any)[key] = {
                  ...(nextSettings[key] as object),
                  ...row.value,
                };
              } else {
                (nextSettings as any)[key] = row.value;
              }
            }
          }
        });
        setSettings(nextSettings);
        localStorage.setItem("cf_site_settings", JSON.stringify(nextSettings));
      }

      // 2. Process Products
      const pResult = results[1];
      if (pResult.status === "fulfilled" && pResult.value.data) {
        const formattedProducts = pResult.value.data.map((row: any) => ({
          ...row,
          price: Number(row.price),
          rating: Number(row.rating),
          details: Array.isArray(row.details) ? row.details : [],
          sizes: Array.isArray(row.sizes) ? row.sizes : [],
        }));
        setProducts(formattedProducts);
        localStorage.setItem("cf_products", JSON.stringify(formattedProducts));
      }

      // 3. Process Categories
      const cResult = results[2];
      if (cResult.status === "fulfilled" && cResult.value.data) {
        setCategories(cResult.value.data as any);
        localStorage.setItem("cf_categories", JSON.stringify(cResult.value.data));
      }

      // 4. Process Nav Links
      const nResult = results[3];
      if (nResult.status === "fulfilled" && nResult.value.data) {
        const visibleLinks = (nResult.value.data as any).filter((l: DBNavLink) => l.visible);
        setNavLinks(visibleLinks);
        localStorage.setItem("cf_nav_links", JSON.stringify(visibleLinks));
      }

      // Schedule background refresh in 5 minutes to keep it fresh without hammering DB
      setTimeout(refresh, 300000);
    } catch (err) {
      console.error("[Site] Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  useEffect(() => {
    refresh();

    // Subscribe to realtime updates for site_settings, products, categories, and nav_links
    const channel = supabase
      .channel("site_data_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        console.log("[Realtime] Site settings changed, refreshing...");
        refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        console.log("[Realtime] Products changed, refreshing...");
        refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        console.log("[Realtime] Categories changed, refreshing...");
        refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "nav_links" }, () => {
        console.log("[Realtime] Nav links changed, refreshing...");
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Apply theme colors as CSS variables
  useEffect(() => {
    const r = document.documentElement;
    const c = settings.colors;
    r.style.setProperty("--cocoa", c.cocoa);
    r.style.setProperty("--coffee", c.coffee);
    r.style.setProperty("--cream", c.cream);
    r.style.setProperty("--gold", c.gold);
  }, [settings.colors]);

  // Apply favicon
  useEffect(() => {
    const faviconUrl = settings.favicon.url || "/favicon.png";
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
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
