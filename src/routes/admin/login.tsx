import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Mail, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const { signIn, signUp, user, isAdmin, bootstrapAdmin, loading, roleSettled, signOut } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [denied, setDenied] = useState(false);

  // Once auth settles, redirect to dashboard if already admin
  useEffect(() => {
    if (loading || !roleSettled) return;
    if (user) {
      if (isAdmin) {
        navigate({ to: "/admin/dashboard" });
      } else {
        // Not admin? Try bootstrapping in case it's the first account
        bootstrapAdmin().then(promoted => {
          if (promoted) {
            navigate({ to: "/admin/dashboard" });
          } else {
            // Truly not an admin (someone else is already the admin)
            setDenied(true);
          }
        });
      }
    } else {
      setDenied(false);
    }
  }, [user, isAdmin, loading, navigate, bootstrapAdmin]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
        setBusy(false);
        return;
      }
      setBusy(false);
    } else {
      const { error, needsConfirmation: confirm } = await signUp(email, password, { full_name: "Administrator", phone: "" });
      if (error) {
        toast.error(error);
        setBusy(false);
        return;
      }
      if (confirm) {
        setNeedsConfirmation(true);
        setBusy(false);
        return;
      }
      setBusy(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-cocoa px-5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40">
            <div className="bg-cocoa p-10 text-center text-cream">
              <div className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-cream/10 border border-white/10 mb-6">
                <Mail className="h-8 w-8 text-gold" />
              </div>
              <h1 className="font-display text-3xl tracking-tight">Check your inbox</h1>
              <p className="mt-2 text-cream/60 text-sm leading-relaxed px-4">
                We've sent a secure confirmation link to <span className="text-cream font-medium">{email}</span>.
              </p>
            </div>
            
            <div className="p-8 sm:p-10 bg-white/40 text-center">
              <p className="text-sm text-cocoa/60 leading-relaxed">
                Once you click the link in your email, your account will be verified and you can access the admin panel.
              </p>
              <button
                onClick={() => { setNeedsConfirmation(false); setMode("signin"); }}
                className="mt-8 w-full rounded-2xl bg-cocoa px-6 py-4 text-sm font-semibold text-cream hover:bg-coffee transition-all hover:scale-[1.02] shadow-soft"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream text-cocoa px-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--cocoa) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cocoa/5 rounded-full blur-3xl" />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40">
          <div className="bg-cocoa p-10 text-center text-cream">
            <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-cream/10 border border-white/20 text-gold mb-6 font-bold text-xl shadow-inner">
              ✝
            </div>
            <h1 className="font-display text-3xl tracking-tight">Admin Portal</h1>
            <p className="mt-2 text-cream/60 text-sm">
              {mode === "signin" ? "Authorized personnel only." : "Configure the initial admin account."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="p-8 sm:p-10 space-y-5 bg-white/40 backdrop-blur-sm">
            {denied ? (
              <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="inline-grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600 text-2xl font-bold">✕</div>
                <div className="space-y-2">
                  <h2 className="font-display text-xl text-cocoa">Access Denied</h2>
                  <p className="text-sm text-cocoa/60 leading-relaxed">
                    This account is not authorized to access the Admin Portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => signOut().then(() => setDenied(false))}
                  className="w-full rounded-2xl bg-cocoa py-4 text-sm font-semibold text-cream shadow-soft transition-all hover:scale-[1.02]"
                >
                  Try another account
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Identity</label>
                  <input
                    type="text"
                    required
                    placeholder="Name or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Access Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 pl-5 pr-12 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa/30 hover:text-cocoa transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={busy || loading}
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-2xl bg-cocoa py-4 text-sm font-semibold text-cream shadow-soft transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {busy ? "Authenticating..." : (loading ? "Verifying Permissions..." : (mode === "signin" ? "Unlock Access" : "Initialize Admin"))}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold/50 to-transparent transition-transform duration-500 group-hover:translate-x-0" />
                </button>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="text-xs font-medium text-cocoa/40 hover:text-cocoa transition-colors"
                  >
                    {mode === "signin" ? "Need to setup first admin? Click here" : "Return to secure sign in"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {mode === "signup" && !denied && (
          <div className="mt-6 p-4 rounded-3xl bg-gold/10 border border-gold/20 text-[10px] text-cocoa/60 leading-relaxed text-center italic">
            Note: The first account registered on this platform is automatically granted administrative rights.
          </div>
        )}
      </div>
    </div>
  );
}
