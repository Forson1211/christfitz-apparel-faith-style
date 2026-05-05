import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Tag, Trash2, Copy, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 10,
    min_order: 0,
    max_uses: 100,
    active: true,
    expires_at: "",
  });

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

  const addDiscount = async () => {
    if (!form.code.trim()) return toast.error("Code is required");
    if (discounts.find((d) => d.code === form.code.toUpperCase()))
      return toast.error("Code already exists");

    const newDiscount = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      min_order: form.min_order,
      max_uses: form.max_uses,
      active: form.active,
      expires_at: form.expires_at || null,
      uses: 0
    };

    const { error } = await (supabase as any).from("discounts").insert([newDiscount]);
    
    if (error) {
      toast.error("Failed to create discount: " + error.message);
    } else {
      toast.success("Discount code created!");
      setShowForm(false);
      setForm({
        code: "",
        type: "percent",
        value: 10,
        min_order: 0,
        max_uses: 100,
        active: true,
        expires_at: "",
      });
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
            onClick={() => setShowForm(true)}
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
                    <button
                      onClick={() => toggleActive(d.id, d.active)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${d.active ? "bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600" : "bg-cocoa/5 text-cocoa/40 hover:bg-green-500/10 hover:text-green-600"}`}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => remove(d.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
              <h2 className="font-display text-xl font-bold">New Discount Code</h2>
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
                  onClick={addDiscount}
                  className="flex-1 py-3 rounded-xl bg-cocoa text-cream text-sm font-bold hover:bg-coffee transition"
                >
                  Create Code
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
