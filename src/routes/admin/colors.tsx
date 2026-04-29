import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/colors")({
  component: AdminColors,
});

function AdminColors() {
  const { settings, refresh } = useSite();
  const [colors, setColors] = useState(settings.colors);
  const [logo, setLogo] = useState(settings.logo);
  const [favicon, setFavicon] = useState(settings.favicon);

  useEffect(() => { setColors(settings.colors); setLogo(settings.logo); setFavicon(settings.favicon); }, [settings]);

  const save = async (key: string, value: any) => {
    const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refresh();
  };

  const upload = async (file: File, folder: string) => {
    const path = `${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Colors, Logo & Favicon</h1>

      <div className="rounded-3xl glass p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">Brand colors</h2>
          <button onClick={() => save("colors", colors)} className="rounded-full bg-cocoa px-5 py-2 text-sm text-cream hover:bg-coffee">Save</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {(["cocoa","coffee","cream","gold"] as const).map((k) => (
            <div key={k}>
              <label className="text-xs uppercase tracking-widest text-cocoa/60">{k}</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input type="color" value={colors[k]} onChange={(e) => setColors({ ...colors, [k]: e.target.value })} className="h-10 w-12 rounded border border-cocoa/15" />
                <input value={colors[k]} onChange={(e) => setColors({ ...colors, [k]: e.target.value })} className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-3 py-2 text-sm" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Note: brand colors are stored and shown in admin previews. The site's main visual palette uses CSS tokens to preserve design integrity.</p>
      </div>

      <div className="rounded-3xl glass p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">Logo</h2>
          <button onClick={() => save("logo", logo)} className="rounded-full bg-cocoa px-5 py-2 text-sm text-cream hover:bg-coffee">Save</button>
        </div>
        <div className="flex items-center gap-4">
          {logo.url ? <img src={logo.url} alt="logo" className="h-14 w-14 rounded-full object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-full bg-cocoa text-cream text-xl">{logo.symbol}</span>}
          <input type="file" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const url = await upload(f, "logos"); if (url) setLogo({ ...logo, url });
          }} className="text-sm" />
        </div>
        <input value={logo.symbol} onChange={(e) => setLogo({ ...logo, symbol: e.target.value })} placeholder="Fallback symbol" className="rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2 max-w-xs" />
        {logo.url && <button onClick={() => setLogo({ ...logo, url: "" })} className="text-xs text-destructive">Remove logo image</button>}
      </div>

      <div className="rounded-3xl glass p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">Favicon</h2>
          <button onClick={() => save("favicon", favicon)} className="rounded-full bg-cocoa px-5 py-2 text-sm text-cream hover:bg-coffee">Save</button>
        </div>
        <div className="flex items-center gap-4">
          {favicon.url && <img src={favicon.url} alt="favicon" className="h-10 w-10 rounded" />}
          <input type="file" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const url = await upload(f, "favicons"); if (url) setFavicon({ url });
          }} className="text-sm" />
        </div>
      </div>
    </div>
  );
}
