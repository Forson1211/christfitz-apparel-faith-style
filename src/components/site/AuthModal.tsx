import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export function AuthModal({ isOpen, onClose, onSuccess, message }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
        toast.success("Welcome back!");
        onSuccess?.();
        onClose();
      } else {
        const { error, needsConfirmation } = await signUp(email, password, {
          full_name: name,
          phone,
        });
        if (error) throw new Error(error);
        
        if (needsConfirmation) {
          toast.success("Check your email to confirm your account!");
          setMode("signin");
        } else {
          toast.success("Account created!");
          onSuccess?.();
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-cocoa/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[2.5rem] bg-cream shadow-luxe border border-white/20"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-10 grid h-10 w-10 place-items-center rounded-full bg-cocoa/5 text-cocoa transition hover:bg-cocoa/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-cocoa px-8 py-5 text-center text-cream relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
              <img src="/auth.png" alt="Logo" className="h-10 w-auto mb-3 relative z-10 opacity-90" />
              <h2 className="font-display text-xl tracking-tight leading-tight relative z-10">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-2.5 bg-white/40">
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-cocoa/10 bg-cocoa/5 px-3 py-2 text-base transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+233..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-cocoa/10 bg-cocoa/5 px-3 py-2 text-base transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-cocoa/10 bg-cocoa/5 px-3 py-2 text-base transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-cocoa/10 bg-cocoa/5 pl-3 pr-10 py-2 text-base transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa/30 hover:text-cocoa transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                disabled={busy}
                type="submit"
                className="w-full rounded-lg bg-cocoa py-3 text-sm font-semibold text-cream shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
              >
                {busy ? "Processing..." : mode === "signin" ? "Sign In" : "Register Now"}
              </button>

              <div className="pt-1 text-center flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-[12px] font-medium text-cocoa/60 hover:text-cocoa underline underline-offset-2"
                >
                  {mode === "signin" ? "Need an account? Sign up" : "Already registered? Sign in"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
