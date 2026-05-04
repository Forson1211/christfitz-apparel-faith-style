import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSite, productImage } from "@/lib/site";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import mtnLogo from "@/assets/payments/mtn.png";
import telecelLogo from "@/assets/payments/telecel.png";
import paystackLogo from "@/assets/payments/paystack.png";

export function Footer() {
  const { settings, categories, products } = useSite();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const newProducts = products.filter((p) => p.active).slice(0, 2);

  const footerLinks = [
    {
      title: "Marketplace",
      links: [
        { label: "Shop Products", href: "/products" },
        { label: "Top Rated", href: "/products" },
        { label: "New Arrivals", href: "/products" },
        { label: "Collections", href: "/products" },
        { label: "Gift Cards", href: "/shipping" },
      ],
    },
    {
      title: "Categories",
      links: categories.map((c) => ({ label: c.name, href: `/products?category=${c.name}` })),
    },
    {
      title: "My Account",
      links: [
        { label: "Profile Settings", href: "/account" },
        { label: "Order History", href: "/account" },
        { label: "Wishlist", href: "/account" },
        { label: "Track Order", href: "/account" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Our Mission", href: "/about" },
        { label: "Story of Faith", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/contact" },
        { label: "FAQs", href: "/faqs" },
        { label: "Shipping Policy", href: "/shipping" },
        { label: "Returns", href: "/shipping" },
        { label: "Community Rules", href: "/privacy" },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <footer className="relative bg-[#0A0503] text-cream pt-12 pb-8 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Top Section: Logo and Socials */}
        <div className="flex items-center justify-between gap-4 pb-8 border-b border-white/5 md:border-none">
          <Link to="/" className="flex items-center gap-2.5 group">
            {settings.logo.url || "/logo.png" ? (
              <img
                src={settings.logo.url || "/logo.png"}
                alt={settings.brand.name}
                className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold text-cocoa transition-transform group-hover:rotate-12">
                <span className="font-bold">✝</span>
              </div>
            )}
          </Link>

          <div className="flex gap-4 sm:gap-6">
            {[
              { Icon: Facebook, href: settings.footer.socials.facebook },
              { Icon: Instagram, href: settings.footer.socials.instagram },
              { Icon: Twitter, href: settings.footer.socials.twitter },
              { Icon: Youtube, href: settings.footer.socials.youtube },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/50 transition-all hover:text-gold hover:scale-110"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Links Grid / Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-10 py-0 lg:py-8 border-b lg:border-y border-white/5">
          {footerLinks.map((group) => (
            <div key={group.title} className="border-b border-white/5 lg:border-none">
              {/* Mobile Trigger */}
              <button
                onClick={() => toggleSection(group.title)}
                className="flex w-full items-center justify-between py-6 lg:hidden"
              >
                <span className="text-sm font-bold tracking-widest uppercase text-cream/90">
                  {group.title}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gold transition-transform duration-300 ${expandedSection === group.title ? "rotate-180" : ""}`}
                />
              </button>

              {/* Desktop Header */}
              <h4 className="hidden lg:block text-[11px] uppercase tracking-[0.25em] text-gold font-bold mb-6">
                {group.title}
              </h4>

              {/* Content: Animated on mobile, always visible on desktop */}
              <AnimatePresence initial={false}>
                {expandedSection === group.title && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden space-y-3 pb-6 lg:hidden"
                  >
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.href as any}
                          className="text-sm text-cream/50 hover:text-gold transition-colors block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              {/* Static Desktop Links */}
              <ul className="hidden lg:flex flex-col space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href as any}
                      className="text-sm text-cream/50 hover:text-gold transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* New Products Section */}
        <div className="py-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/30 font-bold mb-6">
            New Products
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {newProducts.map((p, i) => (
              <Link
                key={i}
                to="/products"
                className="group flex items-center gap-4 p-4 rounded-xl glass-dark border border-white/5 transition-all hover:bg-white/5"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-cocoa/20">
                  <img
                    src={productImage(p)}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-cream/80 leading-snug line-clamp-2">
                    {p.name}
                  </h5>
                  <p className="text-[10px] text-gold mt-1 font-bold">GH₵ {p.price}</p>
                </div>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-cream/40 group-hover:bg-gold group-hover:text-cocoa transition-colors">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </Link>
            ))}

            {/* Payment logos and verification removed as requested */}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-cream/50 border-t border-white/5">
          <p>{settings.footer.copyright}</p>
          <p className="font-display text-[10px] uppercase tracking-[0.2em]">
            Developed by{" "}
            <a
              href="https://oflexcreative.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/90 hover:text-gold transition-colors"
            >
              Oflex Creative
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
