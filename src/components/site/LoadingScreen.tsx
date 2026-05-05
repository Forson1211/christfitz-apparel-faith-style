import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "@/lib/site";

export function LoadingScreen() {
  const { loading } = useSite();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const show = !minTimeElapsed || loading;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[200] grid place-items-center bg-cocoa text-cream"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Round Image Container */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-cream/20 bg-cream/5 shadow-2xl">
                <img 
                  src="/auth.png" 
                  alt="Loading" 
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Spinning Ring */}
              <div className="absolute inset-0 -m-2">
                <svg className="h-28 w-28 animate-spin">
                  <circle
                    cx="56"
                    cy="56"
                    r="54"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="2"
                    strokeDasharray="100 200"
                    strokeLinecap="round"
                    className="opacity-60"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="font-display text-2xl tracking-[0.2em] uppercase font-bold text-cream/90">
                ChristFitz
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.4em] text-gold/60 font-bold">
                Faith · Movement
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
