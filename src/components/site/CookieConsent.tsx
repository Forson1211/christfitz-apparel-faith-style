import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Cookie } from "lucide-react";

/**
 * CookieConsent — A premium, glassmorphic cookie consent banner.
 * Manages user privacy preferences with a persistent cookie.
 */
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for existing consent cookie
    const consent = getCookie("cf_cookie_consent");
    if (!consent) {
      // Delay visibility for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookie("cf_cookie_consent", "accepted", 30);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setCookie("cf_cookie_consent", "declined", 30);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-6 right-6 z-[100] mx-auto max-w-lg sm:left-10 sm:right-auto"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-cocoa/80 p-6 backdrop-blur-2xl shadow-luxe">
            {/* Background Orbs for premium feel */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-cream/5 blur-2xl" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold">
                  <Cookie className="h-5 w-5" />
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="rounded-full p-1 text-cream/40 transition-colors hover:bg-white/10 hover:text-cream"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-cream">Cookie Preferences</h3>
                <p className="text-sm leading-relaxed text-cream/60">
                  We use cookies to enhance your shopping experience, analyze site traffic, and deliver personalized content. By clicking "Accept", you agree to our use of cookies.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  onClick={handleAccept}
                  className="flex-1 rounded-2xl bg-cream px-6 py-3 text-xs font-bold uppercase tracking-widest text-cocoa transition-all hover:scale-[1.02] hover:bg-white active:scale-95 shadow-soft"
                >
                  Accept All
                </button>
                <button
                  onClick={handleDecline}
                  className="flex-1 rounded-2xl bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-cream/70 transition-all hover:bg-white/10 hover:text-cream active:scale-95"
                >
                  Essential Only
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cream/30 font-bold">
                <ShieldCheck className="h-3 w-3 text-gold/50" />
                <span>Your privacy is our priority</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper: Set a cookie
function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

// Helper: Get a cookie
function getCookie(name: string) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
