import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSite } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

export function AnnouncementBar({ forceVisible = false }: { forceVisible?: boolean }) {
  const { settings } = useSite();
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [latestDiscount, setLatestDiscount] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    async function fetchLatestDiscount() {
      const { data } = await (supabase as any)
        .from("discounts")
        .select("code, value, type, expires_at")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (data) {
        const now = new Date();
        const validDiscount = data.find((d: any) => {
          if (!d.expires_at) return true;
          // Set to end of day to be generous
          const expiryDate = new Date(d.expires_at);
          expiryDate.setHours(23, 59, 59, 999);
          return expiryDate > now;
        });
        setLatestDiscount(validDiscount || null);
      }
    }

    fetchLatestDiscount();
  }, []);

  let displayText = settings.announcement?.text || "";

  if (latestDiscount) {
    const codeStr = latestDiscount.code;
    const valueStr = latestDiscount.type === "percent" ? latestDiscount.value + "%" : "₵" + latestDiscount.value;
    
    if (displayText.includes("[CODE]")) {
      displayText = displayText.replace("[CODE]", codeStr);
    } else if (displayText.includes("{{code}}")) {
      displayText = displayText.replace("{{code}}", codeStr);
    } else if (!displayText || !displayText.includes(codeStr)) {
      // If text is empty or doesn't mention the code, provide a smart fallback
      displayText = displayText || `Use code ${codeStr} for ${valueStr} OFF! ✨`;
    }
  } else {
    displayText = displayText.replace("[CODE]", "").replace("{{code}}", "").trim();
  }

  // Debugging logs for the user
  useEffect(() => {
    if (settings.announcement?.enabled) {
      console.log("[AnnouncementBar] Enabled:", settings.announcement.enabled);
      console.log("[AnnouncementBar] Visible:", visible);
      console.log("[AnnouncementBar] Text:", displayText);
      console.log("[AnnouncementBar] Discount:", latestDiscount?.code);
    }
  }, [settings.announcement?.enabled, visible, displayText, latestDiscount]);

  if ((!settings.announcement?.enabled && !forceVisible) || !visible || !displayText) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-20 right-4 md:bottom-24 md:right-8 z-[100] max-w-[calc(100vw-2rem)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setHovered(!hovered)}
      >
        <div className="relative group">

          <Link 
            to={settings.announcement.href as any} 
            onClick={(e) => {
              if (!hovered) {
                e.preventDefault();
                setHovered(true);
              }
            }}
          >
            <motion.div
              animate={{ 
                width: hovered ? "auto" : "4rem",
                borderRadius: hovered ? "32px" : "50%"
              }}
              className="flex flex-row-reverse items-center h-16 bg-cocoa text-cream shadow-2xl border border-white/10 overflow-hidden cursor-pointer"
              style={{ minWidth: hovered ? "220px" : "4rem" }}
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
              <AnimatePresence mode="wait">
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="px-4 py-2 pl-6 overflow-hidden flex flex-col items-end justify-center min-w-[160px] max-w-[240px] md:max-w-none"
                  >
                    <p className="text-[10px] md:text-xs font-bold tracking-tight text-right leading-tight">
                      {displayText}
                    </p>
                    <span className="text-[7px] md:text-[8px] text-gold font-bold uppercase tracking-[0.2em] mt-1 shrink-0">
                      Tap to Shop →
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
