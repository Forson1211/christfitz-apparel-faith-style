import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Palette } from "lucide-react";

export const Route = createFileRoute("/admin/colors")({
  component: AdminColors,
});

function AdminColors() {
  const { settings, refresh } = useSite();
  const [colors, setColors] = useState(settings.colors);
  const [logo, setLogo] = useState(settings.logo);
  const [favicon, setFavicon] = useState(settings.favicon);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setColors(settings.colors);
    setLogo(settings.logo);
    setFavicon(settings.favicon);
  }, [settings]);

  const save = async (key: string, value: any) => {
    setBusy(true);
    const { error: updateError, data } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key)
      .select();

    if (updateError || !data || data.length === 0) {
      const { error: insertError } = await supabase.from("site_settings").insert({ key, value });

      if (insertError) {
        setBusy(false);
        return toast.error("Database Error: " + insertError.message);
      }
    }
    setBusy(false);
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} settings updated`);
    refresh();
  };

  const upload = async (file: File, folder: string) => {
    const path = `${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="max-w-4xl space-y-10 pb-20">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Brand Identity</p>
        <h1 className="mt-2 font-display text-4xl">Colors & Logo</h1>
        <p className="mt-2 text-muted-foreground">
          Customize your store's visual identity to match your brand's spirit.
        </p>
      </div>

      {/* Colors Section */}
      <section className="rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40">
        <div className="bg-cocoa p-8 text-cream flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-cream/10 flex items-center justify-center border border-cream/20">
              <Palette className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h2 className="font-display text-2xl">Visual Palette</h2>
              <p className="text-cream/60 text-sm">Manage your site's primary colors</p>
            </div>
          </div>
          <button
            onClick={() => save("colors", colors)}
            disabled={busy}
            className="rounded-full bg-cream px-8 py-3 text-xs font-bold uppercase tracking-widest text-cocoa hover:scale-[1.03] transition shadow-soft disabled:opacity-50"
          >
            Save Palette
          </button>
        </div>

        <div className="p-8 grid gap-8 sm:grid-cols-2">
          {(["cocoa", "coffee", "cream", "gold"] as const).map((k) => (
            <div
              key={k}
              className="p-6 rounded-3xl bg-cocoa/5 border border-cocoa/10 transition-all hover:bg-cocoa/[0.07]"
            >
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold">
                  {k} Color
                </label>
                <div
                  className="h-6 w-6 rounded-full border border-cocoa/10 shadow-sm"
                  style={{ backgroundColor: colors[k] }}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 rounded-2xl overflow-hidden border-2 border-cocoa/10">
                  <input
                    type="color"
                    value={colors[k]}
                    onChange={(e) => setColors({ ...colors, [k]: e.target.value })}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer border-none p-0"
                  />
                </div>
                <input
                  value={colors[k]}
                  onChange={(e) => setColors({ ...colors, [k]: e.target.value })}
                  className="flex-1 rounded-2xl border-2 border-cocoa/5 bg-white px-5 py-3 text-sm font-medium focus:border-gold/50 focus:outline-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logo & Favicon Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        <section className="rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40">
          <div className="p-8 border-b border-cocoa/5 flex items-center justify-between">
            <h2 className="font-display text-xl">Site Logo</h2>
            <button
              onClick={() => save("logo", logo)}
              disabled={busy}
              className="text-gold font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
            >
              Save Logo
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center justify-center p-10 rounded-3xl bg-cocoa/5 border-2 border-dashed border-cocoa/10 relative group">
              {logo.url ? (
                <img
                  src={logo.url}
                  alt="logo"
                  className="h-24 w-24 rounded-full object-cover shadow-soft"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-cocoa flex items-center justify-center text-cream text-4xl shadow-soft">
                  {logo.symbol}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await upload(f, "logos");
                  if (url) setLogo({ ...logo, url });
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <p className="mt-4 text-[10px] uppercase tracking-widest text-cocoa/40 font-bold">
                Click to upload
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold px-1">
                Fallback Symbol
              </label>
              <input
                value={logo.symbol}
                onChange={(e) => setLogo({ ...logo, symbol: e.target.value })}
                placeholder="e.g. ✝"
                className="w-full rounded-2xl border-2 border-cocoa/5 bg-white px-5 py-3.5 text-sm focus:border-gold/50 focus:outline-none transition-all"
              />
            </div>
            {logo.url && (
              <button
                onClick={() => setLogo({ ...logo, url: "" })}
                className="w-full text-center text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Remove Logo Image
              </button>
            )}
          </div>
        </section>

        <section className="rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40">
          <div className="p-8 border-b border-cocoa/5 flex items-center justify-between">
            <h2 className="font-display text-xl">Favicon</h2>
            <button
              onClick={() => save("favicon", favicon)}
              disabled={busy}
              className="text-gold font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
            >
              Save Favicon
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center justify-center p-10 rounded-3xl bg-cocoa/5 border-2 border-dashed border-cocoa/10 relative group">
              {favicon.url ? (
                <img src={favicon.url} alt="favicon" className="h-16 w-16 rounded shadow-soft" />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-cocoa/10 flex items-center justify-center">
                  <span className="text-cocoa/20 text-2xl">?</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await upload(f, "favicons");
                  if (url) setFavicon({ url });
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <p className="mt-4 text-[10px] uppercase tracking-widest text-cocoa/40 font-bold">
                Upload ICO/PNG
              </p>
            </div>
            <p className="text-xs text-cocoa/40 text-center px-4">
              The favicon appears in the browser tab and search results.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
