import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSite } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

export function AnnouncementBar() {
  const { settings } = useSite();
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [latestDiscount, setLatestDiscount] = useState<any>(null);
  const location = useLocation();

  const isProductsPage = location.pathname === "/products";

  useEffect(() => {
    async function fetchLatestDiscount() {
      const { data } = await (supabase as any)
        .from("discounts")
        .select("code, value, type")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (data) setLatestDiscount(data);
    }
    
    if (isProductsPage) fetchLatestDiscount();
  }, [isProductsPage]);

  if (!settings.announcement?.enabled || !visible || !isProductsPage) return null;

  const displayText = latestDiscount 
    ? `Use code ${latestDiscount.code} for ${latestDiscount.type === 'percent' ? latestDiscount.value + '%' : '₵' + latestDiscount.value} OFF! ✨`
    : settings.announcement.text;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-24 right-8 z-[100]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative group">
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVisible(false);
            }}
            className="absolute -top-1 -left-1 z-20 grid h-5 w-5 place-items-center rounded-full bg-white text-cocoa shadow-md hover:bg-cocoa hover:text-cream transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="h-2.5 w-2.5" />
          </button>

          <Link to={settings.announcement.href as any}>
            <motion.div
              animate={{ 
                width: hovered ? "auto" : "64px",
                borderRadius: hovered ? "32px" : "50%"
              }}
              className="flex flex-row-reverse items-center h-16 bg-cocoa text-cream shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* The Circle Part */}
              <div className="grid h-16 w-16 shrink-0 place-items-center bg-gold text-cocoa relative overflow-hidden">
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-[10px] font-black uppercase tracking-tighter">Get</span>
                  <span className="text-lg font-black uppercase">Off</span>
                </div>
                
                {/* Rotating Border Effect */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-1 border border-dashed border-cocoa/30 rounded-full"
                />
              </div>

              {/* The Expanded Text Part */}
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="px-6 py-2 pl-8 whitespace-nowrap text-right"
                  >
                    <p className="text-xs font-bold tracking-wide">
                      {displayText}
                    </p>
                    <span className="text-[10px] text-gold font-bold uppercase tracking-widest mt-0.5 block">
                      Shop Collection ←
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
