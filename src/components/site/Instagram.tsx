import { motion } from "framer-motion";
import {
  Instagram as InstagramIcon,
  ExternalLink,
  Heart,
  MessageCircle,
  Upload,
} from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { useSite, resolveImage } from "@/lib/site";
import { Link } from "@tanstack/react-router";

/**
 * InstagramGallery — Precision Bento Grid Layout
 * Matches the user's reference screenshot pixel-for-pixel.
 */
export function InstagramGallery({ limit }: { limit?: number }) {
  const { settings } = useSite();
  const { items, loading } = useContent("instagram");

  const displayItems = limit ? (items || []).slice(0, limit) : (items || []);
  const showSkeletons = loading && displayItems.length === 0;

  return (
    <section className="py-24 sm:py-32 bg-cream overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Centered Header to match screenshot */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-cocoa">
              — @CHRISTFITZ
            </span>
          </div>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-cocoa leading-[0.9] mb-10">
            {settings.instagram.title}
          </h2>
          <a
            href={settings.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-cocoa px-10 py-5 text-sm font-medium text-cream transition-all hover:scale-[1.03] hover:shadow-2xl"
          >
            <InstagramIcon className="h-5 w-5" />
            {settings.instagram.cta}
          </a>
        </div>

        <div className="relative">
          {/* Grid optimized for exact landscape ratios and tight gaps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-[18px] auto-rows-[200px] sm:auto-rows-[280px]">
            {showSkeletons ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`animate-pulse rounded-3xl bg-cocoa/5 border border-cocoa/10 ${i % 8 === 0 || i % 8 === 3 ? "row-span-2 col-span-1" : "col-span-1"}`}
                />
              ))
            ) : displayItems.length > 0 ? (
              displayItems.map((item, i) => {
                const pos = item.position ?? i;
                const spanClass = pos % 8 === 0 || pos % 8 === 3 ? "row-span-2 col-span-1" : "col-span-1";

                return (
                  <Link
                    key={item.id}
                    to="/gallery"
                    className={`${spanClass} block group cursor-pointer`}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: (i % 8) * 0.1, 
                        ease: [0.22, 1, 0.36, 1],
                        scale: { duration: 1, ease: [0.22, 1, 0.36, 1] }
                      }}
                      viewport={{ once: true, margin: "-100px" }}
                      className="relative h-full w-full overflow-hidden rounded-[20px] sm:rounded-3xl bg-cocoa/5 shadow-sm transition-all hover:shadow-2xl border border-cocoa/5"
                    >
                      <img
                        src={resolveImage(item.url)}
                        alt={`Gallery Piece ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />

                      {/* Premium Minimal Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-cocoa/80 via-cocoa/20 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100 flex flex-col items-center justify-end pb-8 text-cream">
                        <div className="translate-y-4 transition-transform duration-500 ease-out group-hover:translate-y-0 flex flex-col items-center gap-2">
                          <div className="h-px w-12 bg-gold/50 mb-2" />
                          <p className="text-[10px] uppercase tracking-[0.6em] font-bold text-cream/90">
                            View Gallery
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full row-span-2 py-32 text-center rounded-[3rem] bg-cocoa/5 border border-dashed border-cocoa/20 flex flex-col items-center justify-center">
                <Upload className="h-12 w-12 text-cocoa/20 mb-6" />
                <p className="text-cocoa/40 font-medium max-w-md px-10">
                  Gallery is ready for your vision. Head to Admin to upload your high-quality
                  pieces.
                </p>
              </div>
            )}
          </div>

          {/* Subtle Dynamic Background Glows */}
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] bg-gold/10 blur-[150px] rounded-full -z-10" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] bg-coffee/5 blur-[150px] rounded-full -z-10" />
        </div>
      </div>
    </section>
  );
}
