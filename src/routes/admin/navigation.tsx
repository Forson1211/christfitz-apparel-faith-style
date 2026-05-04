import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/navigation")({
  component: AdminNav,
});

function AdminNav() {
  const { navLinks, refresh } = useSite();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");

  const add = async () => {
    if (!label || !href) return toast.error("Both fields required");
    const { error } = await supabase
      .from("nav_links")
      .insert({ label, href, position: navLinks.length });
    if (error) return toast.error(error.message);
    setLabel("");
    setHref("");
    refresh();
  };
  const update = async (id: string, patch: any) => {
    await supabase.from("nav_links").update(patch).eq("id", id);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("nav_links").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Navigation</h1>
      <div className="rounded-3xl glass p-5 flex flex-col sm:flex-row gap-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2.5"
        />
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="Path (e.g. /products)"
          className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2.5"
        />
        <button
          onClick={add}
          className="rounded-full bg-cocoa px-5 py-2.5 text-sm text-cream hover:bg-coffee"
        >
          Add link
        </button>
      </div>
      <div className="space-y-3">
        {navLinks.map((l) => (
          <div
            key={l.id}
            className="rounded-2xl glass p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <input
              defaultValue={l.label}
              onBlur={(e) => e.target.value !== l.label && update(l.id, { label: e.target.value })}
              className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2"
            />
            <input
              defaultValue={l.href}
              onBlur={(e) => e.target.value !== l.href && update(l.id, { href: e.target.value })}
              className="flex-1 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2"
            />
            <input
              type="number"
              defaultValue={l.position}
              onBlur={(e) => update(l.id, { position: parseInt(e.target.value) })}
              className="w-20 rounded-full border border-cocoa/15 bg-cream/60 px-4 py-2"
            />
            <button onClick={() => remove(l.id)} className="text-destructive text-sm">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
