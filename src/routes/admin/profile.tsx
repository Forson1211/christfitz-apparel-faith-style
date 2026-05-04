import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Camera, User, Mail, Phone, Loader2, Save, 
  Settings, Shield, Bell, Layout, Sparkles, 
  ChevronRight, Globe, Fingerprint, History
} from "lucide-react";
import { resolveImage } from "@/lib/site";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});

type Tab = "general" | "security" | "notifications" | "preferences";

function AdminProfile() {
  const { user, isAdmin } = useAuth();
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
    { id: "general", label: "General", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Layout },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[3rem] bg-cocoa text-cream p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-gold/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 h-48 w-48 bg-cream/5 blur-[80px] -ml-24 -mb-24 rounded-full" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative group">
            <div className="h-40 w-40 rounded-[3rem] overflow-hidden bg-white/10 border-4 border-white/20 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-2">
              {profile.avatar_url ? (
                <img
                  src={resolveImage(profile.avatar_url)}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/20">
                  <User className="h-16 w-16" />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 h-12 w-12 rounded-[1.25rem] bg-gold text-cocoa flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all duration-300">
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </label>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                <Sparkles className="h-3 w-3" />
                System Administrator
              </div>
              <h1 className="font-display text-4xl sm:text-5xl">{profile.full_name || "Administrator"}</h1>
              <p className="text-cream/50 mt-2 font-medium flex items-center justify-center md:justify-start gap-2 italic">
                <Mail className="h-4 w-4" /> {profile.email}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest text-cream/40 font-bold">Orders Managed</p>
                <p className="text-xl font-display mt-1 text-gold">{stats.orders}</p>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest text-cream/40 font-bold">Total Products</p>
                <p className="text-xl font-display mt-1 text-gold">{stats.products}</p>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest text-cream/40 font-bold">Member Since</p>
                <p className="text-xl font-display mt-1 text-gold">{stats.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 ${
                  active 
                    ? "bg-cocoa text-cream shadow-xl translate-x-2" 
                    : "text-cocoa/60 hover:bg-cocoa/5 hover:text-cocoa"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${active ? "text-gold" : ""}`} />
                  {tab.label}
                </div>
                <ChevronRight className={`h-3 w-3 transition-transform ${active ? "rotate-90 opacity-100" : "opacity-0"}`} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-[2.5rem] glass p-8 sm:p-10 border border-white/40 shadow-xl"
            >
              {activeTab === "general" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl flex items-center gap-3">
                      General Information
                      <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    </h3>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-full bg-cocoa px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-cream hover:bg-coffee transition-all shadow-soft flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Save Changes
                    </button>
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
                  <h3 className="font-display text-2xl">Security & Access</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-cocoa/5 border border-cocoa/5 group hover:bg-cocoa/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-cocoa/40">
                          <Fingerprint className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Multi-Factor Authentication</p>
                          <p className="text-xs text-cocoa/40 mt-0.5">Add an extra layer of security to your account.</p>
                        </div>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-cocoa/10 relative cursor-pointer">
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-3xl bg-cocoa/5 border border-cocoa/5 group hover:bg-cocoa/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-cocoa/40">
                          <History className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Login History</p>
                          <p className="text-xs text-cocoa/40 mt-0.5">Check when and where you've logged in.</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-cocoa/20" />
                    </div>

                    <button className="w-full py-4 rounded-2xl border-2 border-dashed border-cocoa/10 text-cocoa/40 text-xs font-bold uppercase tracking-widest hover:border-gold/30 hover:text-gold transition-all">
                      Change Login Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <h3 className="font-display text-2xl text-center md:text-left">Push Notifications</h3>
                  <div className="grid h-64 place-items-center rounded-[2rem] border-2 border-dashed border-cocoa/5 text-center px-10">
                    <div className="space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
                        <Bell className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-sm">Stay Updated</h4>
                      <p className="text-xs text-cocoa/40 leading-relaxed">System notifications are currently handled via email. Push notifications are coming soon.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-8">
                  <h3 className="font-display text-2xl">Dashboard Preferences</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-5 rounded-3xl bg-cocoa text-cream">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                          <Layout className="h-4 w-4 text-gold" />
                        </div>
                        <span className="font-bold text-sm">Modern Grid</span>
                      </div>
                      <p className="text-[10px] text-cream/40 uppercase tracking-widest font-bold">Active Layout</p>
                    </div>
                    
                    <div className="p-5 rounded-3xl bg-white border border-cocoa/10 hover:border-gold/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-cocoa/5 flex items-center justify-center">
                          <Layout className="h-4 w-4 text-cocoa/20" />
                        </div>
                        <span className="font-bold text-sm text-cocoa/60">Classic List</span>
                      </div>
                      <p className="text-[10px] text-cocoa/20 uppercase tracking-widest font-bold italic">Coming Soon</p>
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
