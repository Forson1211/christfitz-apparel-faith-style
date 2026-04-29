import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Maya Johnson",
    role: "Worship leader",
    avatar: "https://i.pravatar.cc/200?img=47",
    text: "The quality is unreal. I get compliments every single time I wear my hoodie. Feels like wearing a prayer.",
    rating: 5,
  },
  {
    name: "Daniel Reyes",
    role: "Designer",
    avatar: "https://i.pravatar.cc/200?img=12",
    text: "Finally a Christian brand that doesn't compromise on style. Premium fits, deeper meaning.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Student",
    avatar: "https://i.pravatar.cc/200?img=45",
    text: "Soft, oversized, perfect drape. ChristFitz is now 80% of my closet — and I'm not sorry.",
    rating: 5,
  },
  {
    name: "Marcus Bell",
    role: "Youth pastor",
    avatar: "https://i.pravatar.cc/200?img=33",
    text: "Wearing my faith has never felt this fresh. The cocoa hoodie is a 10/10.",
    rating: 5,
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % reviews.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="testimonials" className="relative overflow-hidden py-28 sm:py-36 bg-cocoa text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, oklch(0.78 0.12 80 / 0.25), transparent 60%), radial-gradient(ellipse at 70% 70%, oklch(0.42 0.05 50 / 0.6), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cream/60">— Beloved by believers</p>
        <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance">
          Words from the <span className="">community.</span>
        </h2>

        <div className="relative mt-14 h-72 sm:h-60">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 mx-auto max-w-3xl rounded-3xl glass-dark p-8 sm:p-10"
            >
              <div className="flex justify-center gap-1">
                {Array.from({ length: reviews[i].rating }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-6 font-display text-2xl sm:text-3xl leading-snug text-balance">
                “{reviews[i].text}”
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <img
                  src={reviews[i].avatar}
                  alt={reviews[i].name}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-cream/30"
                />
                <div className="text-left">
                  <div className="font-medium">{reviews[i].name}</div>
                  <div className="text-xs text-cream/60">{reviews[i].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {reviews.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Show review ${k + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-8 bg-cream" : "w-1.5 bg-cream/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
