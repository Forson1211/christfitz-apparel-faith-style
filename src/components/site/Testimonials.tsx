import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Maya Johnson",
    role: "Worship leader",
    text: "The quality is unreal. I get compliments every single time I wear my hoodie. Feels like wearing a prayer.",
    rating: 5,
  },
  {
    name: "Daniel Reyes",
    role: "Designer",
    text: "Finally a Christian brand that doesn't compromise on style. Premium fits, deeper meaning.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Student",
    text: "Soft, oversized, perfect drape. ChristFitz is now 80% of my closet — and I'm not sorry.",
    rating: 5,
  },
  {
    name: "Marcus Bell",
    role: "Youth pastor",
    text: "Wearing my faith has never felt this fresh. The cocoa hoodie is a 10/10.",
    rating: 5,
  },
  {
    name: "Kojo Mensah",
    role: "Software Architect",
    text: "The MTN MoMo integration is a game-changer for my local clients in Ghana. Fast and reliable.",
    rating: 5,
  },
  {
    name: "Sarah Smith",
    role: "Content Creator",
    text: "Beautiful templates that actually match my brand. My clients are always impressed.",
    rating: 5,
  },
];

// Double the reviews for a seamless infinite loop
const infiniteReviews = [...reviews, ...reviews, ...reviews];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-24 bg-[#1A0D07] text-cream border-y border-white/5">
      <div className="mx-auto max-w-7xl px-6 text-center mb-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 font-bold">— Community Love</p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl text-white">
          Words from the <span className="text-gold">believers.</span>
        </h2>
      </div>

      <div className="flex select-none overflow-hidden">
        <motion.div
          animate={{
            x: ["0%", "-33.333333%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 75,
              ease: "linear",
            },
          }}
          className="flex gap-6 px-3"
        >
          {infiniteReviews.map((review, i) => (
            <div
              key={i}
              className="w-[350px] shrink-0 rounded-[2.5rem] bg-white/5 border border-white/10 p-10 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: review.rating }).map((_, k) => (
                  <Star key={k} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              
              <p className="text-sm leading-relaxed text-cream/80 whitespace-normal mb-8 min-h-[4.5rem]">
                “{review.text}”
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xs uppercase tracking-tighter">
                  {review.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-cream">{review.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
