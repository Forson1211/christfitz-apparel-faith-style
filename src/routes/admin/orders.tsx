import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, MoreHorizontal, Download, RefreshCw, X, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number;
  items: any[];
  created_at: string;
  notes: string | null;
};

const STATUS_OPTS = ["pending", "processing", "fulfilled", "cancelled", "refunded"];

const statusColor = (s: string) => {
  switch (s) {
    case "fulfilled": return "bg-green-500/10 text-green-600";
    case "processing": return "bg-blue-500/10 text-blue-600";
    case "pending": return "bg-gold/20 text-yellow-700";
    case "cancelled": return "bg-red-500/10 text-red-600";
    case "refunded": return "bg-purple-500/10 text-purple-600";
    default: return "bg-cocoa/5 text-cocoa/60";
  }
};

function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editing, setEditing] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load orders: " + error.message);
    else setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const saveStatus = async (id: string, status: string) => {
    setSaving(true);
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    setEditing(null);
    fetchOrders();
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.customer_name.toLowerCase().includes(q) || o.customer_email.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.filter((o) => o.status === "fulfilled").reduce((s, o) => s + o.total, 0);

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">— Order Management</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage customer orders in real-time.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
          <button onClick={fetchOrders} className="rounded-xl glass px-4 py-2 text-xs font-bold text-cocoa border border-white/40 flex items-center gap-2 hover:bg-white/50 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button className="rounded-xl glass px-4 py-2 text-xs font-bold text-cocoa border border-white/40 flex items-center gap-2 hover:bg-white/50 transition">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </motion.div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: orders.length },
          { label: "Fulfilled", value: orders.filter((o) => o.status === "fulfilled").length },
          { label: "Processing", value: orders.filter((o) => o.status === "processing").length },
          { label: "Revenue", value: `₵${totalRevenue.toLocaleString()}` },
        ].map(({ label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl glass shadow-sm border border-white/40 p-5 text-center">
            <div className="text-2xl font-display font-bold text-cocoa">{loading ? "—" : value}</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl glass shadow-sm overflow-hidden border border-white/40">
        <div className="p-4 border-b border-cocoa/5 flex flex-col sm:flex-row gap-4 items-center bg-white/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cocoa/40" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/50 border border-cocoa/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-cocoa/30 focus:bg-white transition-all placeholder:text-cocoa/40" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/60 border border-cocoa/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cocoa/30 transition">
            <option value="all">All Statuses</option>
            {STATUS_OPTS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <span className="ml-auto text-xs text-cocoa/50 shrink-0">{filtered.length} orders</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-cocoa/40 gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-cocoa/30 border-t-cocoa animate-spin" />
            <span className="text-sm">Loading orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-cocoa/40 text-sm">
            {search ? "No orders match your search." : "No orders yet. Orders appear here when customers place them."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-cocoa/5 text-xs uppercase tracking-widest text-cocoa/40 bg-white/20">
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Items</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Total</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/5">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-cocoa font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-cocoa/70 text-xs">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-cocoa">{order.customer_name}</div>
                      <div className="text-xs text-cocoa/50">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-cocoa/70">{Array.isArray(order.items) ? order.items.length : 0} item(s)</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-cocoa">₵{Number(order.total).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setEditing(order)} className="p-2 text-cocoa/40 hover:text-cocoa hover:bg-cocoa/5 rounded-lg transition">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Edit Order Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-cocoa/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-cream border border-white/40 shadow-2xl overflow-hidden">
            <div className="p-6 bg-cocoa text-cream flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Order Details</h2>
                <p className="text-cream/60 text-xs mt-0.5 font-mono">{editing.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-1 hover:text-gold transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-cocoa/5 p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">Customer</div>
                <div className="font-bold text-cocoa">{editing.customer_name}</div>
                <div className="text-sm text-cocoa/60">{editing.customer_email}</div>
              </div>
              <div className="rounded-xl bg-cocoa/5 p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">Items</div>
                {(Array.isArray(editing.items) ? editing.items : []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-cocoa">{item.name} × {item.qty}</span>
                    <span className="font-bold text-cocoa">₵{item.price}</span>
                  </div>
                ))}
                <div className="border-t border-cocoa/10 pt-2 flex justify-between font-bold text-cocoa">
                  <span>Total</span><span>₵{Number(editing.total).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mb-1.5 block">Update Status</label>
                <select defaultValue={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="w-full rounded-xl border border-cocoa/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-coffee transition capitalize">
                  {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-cocoa/15 text-sm text-cocoa/70 hover:bg-cocoa/5 transition">Cancel</button>
                <button onClick={() => saveStatus(editing.id, editing.status)} disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-cocoa text-cream text-sm font-bold hover:bg-coffee transition flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
