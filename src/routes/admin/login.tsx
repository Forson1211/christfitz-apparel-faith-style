import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const { signIn, signUp, user, isAdmin, bootstrapAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin/dashboard" });
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) {
      toast.error(error);
      setBusy(false);
      return;
    }
    // Try bootstrapping the first admin if no admin exists yet
    setTimeout(async () => {
      const ok = await bootstrapAdmin();
      if (ok) toast.success("You've been promoted to admin.");
      setBusy(false);
      navigate({ to: "/admin/dashboard" });
    }, 300);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-cream text-cocoa px-5">
      <div className="w-full max-w-md rounded-3xl glass shadow-luxe p-7 sm:p-9">
        <div className="text-center">
          <span className="grid mx-auto h-12 w-12 place-items-center rounded-full bg-cocoa text-cream font-bold text-lg">✝</span>
          <h1 className="mt-4 font-display text-3xl">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to manage your site." : "Create an admin account."}</p>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-full border border-cocoa/15 bg-cream/70 px-5 py-3 outline-none focus:border-coffee"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-full border border-cocoa/15 bg-cream/70 px-5 py-3 outline-none focus:border-coffee"
          />
          <button
            disabled={busy}
            className="w-full rounded-full bg-cocoa px-6 py-3.5 text-sm font-medium text-cream transition hover:bg-coffee disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs text-cocoa/60 hover:text-cocoa"
        >
          {mode === "signin" ? "First time? Create the admin account →" : "Already have an account? Sign in →"}
        </button>
        <p className="mt-5 rounded-2xl bg-sand/60 p-3 text-[11px] leading-relaxed text-cocoa/70">
          The first account created automatically becomes the admin. After that, only existing admins can grant the role.
        </p>
      </div>
    </div>
  );
}
