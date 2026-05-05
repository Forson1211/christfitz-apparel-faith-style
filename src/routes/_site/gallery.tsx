import { createFileRoute } from "@tanstack/react-router";
import { InstagramGallery } from "@/components/site/Instagram";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_site/gallery")({
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-20 sm:pt-28"
    >
      <InstagramGallery />
      
      {/* Additional Page Content - Optional */}
      <div className="bg-cream pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-px w-full bg-cocoa/5 mb-24" />
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-coffee mb-6">— The Vision</p>
              <h2 className="font-display text-4xl sm:text-5xl text-cocoa leading-tight mb-8">
                Every frame tells a story of faith.
              </h2>
              <p className="text-cocoa/60 leading-relaxed max-w-lg">
                Our movement is captured in moments of raw devotion and curated style. 
                This gallery is a living testament to the community we've built—a space where 
                heavenly purpose meets earthly expression.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] rounded-3xl bg-cocoa/5 overflow-hidden">
                <img src="/src/assets/p1.jpg" alt="" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="aspect-[4/5] rounded-3xl bg-cocoa/5 overflow-hidden mt-8">
                <img src="/src/assets/p2.jpg" alt="" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
