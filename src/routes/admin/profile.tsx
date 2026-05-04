import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Camera, User, Mail, Phone, Loader2, Save, 
  Settings, Shield, Bell, Layout, Sparkles, 
  ChevronRight, Globe, Fingerprint, History,
  LogOut, Package, ShoppingCart, Calendar
} from "lucide-react";
import { resolveImage } from "@/lib/site";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});

type Tab = "general" | "security" | "notifications" | "preferences";

function AdminProfile() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  
  const [profile, setProfile] = useState<{
    full_name: string;
    phone: string;
    email: string;
    avatar_url: string;
    bio: string;
    preferences: any;
  }>({
    full_name: "",
    phone: "",
    email: "",
    avatar_url: "",
    bio: "",
    preferences: {},
  });

  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    joinDate: "",
  });

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchStats();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          email: data.email || user!.email || "",
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          preferences: data.preferences || {},
        });
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const [orders, products] = await Promise.all([
      supabase.from("orders").select("*", { count: 'exact', head: true }),
      supabase.from("products").select("*", { count: 'exact', head: true })
    ]);
    setStats({
      orders: orders.count || 0,
      products: products.count || 0,
      joinDate: new Date(user!.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          bio: profile.bio,
          preferences: profile.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (error) throw error;
      toast.success("Changes saved successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${user!.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user!.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-sm font-medium text-cocoa/40 tracking-widest uppercase">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "general", label: "General Settings", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Layout },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-[2.5rem] glass p-8 border border-white/40 flex flex-col items-center text-center shadow-soft">
            <div className="relative group mb-6">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-cocoa/5 border-4 border-white shadow-md transition-transform duration-500 group-hover:scale-105">
                {profile.avatar_url ? (
                  <img
                    src={resolveImage(profile.avatar_url)}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-cocoa/20">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-gold text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white">
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </label>
            </div>

            <h2 className="font-display text-2xl font-bold">{profile.full_name || "Administrator"}</h2>
            <div className="mt-2 inline-flex items-center rounded-full bg-gold px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
              Administrator
            </div>

            <div className="mt-8 w-full space-y-3 bg-cocoa/5 p-4 rounded-2xl text-left">
              <div className="flex items-center gap-3 text-sm text-cocoa/70">
                <Mail className="h-4 w-4 text-gold" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-cocoa/70">
                <Shield className="h-4 w-4 text-gold" />
                <span>Role: Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="rounded-[2.5rem] glass p-4 border border-white/40 shadow-soft">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 ${
                      active 
                        ? "bg-gold text-white shadow-md" 
                        : "text-cocoa/70 hover:bg-cocoa/5 hover:text-cocoa"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </div>
                    {active && <ChevronRight className="h-4 w-4 opacity-70" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl bg-gold text-white px-6 py-4 text-sm font-bold shadow-soft hover:bg-gold/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </button>
            <button
              onClick={() => signOut().then(() => navigate({ to: "/admin/login" }))}
              className="w-full rounded-2xl bg-white text-cocoa/60 border border-cocoa/10 px-6 py-4 text-sm font-bold shadow-sm hover:bg-cocoa/5 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-[2rem] glass p-6 border border-white/40 shadow-soft flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1">Products</p>
                <p className="font-display text-2xl font-bold">{stats.products}</p>
              </div>
            </div>
            <div className="rounded-[2rem] glass p-6 border border-white/40 shadow-soft flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1">Total Orders</p>
                <p className="font-display text-2xl font-bold">{stats.orders}</p>
              </div>
            </div>
            <div className="rounded-[2rem] glass p-6 border border-white/40 shadow-soft flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1">Member Since</p>
                <p className="font-display text-lg font-bold leading-tight">{stats.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-[2.5rem] glass p-8 sm:p-10 border border-white/40 shadow-soft min-h-[400px]"
            >
              {activeTab === "general" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-2xl mb-1">General Settings</h3>
                    <p className="text-sm text-cocoa/50">Manage your personal information and biography.</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">
                        <User className="h-3 w-3" /> Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full rounded-2xl border border-cocoa/10 bg-white/50 px-5 py-3.5 outline-none focus:border-gold transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">
                        <Phone className="h-3 w-3" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full rounded-2xl border border-cocoa/10 bg-white/50 px-5 py-3.5 outline-none focus:border-gold transition-all"
                        placeholder="024 123 4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">
                      <Globe className="h-3 w-3" /> Biography
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="w-full rounded-2xl border border-cocoa/10 bg-white/50 px-5 py-3.5 outline-none focus:border-gold transition-all resize-none"
                      placeholder="Tell the world a bit about yourself..."
                    />
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-2xl mb-1">Security & Access</h3>
                    <p className="text-sm text-cocoa/50">Manage your password and security settings.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white border border-cocoa/10">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-cocoa/5 flex items-center justify-center text-cocoa/40">
                          <Fingerprint className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Multi-Factor Authentication</p>
                          <p className="text-xs text-cocoa/50 mt-0.5">Add an extra layer of security to your account.</p>
                        </div>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-cocoa/10 relative cursor-pointer">
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white border border-cocoa/10 cursor-pointer hover:border-gold/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-cocoa/5 flex items-center justify-center text-cocoa/40">
                          <History className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Login History</p>
                          <p className="text-xs text-cocoa/50 mt-0.5">Check when and where you've logged in.</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-cocoa/30" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-2xl mb-1">Notifications</h3>
                    <p className="text-sm text-cocoa/50">Manage how you receive alerts.</p>
                  </div>
                  <div className="grid h-64 place-items-center rounded-3xl border-2 border-dashed border-cocoa/10 text-center px-10 bg-white/30">
                    <div className="space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
                        <Bell className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-sm">Stay Updated</h4>
                      <p className="text-xs text-cocoa/50 leading-relaxed max-w-sm">System notifications are currently handled via email. Push notifications are coming soon.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-2xl mb-1">Dashboard Preferences</h3>
                    <p className="text-sm text-cocoa/50">Customize your admin interface.</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-6 rounded-3xl bg-cocoa text-cream cursor-pointer border border-transparent">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Layout className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block">Modern Grid</span>
                          <span className="text-[10px] text-cream/50 uppercase tracking-widest font-bold">Active</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-3xl bg-white border border-cocoa/10 hover:border-gold/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-cocoa/5 flex items-center justify-center">
                          <Layout className="h-5 w-5 text-cocoa/30" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-cocoa block">Classic List</span>
                          <span className="text-[10px] text-cocoa/40 uppercase tracking-widest font-bold">Coming Soon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
