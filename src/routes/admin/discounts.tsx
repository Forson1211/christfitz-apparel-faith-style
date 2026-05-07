import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Tag, Trash2, Copy, X, RefreshCw, Edit, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { useSite } from "@/lib/site";

export const Route = createFileRoute("/admin/discounts")({
  component: DiscountsAdmin,
});

type Discount = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  uses: number;
  max_uses: number;
  active: boolean;
  expires_at: string | null;
};

function DiscountsAdmin() {
  const { settings, refresh } = useSite();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "",
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 10,
    min_order: 0,
    max_uses: 100,
    active: true,
    expires_at: "",
  });

  const resetForm = () => {
    setForm({
      id: "",
      code: "",
      type: "percent",
      value: 10,
      min_order: 0,
      max_uses: 100,
      active: true,
      expires_at: "",
    });
  };

  const fetchDiscounts = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("discounts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) toast.error("Failed to load discounts: " + error.message);
    else setDiscounts((data ?? []) as Discount[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  useEffect(() => {
    setAnnouncement(settings.announcement);
  }, [settings.announcement]);

  const saveKey = async (key: string, value: any) => {
    const { error } = await supabase.rpc("save_site_setting", {
      p_key: key,
      p_value: value,
    });

    if (error) {
      console.error(`Error saving ${key}:`, error);
      toast.error("Save failed: " + error.message);
      return;
    }

    toast.success("Announcement updated");
    refresh();
  };

  const saveDiscount = async () => {
    if (!form.code.trim()) return toast.error("Code is required");
    
    // Check for duplicates (excluding current item if editing)
    const existing = discounts.find((d) => d.code === form.code.toUpperCase() && d.id !== form.id);
    if (existing) return toast.error("Code already exists");

    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      min_order: form.min_order,
      max_uses: form.max_uses,
      active: form.active,
      expires_at: form.expires_at || null,
    };

    let error;
    if (form.id) {
      const { error: updateError } = await (supabase as any)
        .from("discounts")
        .update(payload)
        .eq("id", form.id);
      error = updateError;
    } else {
      const { error: insertError } = await (supabase as any)
        .from("discounts")
        .insert([{ ...payload, uses: 0 }]);
      error = insertError;
    }
    
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success(form.id ? "Discount updated!" : "Discount created!");
      setShowForm(false);
      resetForm();
      fetchDiscounts();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await (supabase as any)
      .from("discounts")
      .update({ active: !current })
      .eq("id", id);
    
    if (error) toast.error(error.message);
    else fetchDiscounts();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await (supabase as any).from("discounts").delete().eq("id", id);
    
    if (error) toast.error(error.message);
    else {
      toast.success("Removed");
      fetchDiscounts();
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">
            — Promotions
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold">Discount Codes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage promotional codes for your store.
          </p>
        </motion.div>
        <div className="flex gap-2">
          <button
            onClick={fetchDiscounts}
            className="rounded-xl glass px-4 py-2 text-xs font-bold text-cocoa border border-white/40 flex items-center gap-2 hover:bg-white/50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-xl bg-cocoa text-cream px-4 py-2 text-xs font-bold shadow-sm hover:scale-[1.03] transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Code
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Codes", value: discounts.filter((d) => d.active).length },
          { label: "Total Uses", value: discounts.reduce((s, d) => s + d.uses, 0) },
          { label: "Total Codes", value: discounts.length },
        ].map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl glass shadow-sm border border-white/40 p-5 text-center"
          >
            <div className="text-3xl font-display font-bold text-cocoa">{loading ? "—" : value}</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mt-1">
              {label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Announcement Settings */}
      <Section title="Global Announcement" onSave={() => saveKey("announcement", announcement)}>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-cocoa/5 border border-cocoa/10 mb-4">
          <input
            type="checkbox"
            checked={announcement?.enabled}
            onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
            className="h-4 w-4 accent-cocoa"
          />
          <span className="text-sm font-medium text-cocoa">Enable announcement bar storefront</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Announcement Text (Tip: Use [CODE] for live code)"
            value={announcement?.text || ""}
            onChange={(v) => setAnnouncement({ ...announcement, text: v })}
          />
          <Input
            label="Target Link"
            value={announcement?.href || ""}
            onChange={(v) => setAnnouncement({ ...announcement, href: v })}
          />
        </div>
      </Section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl glass shadow-sm overflow-hidden border border-white/40"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-cocoa/5 text-xs uppercase tracking-widest text-cocoa/40 bg-white/20">
                <th className="px-6 py-4 font-bold">Code</th>
                <th className="px-6 py-4 font-bold">Discount</th>
                <th className="px-6 py-4 font-bold">Min. Order</th>
                <th className="px-6 py-4 font-bold">Uses</th>
                <th className="px-6 py-4 font-bold">Expires</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/5">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-white/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gold shrink-0" />
                      <span className="font-bold font-mono text-cocoa tracking-wider">
                        {d.code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(d.code);
                          toast.success("Copied!");
                        }}
                        className="p-1 text-cocoa/30 hover:text-cocoa rounded transition"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-cocoa">
                    {d.type === "percent" ? `${d.value}%` : `₵${d.value}`} off
                  </td>
                  <td className="px-6 py-4 text-cocoa/70">
                    {d.min_order > 0 ? `₵${d.min_order}` : "None"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-cocoa/70">
                        {d.uses}/{d.max_uses}
                      </span>
                      <div className="w-16 h-1.5 bg-cocoa/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cocoa rounded-full"
                          style={{ width: `${Math.min(100, (d.uses / d.max_uses) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-cocoa/70">
                    {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const isExpired = d.expires_at && new Date(d.expires_at) < new Date();
                      if (isExpired) {
                        return (
                          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                            Expired
                          </span>
                        );
                      }
                      return (
                        <button
                          onClick={() => toggleActive(d.id, d.active)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${d.active ? "bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600" : "bg-cocoa/5 text-cocoa/40 hover:bg-green-500/10 hover:text-green-600"}`}
                        >
                          {d.active ? "Active" : "Inactive"}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setForm({
                            id: d.id,
                            code: d.code,
                            type: d.type,
                            value: d.value,
                            min_order: d.min_order,
                            max_uses: d.max_uses,
                            active: d.active,
                            expires_at: d.expires_at ? d.expires_at.split('T')[0] : "",
                          });
                          setShowForm(true);
                        }}
                        className="p-2 text-cocoa/40 hover:text-cocoa hover:bg-cocoa/5 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(d.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && discounts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-cocoa/40">
                    No discount codes found. Create your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-cocoa/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-cream border border-white/40 shadow-2xl overflow-hidden"
          >
            <div className="p-6 bg-cocoa text-cream flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{form.id ? 'Edit Discount Code' : 'New Discount Code'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:text-gold transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">
                  Code
                </label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm font-mono outline-none focus:border-coffee transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed (₵)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">
                    {form.type === "percent" ? "Percent Off" : "Amount (₵)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">
                    Min. Order (₵)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.min_order}
                    onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
                    className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition"
                />
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 accent-cocoa"
                />
                <span className="text-cocoa/80 font-medium">Active immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-cocoa/15 text-sm text-cocoa/70 hover:bg-cocoa/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDiscount}
                  className="flex-1 py-3 rounded-xl bg-cocoa text-cream text-sm font-bold hover:bg-coffee transition"
                >
                  {form.id ? 'Save Changes' : 'Create Code'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Live Preview of the Announcement Bar */}
      <div className="fixed bottom-6 right-6 z-[101] pointer-events-none">
        <div className="bg-cocoa text-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 shadow-lg border border-white/20 inline-block">
          Live Storefront Preview
        </div>
      </div>
      <div className="relative z-[100]">
        <AnnouncementBar forceVisible={true} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, onSave, children }: any) {
  return (
    <div className="rounded-3xl glass p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        <button
          onClick={onSave}
          className="rounded-full bg-cocoa px-5 py-2 text-sm text-cream hover:bg-coffee"
        >
          Save
        </button>
      </div>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-2xl border border-cocoa/15 bg-cream/60 px-4 py-2.5 outline-none focus:border-coffee";
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cocoa/60">{label}</label>
      <div className="mt-1.5">
        {textarea ? (
          <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cls}
          />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
        )}
      </div>
    </div>
  );
}
