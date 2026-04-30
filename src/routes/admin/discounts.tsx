import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Tag, Trash2, Copy, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/discounts")({
  component: DiscountsAdmin,
});

type Discount = {
  id: string; code: string; type: "percent" | "fixed"; value: number;
  minOrder: number; uses: number; maxUses: number; active: boolean; expires: string;
};

const INITIAL: Discount[] = [
  { id: "1", code: "FAITH20", type: "percent", value: 20, minOrder: 50, uses: 48, maxUses: 100, active: true, expires: "2026-12-31" },
  { id: "2", code: "GRACE10", type: "fixed", value: 10, minOrder: 0, uses: 12, maxUses: 50, active: true, expires: "2026-06-30" },
  { id: "3", code: "FIRSTBLESSING", type: "percent", value: 15, minOrder: 0, uses: 200, maxUses: 200, active: false, expires: "2026-03-01" },
];

function DiscountsAdmin() {
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: 10, minOrder: 0, maxUses: 100, active: true, expires: "" });

  const addDiscount = () => {
    if (!form.code.trim()) return toast.error("Code is required");
    if (discounts.find((d) => d.code === form.code.toUpperCase())) return toast.error("Code already exists");
    setDiscounts([...discounts, { ...form, id: Date.now().toString(), code: form.code.toUpperCase(), uses: 0 }]);
    setShowForm(false);
    setForm({ code: "", type: "percent", value: 10, minOrder: 0, maxUses: 100, active: true, expires: "" });
    toast.success("Discount code created!");
  };

  const toggleActive = (id: string) => {
    setDiscounts(discounts.map((d) => d.id === id ? { ...d, active: !d.active } : d));
  };

  const remove = (id: string) => {
    setDiscounts(discounts.filter((d) => d.id !== id));
    toast.success("Removed");
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">— Promotions</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Discount Codes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage promotional codes for your store.</p>
        </motion.div>
        <button onClick={() => setShowForm(true)} className="rounded-xl bg-cocoa text-cream px-4 py-2 text-xs font-bold shadow-sm hover:scale-[1.03] transition flex items-center gap-2 self-start md:self-auto">
          <Plus className="h-4 w-4" /> New Code
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Active Codes", value: discounts.filter((d) => d.active).length }, { label: "Total Uses", value: discounts.reduce((s, d) => s + d.uses, 0) }, { label: "Total Codes", value: discounts.length }].map(({ label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl glass shadow-sm border border-white/40 p-5 text-center">
            <div className="text-3xl font-display font-bold text-cocoa">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl glass shadow-sm overflow-hidden border border-white/40">
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
                      <span className="font-bold font-mono text-cocoa tracking-wider">{d.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(d.code); toast.success("Copied!"); }} className="p-1 text-cocoa/30 hover:text-cocoa rounded transition"><Copy className="h-3 w-3" /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-cocoa">{d.type === "percent" ? `${d.value}%` : `₵${d.value}`} off</td>
                  <td className="px-6 py-4 text-cocoa/70">{d.minOrder > 0 ? `₵${d.minOrder}` : "None"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-cocoa/70">{d.uses}/{d.maxUses}</span>
                      <div className="w-16 h-1.5 bg-cocoa/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cocoa rounded-full" style={{ width: `${Math.min(100, (d.uses / d.maxUses) * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-cocoa/70">{d.expires || "Never"}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(d.id)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${d.active ? "bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600" : "bg-cocoa/5 text-cocoa/40 hover:bg-green-500/10 hover:text-green-600"}`}>
                      {d.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => remove(d.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-cocoa/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-2xl bg-cream border border-white/40 shadow-2xl overflow-hidden">
            <div className="p-6 bg-cocoa text-cream flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">New Discount Code</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:text-gold transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm font-mono outline-none focus:border-coffee transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed (₵)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">{form.type === "percent" ? "Percent Off" : "Amount (₵)"}</label>
                  <input type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">Min. Order (₵)</label>
                  <input type="number" min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">Max Uses</label>
                  <input type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">Expiry Date</label>
                <input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition" />
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-cocoa" />
                <span className="text-cocoa/80 font-medium">Active immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-cocoa/15 text-sm text-cocoa/70 hover:bg-cocoa/5 transition">Cancel</button>
                <button onClick={addDiscount} className="flex-1 py-3 rounded-xl bg-cocoa text-cream text-sm font-bold hover:bg-coffee transition">Create Code</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
