import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const { categories, refresh } = useSite();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const add = async () => {
    if (!name || !slug) return toast.error("Name & slug required");
    const { error } = await supabase.from("categories").insert({ name, slug, position: categories.length });
    if (error) return toast.error(error.message);
    setName(""); setSlug(""); refresh();
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

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Categories</h1>
      <div className="rounded-3xl glass p-5 flex flex-col sm:flex-row gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Hats)" className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2.5" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (e.g. hats)" className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2.5" />
        <button onClick={add} className="rounded-full bg-cocoa px-5 py-2.5 text-sm text-cream hover:bg-coffee">Add</button>
      </div>
      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl glass p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && update(c.id, { name: e.target.value })} className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2" />
            <input defaultValue={c.description ?? ""} placeholder="Description" onBlur={(e) => update(c.id, { description: e.target.value })} className="flex-[2] rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2" />
            <input defaultValue={c.image_url ?? ""} placeholder="Image (URL or filename)" onBlur={(e) => update(c.id, { image_url: e.target.value })} className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2" />
            <button onClick={() => remove(c.id)} className="text-destructive text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
