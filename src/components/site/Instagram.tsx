import { motion } from "framer-motion";
import { Instagram as IGIcon } from "lucide-react";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import hero from "@/assets/hero.jpg";
import about from "@/assets/about.jpg";
import ess from "@/assets/collection-essentials.jpg";

const images = [
  { src: hero, h: "row-span-2" },
  { src: p2, h: "" },
  { src: p5, h: "" },
  { src: about, h: "row-span-2" },
  { src: p1, h: "" },
  { src: ess, h: "" },
  { src: p4, h: "" },
  { src: p6, h: "" },
];

export function InstagramGallery() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-coffee">— @christfitz</p>
          <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance">
            Live the <span className="italic">movement.</span>
          </h2>
          <a
            href="#"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cocoa px-6 py-3 text-sm text-cream transition hover:bg-coffee hover:scale-105"
          >
            <IGIcon className="h-4 w-4" />
            Follow on Instagram
          </a>
        </div>

        <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl ${img.h}`}
            >
              <img
                src={img.src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-cocoa/0 transition-colors duration-500 group-hover:bg-cocoa/50" />
              <IGIcon className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-cream opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
