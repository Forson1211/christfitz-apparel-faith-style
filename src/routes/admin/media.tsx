import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

function AdminMedia() {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const list = async () => {
    const { data } = await supabase.storage.from("site-assets").list("uploads", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (!data) return;
    const items = data.map((f) => {
      const { data: u } = supabase.storage.from("site-assets").getPublicUrl(`uploads/${f.name}`);
      return { name: f.name, url: u.publicUrl };
    });
    setFiles(items);
  };
  useEffect(() => { list(); }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    const path = `uploads/${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, f);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    list();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Media Library</h1>
      <div className="rounded-3xl glass p-5">
        <input type="file" accept="image/*" onChange={upload} disabled={busy} />
        <p className="mt-2 text-xs text-muted-foreground">Upload images, then copy the URL into a product or category.</p>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {files.map((f) => (
          <div key={f.name} className="rounded-2xl glass overflow-hidden">
            <img src={f.url} alt={f.name} className="aspect-square w-full object-cover" />
            <div className="p-2">
              <button onClick={() => { navigator.clipboard.writeText(f.url); toast.success("URL copied"); }} className="flex items-center gap-2 text-xs text-cocoa/70 hover:text-cocoa w-full justify-center">
                <Copy className="h-3 w-3" /> Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
