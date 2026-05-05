import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

export function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await (supabase
        .from("testimonials" as any)
        .select("*") as any)
        .eq("active", true)
        .order("position");

      if (data) setReviews(data);
      setLoading(false);
    };

    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  // Repeat for seamless loop
  const infiniteReviews = [...reviews, ...reviews, ...reviews, ...reviews];
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-24 bg-[#1A0D07] text-cream border-y border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 text-center mb-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 font-bold">
          — Community Love
        </p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl text-white">
          Words from the <span className="text-gold">believers.</span>
        </h2>
      </div>

      <div className="flex flex-col gap-4 sm:gap-8 select-none overflow-hidden">
        {/* Row 1: Moving Left */}
        <div className="flex overflow-hidden">
          <motion.div
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            className="flex gap-4 sm:gap-6 px-2"
          >
            {[...reviews, ...reviews].map((review, i) => (
              <TestimonialCard key={`r1-${i}`} review={review} />
            ))}
          </motion.div>
        </div>

        {/* Row 2: Moving Right */}
        <div className="flex overflow-hidden">
          <motion.div
            animate={{
              x: ["-50%", "0%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            className="flex gap-4 sm:gap-6 px-2"
          >
            {[...reviews, ...reviews].reverse().map((review, i) => (
              <TestimonialCard key={`r2-${i}`} review={review} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ review }: { review: Testimonial }) {
  return (
    <div
      className="w-[280px] sm:w-[380px] shrink-0 rounded-[2rem] bg-white/5 border border-white/10 p-6 sm:p-10 backdrop-blur-sm transition-all hover:bg-white/10"
    >
      <div className="flex gap-1 mb-4 sm:mb-6">
        {Array.from({ length: review.rating || 5 }).map((_, k) => (
          <Star key={k} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-gold text-gold" />
        ))}
      </div>

      <p className="text-xs sm:text-sm leading-relaxed text-cream/80 whitespace-normal mb-6 sm:mb-8 line-clamp-3">
        “{review.text}”
      </p>

      <div className="flex items-center gap-3 mt-auto">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-[10px] sm:text-xs uppercase tracking-tighter">
          {review.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="text-left">
          <div className="text-xs sm:text-sm font-bold text-cream">{review.name}</div>
          <div className="text-[8px] sm:text-[10px] uppercase tracking-wider text-cream/40 font-medium">
            {review.role}
          </div>
        </div>
      </div>
    </div>
  );
}
