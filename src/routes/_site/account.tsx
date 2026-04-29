import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { LogOut, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_site/account")({
  component: Account,
});

function Account() {
  const { user, loading, signIn, signUp, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Account · ChristFitz";
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(mode === "signin" ? "Welcome back!" : "Account created.");
    setEmail("");
    setPassword("");
  };

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-cream text-cocoa">
        Loading…
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-cream text-cocoa pt-32 pb-20 px-5">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl glass shadow-luxe p-8 sm:p-10">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-cocoa text-cream">
                <UserIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-2xl truncate">{user.email}</h1>
                <p className="text-sm text-cocoa/60">{isAdmin ? "Administrator" : "Customer"}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="rounded-2xl bg-cocoa text-cream px-5 py-3 text-center text-sm hover:bg-coffee transition"
                >
                  Open admin dashboard
                </Link>
              )}
              <button
                onClick={() => signOut().then(() => navigate({ to: "/" }))}
                className="flex items-center justify-center gap-2 rounded-2xl border border-cocoa/15 px-5 py-3 text-sm hover:bg-cocoa/5 transition"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-cocoa pt-32 pb-20 px-5">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl glass shadow-luxe p-7 sm:p-9">
          <div className="text-center">
            <h1 className="font-display text-3xl">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
            <p className="mt-1 text-sm text-cocoa/60">
              {mode === "signin" ? "Sign in to your account." : "Join the ChristFitz community."}
            </p>
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
              placeholder="Password (min 6 characters)"
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
            {mode === "signin" ? "New here? Create an account →" : "Already have an account? Sign in →"}
          </button>
        </div>
      </div>
    </main>
  );
}
