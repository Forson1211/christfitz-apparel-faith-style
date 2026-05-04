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

/**
 * InstagramGallery — Precision Bento Grid Layout
 * Matches the user's reference screenshot pixel-for-pixel.
 */
export function InstagramGallery() {
  const { settings } = useSite();
  const { items, loading } = useContent("instagram");

  const displayItems = items.length > 0 ? items.slice(0, 8) : [];
  const showSkeletons = loading && displayItems.length === 0;

  // Exact Span Logic to match the reference screenshot perfectly
  const getSpan = (index: number) => {
    switch (index) {
      case 0:
        return "row-span-2 col-span-1"; // Slot 1: Tall (spans 2 rows on all devices)
      case 3:
        return "row-span-2 col-span-1"; // Slot 4: Tall (spans 2 rows on all devices)
      default:
        return "col-span-1";
    }
  };

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
                  className={`animate-pulse rounded-3xl bg-cocoa/5 border border-cocoa/10 ${getSpan(i)}`}
                />
              ))
            ) : displayItems.length > 0 ? (
              (() => {
                const slots = new Array(8).fill(null);
                const unplacedItems: any[] = [];

                displayItems.forEach((item: any) => {
                  if (
                    item.position !== null &&
                    item.position >= 0 &&
                    item.position < 8 &&
                    !slots[item.position]
                  ) {
                    slots[item.position] = item;
                  } else {
                    unplacedItems.push(item);
                  }
                });

                for (let i = 0; i < 8; i++) {
                  if (!slots[i] && unplacedItems.length > 0) {
                    slots[i] = unplacedItems.shift();
                  }
                }

                return slots.map((item, i) => {
                  if (!item) {
                    return (
                      <div
                        key={`empty-${i}`}
                        className={`rounded-[20px] sm:rounded-3xl bg-cocoa/5 border border-dashed border-cocoa/10 flex flex-col items-center justify-center ${getSpan(i)}`}
                      >
                        <InstagramIcon className="h-6 w-6 text-cocoa/10 mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-cocoa/20 font-bold">
                          Slot {i + 1}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      viewport={{ once: true }}
                      className={`group relative overflow-hidden rounded-[20px] sm:rounded-3xl bg-cocoa/5 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 border border-cocoa/5 ${getSpan(i)}`}
                    >
                      <img
                        src={resolveImage(item.url)}
                        alt={`Gallery Piece ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />

                      {/* Premium Hover Overlay */}
                      <div className="absolute inset-0 bg-cocoa/40 opacity-0 transition-all duration-500 group-hover:opacity-100 flex flex-col items-center justify-center gap-5 text-cream backdrop-blur-[4px]">
                        <div className="flex items-center gap-8 translate-y-6 transition-transform duration-700 group-hover:translate-y-0">
                          <div className="flex flex-col items-center">
                            <Heart className="h-7 w-7 fill-gold text-gold mb-1.5" />
                            <span className="text-sm font-bold tracking-tight">
                              {1200 + i * 45}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <MessageCircle className="h-7 w-7 fill-cream text-cream mb-1.5" />
                            <span className="text-sm font-bold tracking-tight">{68 + i * 4}</span>
                          </div>
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.4em] font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-300">
                          Experience Faith
                        </p>
                      </div>
                    </motion.div>
                  );
                });
              })()
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
