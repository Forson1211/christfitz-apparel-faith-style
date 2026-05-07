import { motion } from "framer-motion";
import { ArrowRight, Users, Shirt, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FloatingOrbs } from "./FloatingOrbs";
import { useSite, resolveImage, optimizeImage } from "@/lib/site";
import { useContent } from "@/hooks/useContent";

export function Hero() {
  const { settings, products, userCount, loading: siteLoading } = useSite();
  const h = settings.hero;
  const { items, loading } = useContent("hero");
  const heroBackground = items.length > 0 ? items[0].url : "";
  const isLoadingInitial = loading && items.length === 0;

  // Calculate live stats — show real user count only
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(0) + "K+";
    return num.toString();
  };

  const premiumDesigns = products.filter(p => p.active).length;
  const avgRating = products.length > 0
    ? (products.reduce((acc, p) => acc + p.rating, 0) / products.length).toFixed(1)
    : "5.0";

  const statsLoading = siteLoading && userCount === 0 && products.length === 0;

  return (
    <section className="relative min-h-[auto] lg:min-h-screen w-full overflow-hidden text-cream">
      {/* Background Image/Video with Zoom Effect */}
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-cocoa/20"
      >
        {isLoadingInitial ? (
          <div className="h-full w-full bg-cocoa/10 animate-pulse" />
        ) : heroBackground ? (
          heroBackground.toLowerCase().endsWith(".mp4") ||
          heroBackground.toLowerCase().endsWith(".webm") ||
          heroBackground.toLowerCase().endsWith(".mov") ? (
            <video
              key={heroBackground}
              src={heroBackground}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover object-top sm:object-center"
            />
          ) : (
            <img
              key={heroBackground}
              src={optimizeImage(heroBackground, "hero")}
              alt="Model wearing ChristFitz oversized tee"
              className="h-full w-full object-cover object-top sm:object-center"
              loading="eager"
              // @ts-ignore
              fetchpriority="high"
              onError={(e) => {
                console.error("Hero background failed to load:", e.currentTarget.src);
                e.currentTarget.style.display = "none";
              }}
            />
          )
        ) : (
          <div className="h-full w-full bg-cocoa/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa/20 via-cocoa/40 to-cocoa" />
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa/60 via-cocoa/20 to-transparent" />
      </motion.div>

      <FloatingOrbs variant="dark" />

      <div className="relative z-10 mx-auto flex min-h-[auto] lg:min-h-screen max-w-7xl flex-col lg:flex-row items-center justify-start lg:justify-between gap-8 lg:gap-20 px-[8vw] sm:px-[10vw] lg:px-6 text-center lg:text-left pt-28 pb-12 sm:pt-32 sm:pb-20">
        {/* Left Side: Content */}
        <div className="flex flex-col items-center lg:items-start max-w-3xl lg:max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.75rem,13vw,4.5rem)] sm:text-7xl md:text-8xl lg:text-9xl text-balance font-bold leading-[0.85]"
          >
            {h.title.includes("Faith") ? (
              <>
                {h.title.replace("Faith.", "").replace("Faith", "").trim()}
                <br />
                <span className="whitespace-nowrap">
                  Faith{" "}
                  <span className="font-bold marquee-text inline-block uppercase">{h.titleAccent}</span>
                </span>
              </>
            ) : (
              <>
                {h.title}{" "}
                <span className="font-bold marquee-text inline-block uppercase">{h.titleAccent}</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-cream/80 leading-tight sm:leading-relaxed"
          >
            {h.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 lg:justify-start sm:gap-4 w-full"
          >
            <Link
              to="/products"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-cream px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-medium text-cocoa transition-all hover:scale-[1.03] hover:shadow-luxe w-full max-w-[260px] sm:w-auto"
            >
              <span className="relative z-10">{h.primaryCta}</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold to-cream transition-transform duration-500 group-hover:translate-x-0" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-full glass-dark px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-medium transition hover:bg-cream/10 w-full max-w-[260px] sm:w-auto"
            >
              {h.secondaryCta}
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Stats Cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="w-full max-w-[min(100%,380px)] sm:max-w-xl lg:max-w-md xl:max-w-xl mx-auto lg:mx-0"
        >
          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5 sm:gap-4">
            {/* Top Wide Card */}
            <div className="col-span-2 group relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 p-3 sm:p-8 transition-all hover:bg-white/10">
                <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex h-8 w-8 sm:h-16 sm:w-16 items-center justify-center rounded-lg sm:rounded-2xl bg-gradient-to-br from-gold to-gold/60 shadow-lg shadow-gold/20">
                  <Users className="h-4 w-4 sm:h-8 sm:w-8 text-cocoa" />
                </div>
                <div className="text-left">
                  <div className="font-display text-lg sm:text-5xl leading-none">
                    {statsLoading ? (
                      <span className="inline-block w-20 h-8 rounded-lg bg-white/10 animate-pulse" />
                    ) : formatNumber(userCount)}
                  </div>
                  <div className="text-[6px] sm:text-xs uppercase tracking-[0.2em] text-cream/50 mt-0.5 sm:mt-2">
                    {h.stats?.believersLabel || "Believers Reached"}
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-8 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "85%" }}
                  transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-gold to-cream/40"
                />
              </div>
            </div>

            {/* Bottom Left Card */}
            <div className="group rounded-2xl sm:rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 p-2.5 sm:p-8 text-left transition-all hover:bg-white/10">
              <div className="mb-2 sm:mb-5 inline-flex h-6 w-6 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white/5 text-gold group-hover:bg-gold group-hover:text-cocoa transition-colors">
                <Shirt className="h-3 w-3 sm:h-6 sm:w-6" />
              </div>
              <div className="font-display text-lg sm:text-4xl leading-none">
                {statsLoading ? (
                  <span className="inline-block w-10 h-6 rounded-lg bg-white/10 animate-pulse" />
                ) : `${premiumDesigns}+`}
              </div>
              <div className="text-[6px] uppercase tracking-widest text-cream/40 mt-1 sm:mt-2">
                {h.stats?.designsLabel || "Premium Designs"}
              </div>
            </div>

            {/* Bottom Right Card */}
            <div className="group rounded-2xl sm:rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 p-2.5 sm:p-8 text-left transition-all hover:bg-white/10">
              <div className="mb-2 sm:mb-5 inline-flex h-6 w-6 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white/5 text-gold group-hover:bg-gold group-hover:text-cocoa transition-colors">
                <Star className="h-3 w-3 sm:h-6 sm:w-6" />
              </div>
              <div className="font-display text-lg sm:text-4xl leading-none">
                {statsLoading ? (
                  <span className="inline-block w-14 h-6 rounded-lg bg-white/10 animate-pulse" />
                ) : `${avgRating}★`}
              </div>
              <div className="text-[6px] uppercase tracking-widest text-cream/40 mt-1 sm:mt-2">
                {h.stats?.ratingLabel || "Community Rating"}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
