import { createFileRoute } from "@tanstack/react-router";
import { useSite, type DBProduct } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const empty = {
  name: "", price: 0, category: "T-Shirts", image_url: "", description: "",
  details: [] as string[], sizes: ["S","M","L","XL"], rating: 5, reviews: 0, verse: "", position: 0, active: true,
};

function AdminProducts() {
  const { products, categories, refresh } = useSite();
  const [editing, setEditing] = useState<Partial<DBProduct> | null>(null);

  const save = async () => {
    if (!editing?.name) return toast.error("Name required");
    const payload: any = {
      name: editing.name, price: editing.price ?? 0, category: editing.category ?? "T-Shirts",
      image_url: editing.image_url || "p1.jpg", description: editing.description ?? "",
      details: editing.details ?? [], sizes: editing.sizes ?? [],
      rating: editing.rating ?? 5, reviews: editing.reviews ?? 0,
      verse: editing.verse ?? null, position: editing.position ?? 0, active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">Add, edit, or remove items in your catalog.</p>
        </div>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm text-cream hover:bg-coffee">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl glass">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-cocoa/60">
            <tr><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Active</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-cocoa/10">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-muted-foreground">{p.category}</td>
                <td className="p-4 tabular-nums">₵{p.price}</td>
                <td className="p-4">{p.active ? "Yes" : "No"}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} className="text-coffee hover:underline mr-3">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-cocoa/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-cream p-6 shadow-luxe my-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">{editing.id ? "Edit product" : "New product"}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Name"><input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" /></Field>
              <Field label="Price"><input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })} className="input" /></Field>
              <Field label="Category">
                <select value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input">
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Image URL or code (e.g. p1.jpg)"><input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="input" /></Field>
              <Field label="Verse"><input value={editing.verse ?? ""} onChange={(e) => setEditing({ ...editing, verse: e.target.value })} className="input" /></Field>
              <Field label="Position"><input type="number" value={editing.position ?? 0} onChange={(e) => setEditing({ ...editing, position: parseInt(e.target.value) })} className="input" /></Field>
              <Field label="Sizes (comma)" full><input value={(editing.sizes ?? []).join(",")} onChange={(e) => setEditing({ ...editing, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="input" /></Field>
              <Field label="Description" full><textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input" /></Field>
              <Field label="Details (one per line)" full><textarea rows={4} value={(editing.details ?? []).join("\n")} onChange={(e) => setEditing({ ...editing, details: e.target.value.split("\n").filter(Boolean) })} className="input" /></Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm hover:bg-cocoa/5">Cancel</button>
              <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm text-cream hover:bg-coffee"><Save className="h-4 w-4" /> Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;border-radius:1rem;border:1px solid rgba(59,36,24,.15);background:rgba(248,244,239,.6);padding:.6rem 1rem;outline:none;}.input:focus{border-color:#6B4A3A;}`}</style>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs uppercase tracking-widest text-cocoa/60">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
