import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, User, Mail, Phone, Loader2, Save } from "lucide-react";
import { resolveImage } from "@/lib/site";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});

function AdminProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string;
    phone: string;
    email: string;
    avatar_url: string;
  }>({
    full_name: "",
    phone: "",
    email: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    fetchProfile();
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
        });
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
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
        <Loader2 className="h-8 w-8 animate-spin text-cocoa/20" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden bg-cocoa/5 border-2 border-white shadow-luxe transition-transform group-hover:scale-105">
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
          <label className="absolute bottom-0 right-0 h-10 w-10 rounded-2xl bg-gold text-cocoa flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </label>
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl">Admin Profile</h1>
          <p className="text-sm text-cocoa/50 mt-1">Manage your personal information</p>
        </div>
      </div>

      <div className="rounded-[2.5rem] glass p-8 sm:p-10 border border-white/40 space-y-6">
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">
                <User className="h-3 w-3" /> Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full rounded-2xl border border-cocoa/10 bg-white/50 px-5 py-3.5 outline-none focus:border-gold transition-colors"
                placeholder="John Doe"
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
                className="w-full rounded-2xl border border-cocoa/10 bg-white/50 px-5 py-3.5 outline-none focus:border-gold transition-colors"
                placeholder="024 123 4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">
              <Mail className="h-3 w-3" /> Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full rounded-2xl border border-cocoa/10 bg-white/20 px-5 py-3.5 outline-none opacity-60 cursor-not-allowed"
            />
            <p className="text-[10px] text-cocoa/30 ml-1 italic">Email cannot be changed directly for security reasons.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-cocoa/5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl bg-cocoa text-cream px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-coffee transition-all shadow-soft flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile Changes
          </button>
        </div>
      </div>
    </div>
  );
}
