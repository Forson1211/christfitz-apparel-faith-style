import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Plus, Trash2, Save, GripVertical, Star, User } from "lucide-react";
import { motion, Reorder } from "framer-motion";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonials,
});

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await (supabase
      .from("testimonials" as any)
      .select("*") as any)
      .order("position");

    if (error) {
      toast.error("Failed to fetch testimonials");
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleAdd = () => {
    const newTestimonial: any = {
      id: `temp-${Date.now()}`,
      name: "New Believer",
      role: "Member",
      text: "Write the feedback here...",
      rating: 5,
      avatar_url: null,
      position: testimonials.length,
      active: true,
      created_at: new Date().toISOString(),
    };
    setTestimonials([...testimonials, newTestimonial]);
  };

  const handleRemove = async (id: string) => {
    if (id.startsWith("temp-")) {
      setTestimonials(testimonials.filter((t) => t.id !== id));
      return;
    }

    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    const { error } = await supabase.from("testimonials" as any).delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete testimonial");
    } else {
      toast.success("Testimonial deleted");
      fetchTestimonials();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const toUpdate = testimonials.map((t, index) => {
      const { id, ...data } = t;
      return {
        ...(id.startsWith("temp-") ? {} : { id }),
        ...data,
        position: index,
      };
    });

    const { error } = await supabase.from("testimonials" as any).upsert(toUpdate as any);

    if (error) {
      toast.error("Failed to save changes: " + error.message);
    } else {
      toast.success("All changes saved");
      fetchTestimonials();
    }
    setSaving(false);
  };

  const updateField = (id: string, field: keyof Testimonial, value: any) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cocoa border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">User Feedback</h1>
          <p className="mt-1 text-sm text-cocoa/60">
            Manage the testimonials displayed on the storefront.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-full border border-cocoa/10 bg-cream px-5 py-2.5 text-sm font-medium transition hover:bg-cocoa/5"
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-cocoa px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-coffee disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      <Reorder.Group
        axis="y"
        values={testimonials}
        onReorder={setTestimonials}
        className="space-y-4"
      >
        {testimonials.map((testimonial) => (
          <Reorder.Item
            key={testimonial.id}
            value={testimonial}
            className="group relative rounded-3xl border border-cocoa/10 bg-cream/60 p-6 shadow-sm transition hover:shadow-md backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              <div className="mt-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-cocoa/20 group-hover:text-cocoa/40" />
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-cocoa/40">
                      Author Name
                    </label>
                    <input
                      value={testimonial.name}
                      onChange={(e) => updateField(testimonial.id, "name", e.target.value)}
                      className="w-full rounded-xl border border-cocoa/10 bg-white/50 px-4 py-2.5 outline-none focus:border-gold transition"
                      placeholder="e.g. Sarah Chen"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-cocoa/40">
                      Role / Subtitle
                    </label>
                    <input
                      value={testimonial.role || ""}
                      onChange={(e) => updateField(testimonial.id, "role", e.target.value)}
                      className="w-full rounded-xl border border-cocoa/10 bg-white/50 px-4 py-2.5 outline-none focus:border-gold transition"
                      placeholder="e.g. Student / Member"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-cocoa/40">
                    Feedback Text
                  </label>
                  <textarea
                    value={testimonial.text}
                    onChange={(e) => updateField(testimonial.id, "text", e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-cocoa/10 bg-white/50 px-4 py-2.5 outline-none focus:border-gold transition"
                    placeholder="Their story..."
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-cocoa/40">
                        Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => updateField(testimonial.id, "rating", star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                star <= testimonial.rating
                                  ? "fill-gold text-gold"
                                  : "text-cocoa/10"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-cocoa/40">
                        Active
                      </label>
                      <button
                        onClick={() => updateField(testimonial.id, "active", !testimonial.active)}
                        className={`h-6 w-11 rounded-full transition-colors relative ${
                          testimonial.active ? "bg-gold" : "bg-cocoa/10"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            testimonial.active ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(testimonial.id)}
                    className="rounded-full p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {testimonials.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-cocoa/10 bg-cocoa/5 text-center">
          <User className="h-12 w-12 text-cocoa/20" />
          <p className="mt-4 text-sm text-cocoa/40 font-medium">No testimonials yet.</p>
          <button
            onClick={handleAdd}
            className="mt-4 text-sm font-bold text-gold hover:text-gold/80"
          >
            Create your first one
          </button>
        </div>
      )}
    </div>
  );
}
