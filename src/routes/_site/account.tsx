import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Phone, 
  Mail, 
  Key, 
  ShieldCheck, 
  Save, 
  ArrowLeft, 
  Package, 
  Heart, 
  MapPin,
  ChevronRight,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_site/account")({
  component: Account,
});

type Tab = "profile" | "orders" | "wishlist" | "track";

function Account() {
  const { user, loading, signIn, signUp, signOut, isAdmin, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Auth Form States
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile Edit States
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    document.title = "Account · ChristFitz";
    if (user) {
      setNewName(user.user_metadata?.full_name || "");
      setNewPhone(user.user_metadata?.phone || "");
      setNewEmail(user.email || "");
    }
  }, [user]);

  const onAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) { toast.error(error); return; }
      toast.success("Welcome back!");
    } else {
      const { error, needsConfirmation } = await signUp(email, password, { full_name: name, phone });
      setBusy(false);
      if (error) { toast.error(error); return; }
      if (needsConfirmation) {
        toast.success("Check your email to confirm your account!");
        setMode("signin");
      } else {
        toast.success("Account created!");
      }
    }
  };

  const handleUpdateProfile = async () => {
    setBusy(true);
    const { error } = await updateProfile({ full_name: newName, phone: newPhone });
    setBusy(false);
    if (error) { toast.error(error); return; }
    toast.success("Profile updated successfully");
    setEditMode(false);
  };

  const handleUpdateCredentials = async (type: 'email' | 'password') => {
    setBusy(true);
    let res;
    if (type === 'email') {
      res = await supabase.auth.updateUser({ email: newEmail });
    } else {
      res = await supabase.auth.updateUser({ password: newPassword });
    }
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(type === 'email' ? "Verification email sent to new address!" : "Password updated!");
    if (type === 'password') setNewPassword("");
  };

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-cream text-cocoa">
        <div className="h-8 w-8 rounded-full border-2 border-cocoa border-t-transparent animate-spin" />
      </main>
    );
  }

  if (user) {
    const tabs: { id: Tab; label: string; icon: any }[] = [
      { id: "profile", label: "Profile Settings", icon: UserIcon },
      { id: "orders", label: "Order History", icon: Package },
      { id: "wishlist", label: "Wishlist", icon: Heart },
      { id: "track", label: "Track Order", icon: MapPin },
    ];

    return (
      <main className="min-h-screen bg-cream text-cocoa pt-32 pb-20 px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cocoa/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="p-8 rounded-[2.5rem] glass shadow-soft border border-white/40 sticky top-32">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold mb-8 px-2">My Account</h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setEditMode(false); }}
                      className={`w-full flex items-center justify-between group rounded-2xl px-5 py-4 text-sm font-medium transition-all ${
                        activeTab === tab.id 
                          ? "bg-cocoa text-cream shadow-soft" 
                          : "text-cocoa/60 hover:bg-cocoa/5 hover:text-cocoa"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-gold" : "text-cocoa/40"}`} />
                        {tab.label}
                      </div>
                      <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === tab.id ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
                    </button>
                  ))}
                </nav>

                <div className="mt-10 pt-8 border-t border-cocoa/5">
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="w-full flex items-center gap-3 rounded-2xl bg-gold/10 text-gold border border-gold/20 px-5 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gold/20 transition-all mb-3"
                    >
                      <ShieldCheck className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut().then(() => navigate({ to: "/" }))}
                    className="w-full flex items-center gap-3 rounded-2xl bg-cocoa/5 text-cocoa/60 px-5 py-4 text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <section className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40 min-h-[600px] flex flex-col"
                >
                  {/* Active Tab Header */}
                  <div className="bg-cocoa p-10 text-cream relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      {(() => {
                        const Icon = tabs.find(t => t.id === activeTab)?.icon;
                        return Icon ? <Icon size={120} /> : null;
                      })()}
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-cream/10 backdrop-blur-md flex items-center justify-center border border-cream/20">
                          {(() => {
                            const Icon = tabs.find(t => t.id === activeTab)?.icon;
                            return Icon ? <Icon className="h-8 w-8 text-gold" /> : null;
                          })()}
                        </div>
                        <div>
                          <h1 className="font-display text-3xl tracking-tight">{tabs.find(t => t.id === activeTab)?.label}</h1>
                          <p className="text-cream/60 text-sm mt-1">{user.email}</p>
                        </div>
                      </div>
                      {activeTab === "profile" && (
                        <button 
                          onClick={() => setEditMode(!editMode)}
                          className="rounded-full h-12 w-12 glass-dark flex items-center justify-center hover:bg-cream/10 transition-colors"
                        >
                          {editMode ? <ArrowLeft className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-8 sm:p-12 flex-1 bg-white/40 backdrop-blur-sm">
                    {activeTab === "profile" && (
                      <div className="max-w-2xl">
                        {!editMode ? (
                          <div className="grid gap-8">
                            <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-1.5 p-6 rounded-3xl bg-cocoa/5 border border-cocoa/10">
                                <div className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold mb-2">Full Name</div>
                                <p className="text-lg font-medium text-cocoa">{user.user_metadata?.full_name || "—"}</p>
                              </div>
                              <div className="space-y-1.5 p-6 rounded-3xl bg-cocoa/5 border border-cocoa/10">
                                <div className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold mb-2">Telephone</div>
                                <p className="text-lg font-medium text-cocoa">{user.user_metadata?.phone || "—"}</p>
                              </div>
                            </div>
                            <div className="space-y-1.5 p-6 rounded-3xl bg-cocoa/5 border border-cocoa/10">
                              <div className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold mb-2">Email Address</div>
                              <p className="text-lg font-medium text-cocoa">{user.email}</p>
                            </div>
                            <button onClick={() => setEditMode(true)} className="mt-4 flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform w-fit">
                              Edit profile information <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-5">
                              <h3 className="text-xs uppercase tracking-[0.2em] text-cocoa/40 font-bold">Personal Information</h3>
                              <div className="grid sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Full Name</label>
                                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Telephone</label>
                                  <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none" />
                                </div>
                              </div>
                              <button onClick={handleUpdateProfile} disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-cocoa text-cream py-4 text-sm font-semibold shadow-soft hover:bg-coffee transition-all">
                                <Save className="h-4 w-4" /> Save Profile Changes
                              </button>
                            </div>

                            <div className="space-y-5 pt-10 border-t border-cocoa/5">
                              <h3 className="text-xs uppercase tracking-[0.2em] text-cocoa/40 font-bold">Security Settings</h3>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Change Email</label>
                                <div className="flex gap-3">
                                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="flex-1 rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none" />
                                  <button onClick={() => handleUpdateCredentials('email')} disabled={busy || newEmail === user.email} className="rounded-2xl bg-cocoa px-5 text-sm font-semibold text-cream hover:bg-coffee transition-all disabled:opacity-50">Update</button>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Change Password</label>
                                <div className="flex gap-3">
                                  <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none" />
                                  <button onClick={() => handleUpdateCredentials('password')} disabled={busy || newPassword.length < 6} className="rounded-2xl bg-cocoa px-5 text-sm font-semibold text-cream hover:bg-coffee transition-all disabled:opacity-50">Update</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "orders" && (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-20 w-20 rounded-full bg-cocoa/5 flex items-center justify-center mb-6">
                          <Package className="h-10 w-10 text-cocoa/20" />
                        </div>
                        <h3 className="text-xl font-display text-cocoa">No orders yet</h3>
                        <p className="mt-2 text-cocoa/50 text-sm max-w-xs">Your faith-inspired journey starts here. Explore our latest drops to find your first piece.</p>
                        <Link to="/products" className="mt-8 rounded-full bg-cocoa px-8 py-3.5 text-sm font-semibold text-cream hover:bg-coffee transition-all">Browse Collection</Link>
                      </div>
                    )}

                    {activeTab === "wishlist" && (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-20 w-20 rounded-full bg-cocoa/5 flex items-center justify-center mb-6">
                          <Heart className="h-10 w-10 text-cocoa/20" />
                        </div>
                        <h3 className="text-xl font-display text-cocoa">Your wishlist is empty</h3>
                        <p className="mt-2 text-cocoa/50 text-sm max-w-xs">Save the pieces that inspire you for later. Use the heart icon on any product to add it here.</p>
                        <Link to="/products" className="mt-8 rounded-full bg-cocoa px-8 py-3.5 text-sm font-semibold text-cream hover:bg-coffee transition-all">Discover Pieces</Link>
                      </div>
                    )}

                    {activeTab === "track" && (
                      <div className="max-w-md">
                        <div className="space-y-6">
                          <div className="p-8 rounded-[2rem] bg-gold/5 border border-gold/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa mb-4">Track your delivery</h3>
                            <p className="text-sm text-cocoa/60 mb-6">Enter your order ID or tracking number to see where your package is.</p>
                            <div className="space-y-3">
                              <input type="text" placeholder="e.g. #CF-12345" className="w-full rounded-2xl border-2 border-cocoa/5 bg-white px-5 py-4 text-sm outline-none focus:border-gold/50" />
                              <button className="w-full rounded-2xl bg-cocoa py-4 text-sm font-semibold text-cream shadow-soft hover:bg-coffee transition-all">Track Shipment</button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-5 rounded-2xl bg-cocoa/5 border border-cocoa/10">
                            <Clock className="h-5 w-5 text-gold" />
                            <div className="text-xs text-cocoa/60 leading-relaxed">Most orders are processed within <span className="text-cocoa font-bold">24-48 hours</span> and delivered within 3-5 business days.</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-cocoa py-20 px-5 relative flex items-center justify-center">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cocoa/5 rounded-full blur-3xl animate-float-slower" />

      <div className="mx-auto w-full max-w-[440px] relative z-10">
        <div className="rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40">
          <div className="bg-cocoa p-10 text-center text-cream">
            <Link to="/" className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-cream/10 border border-cream/20 text-gold mb-6 mx-auto hover:bg-cream/20 transition-colors">
              <span className="text-xl">✝</span>
            </Link>
            <h1 className="font-display text-3xl tracking-tight">{mode === "signin" ? "Welcome Back" : "Join the Fold"}</h1>
            <p className="mt-2 text-cream/60 text-sm px-4">
              {mode === "signin" 
                ? "Sign in to manage your orders and faith-inspired style." 
                : "Create an account to join the ChristFitz community."}
            </p>
          </div>

          <form onSubmit={onAuthSubmit} className="p-8 sm:p-10 space-y-5 bg-white/40 backdrop-blur-sm">
            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Telephone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">
                {mode === "signin" ? "Name or Email" : "Email Address"}
              </label>
              <input
                type="text"
                required
                placeholder={mode === "signin" ? "Name or Email" : "you@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border-2 border-cocoa/5 bg-cocoa/5 px-5 py-3.5 text-sm transition-all focus:border-gold/50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
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
              disabled={busy}
              type="submit"
              className="group relative w-full overflow-hidden rounded-2xl bg-cocoa py-4 text-sm font-semibold text-cream shadow-soft transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {busy ? "Processing..." : (mode === "signin" ? "Sign In" : "Create Account")}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold/50 to-transparent transition-transform duration-500 group-hover:translate-x-0" />
            </button>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-sm font-medium text-cocoa/60 hover:text-cocoa transition-colors underline underline-offset-4 decoration-cocoa/20"
              >
                {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
