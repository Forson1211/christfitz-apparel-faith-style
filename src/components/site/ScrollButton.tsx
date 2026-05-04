import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export function ScrollButton() {
  const [scrollDir, setScrollDir] = useState<"up" | "down">("down");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;

      // Show button after 300px
      if (scrolled > 300) {
        setShow(true);
      } else {
        setShow(false);
      }

      // Decide direction based on position
      if (scrolled > height - 100) {
        setScrollDir("up");
      } else if (scrolled < 300) {
        setScrollDir("down");
      } else {
        // Toggle based on scroll direction? No, let's keep it simple:
        // If we are closer to the bottom, show "Up".
        // If we are closer to the top, show "Down".
        setScrollDir(scrolled > height / 2 ? "up" : "down");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (scrollDir === "up") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-cocoa text-cream shadow-luxe border border-gold/20"
          aria-label={scrollDir === "up" ? "Scroll to top" : "Scroll to bottom"}
        >
          {scrollDir === "up" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}

          {/* Subtle ring animation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-gold"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
