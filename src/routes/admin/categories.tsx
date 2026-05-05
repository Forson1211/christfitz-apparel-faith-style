import { createFileRoute } from "@tanstack/react-router";
import { useSite, resolveImage } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, HelpCircle } from "lucide-react";
import tees from "@/assets/collection-tees.jpg";
import essentials from "@/assets/collection-essentials.jpg";
import premium from "@/assets/collection-premium.jpg";

const fallbackImgs = [tees, essentials, premium];

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const { categories, refresh } = useSite();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  const add = async () => {
    if (!name || !slug) return toast.error("Name & slug required");
    const { error } = await supabase
      .from("categories")
      .insert({ name, slug, position: categories.length });
    if (error) return toast.error(error.message);
    setName("");
    setSlug("");
    refresh();
  };

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("categories").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("categories").delete().eq("id", id);
    refresh();
  };

  const handleUpload = async (id: string, file: File) => {
    setUploading(id);
    const ext = file.name.split(".").pop();
    const path = `categories/${id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file);
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("site-assets").getPublicUrl(path);
    await update(id, { image_url: publicUrl });
    setUploading(null);
    toast.success("Image uploaded!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">— Storefront Curation</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your signature lines and curated drops shown on the homepage.</p>
        </div>
      </div>
      
      <div className="rounded-3xl glass p-5 flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Hats)"
          className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2.5 outline-none"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (e.g. hats)"
          className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2.5 outline-none"
        />
        <button
          onClick={add}
          className="rounded-full bg-cocoa px-5 py-2.5 text-sm text-cream hover:bg-coffee"
        >
          Add Collection
        </button>
      </div>

      <div className="grid gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl glass p-6 space-y-4 border border-cocoa/5"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Image Preview / Upload */}
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-cocoa/5 border border-cocoa/10">
                <img
                  src={c.image_url ? resolveImage(c.image_url) : (fallbackImgs[c.position] || fallbackImgs[0])}
                  alt=""
                  className={`h-full w-full object-cover ${!c.image_url ? "opacity-50 grayscale-[0.5]" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa/40 to-transparent pointer-events-none" />
                
                {c.image_url ? (
                  <button 
                    onClick={() => update(c.id, { image_url: null })}
                    className="absolute top-1 right-1 h-6 w-6 grid place-items-center rounded-full bg-destructive text-white shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <label className="cursor-pointer group/upload">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUpload(c.id, e.target.files[0])}
                      />
                      <div className="rounded-full bg-cream/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cocoa shadow-sm group-hover/upload:bg-white transition-colors">
                        {uploading === c.id ? "Uploading..." : "Add Image"}
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 grid gap-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">Name</label>
                    <input
                      defaultValue={c.name}
                      onBlur={(e) => e.target.value !== c.name && update(c.id, { name: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-cocoa/15 bg-cream/60 px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">Marketing Tag (e.g. LIMITED)</label>
                    <input
                      defaultValue={c.tag || ""}
                      placeholder="Daily Wear, Bestseller..."
                      onBlur={(e) => update(c.id, { tag: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-cocoa/15 bg-cream/60 px-4 py-2 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">Sort Order (Top 3 show on Home)</label>
                    <input
                      type="number"
                      defaultValue={c.position}
                      onBlur={(e) => update(c.id, { position: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-2xl border border-cocoa/15 bg-cream/60 px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-cocoa/50 font-bold ml-1">Description</label>
                    <input
                      defaultValue={c.description || ""}
                      placeholder="Short description for SEO or internal use"
                      onBlur={(e) => update(c.id, { description: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-cocoa/15 bg-cream/60 px-4 py-2 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2">
                 <button onClick={() => remove(c.id)} className="h-10 px-4 rounded-xl border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-widest hover:bg-destructive hover:text-white transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
