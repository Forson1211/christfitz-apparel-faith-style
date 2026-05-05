import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite, productImage } from "@/lib/site";
import {
  Package,
  FolderTree,
  TrendingUp,
  Users,
  DollarSign,
  MousePointer2,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  BarChart3,
  ShoppingCart,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

type Order = {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};
type Profile = { id: string; full_name: string | null; email: string | null; updated_at: string };

function Dashboard() {
  const { products, categories } = useSite();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = async () => {
    setDataLoading(true);
    const [ordersRes, profilesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("profiles")
        .select("id, full_name, email, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    if (profilesRes.data) setCustomers(profilesRes.data as Profile[]);
    setDataLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetStoreData = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to RESET ALL STORE DATA? This will delete all orders, testimonials, and customer profiles (except yours). This action cannot be undone.",
    );
    if (!confirmed) return;

    setDataLoading(true);
    try {
      // 1. Delete all orders
      await supabase.from("orders").delete().not("id", "eq", "00000000-0000-0000-0000-000000000000");

      // 2. Delete all testimonials
      await supabase
        .from("testimonials")
        .delete()
        .not("id", "eq", "00000000-0000-0000-0000-000000000000");

      // 3. Delete all profiles except current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").delete().neq("id", user.id);
      }

      toast.success("Store data has been reset successfully.");
      fetchData();
    } catch (error: any) {
      toast.error("Error resetting data: " + error.message);
    } finally {
      setDataLoading(false);
    }
  };

  const fulfilledRevenue = orders
    .filter((o) => o.status === "fulfilled" || o.status === "pending")
    .reduce((s, o) => s + Number(o.total), 0);
  const totalOrdersCount = orders.length;
  const recentOrders = orders.slice(0, 5);

  const metrics = [
    {
      label: "Total Revenue",
      value: dataLoading ? "..." : `₵${fulfilledRevenue.toLocaleString()}`,
      change: "Live",
      trend: "up",
      Icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: dataLoading ? "..." : String(totalOrdersCount),
      change: "Live",
      trend: "up",
      Icon: ShoppingCart,
    },
    {
      label: "Products",
      value: String(products.length),
      change: "Live",
      trend: "up",
      Icon: Package,
    },
    {
      label: "Customers",
      value: dataLoading ? "..." : String(customers.length),
      change: "Live",
      trend: "up",
      Icon: Users,
    },
  ];

  const topProducts = products.slice(0, 3).map((p) => {
    // Basic dynamic simulation based on price and rating for now since we don't have a complex order_items join
    const estSales = Math.floor(Math.random() * 20) + p.reviews;
    return {
      ...p,
      sales: estSales,
      growth: "Active",
    };
  });

  // Simulating a chart path
  const chartPoints = "0,80 20,60 40,70 60,30 80,45 100,10 120,40 140,25 160,55 180,20 200,50";

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">
            — Performance Overview
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed analytics and management for your kingdom.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-2"
        >
          <button
            onClick={fetchData}
            className="rounded-xl glass px-4 py-2 text-xs font-bold text-cocoa/60 border border-white/40 flex items-center gap-2 hover:bg-white/50 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={resetStoreData}
            className="rounded-xl glass px-4 py-2 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-2 hover:bg-red-50 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Reset Data
          </button>
          <Link
            to="/admin/analytics"
            className="rounded-xl bg-cocoa text-cream px-4 py-2 text-xs font-bold shadow-sm hover:scale-[1.03] transition flex items-center gap-1.5"
          >
            <BarChart3 className="h-3.5 w-3.5" /> View Analytics
          </Link>
        </motion.div>
      </div>

      {/* Live Inventory Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <Link
          to="/admin/products"
          className="group rounded-xl glass border border-white/40 p-4 flex items-center gap-3 hover:bg-white/50 hover:shadow-sm transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-cocoa/5 flex items-center justify-center text-coffee group-hover:bg-cocoa group-hover:text-cream transition-colors">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-cocoa">{products.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">
              Products
            </div>
          </div>
        </Link>
        <Link
          to="/admin/categories"
          className="group rounded-xl glass border border-white/40 p-4 flex items-center gap-3 hover:bg-white/50 hover:shadow-sm transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-cocoa/5 flex items-center justify-center text-coffee group-hover:bg-cocoa group-hover:text-cream transition-colors">
            <FolderTree className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-cocoa">{categories.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">
              Categories
            </div>
          </div>
        </Link>
        <Link
          to="/admin/orders"
          className="group rounded-xl glass border border-white/40 p-4 flex items-center gap-3 hover:bg-white/50 hover:shadow-sm transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-cocoa/5 flex items-center justify-center text-coffee group-hover:bg-cocoa group-hover:text-cream transition-colors">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-cocoa">{totalOrdersCount}</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">
              Orders
            </div>
          </div>
        </Link>
        <Link
          to="/admin/testimonials"
          className="group rounded-xl glass border border-white/40 p-4 flex items-center gap-3 hover:bg-white/50 hover:shadow-sm transition-all"
        >
          <div className="h-9 w-9 rounded-lg bg-cocoa/5 flex items-center justify-center text-coffee group-hover:bg-cocoa group-hover:text-cream transition-colors">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-cocoa">Manage</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">
              Testimonials
            </div>
          </div>
        </Link>
      </motion.div>
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, change, trend, Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-2xl glass shadow-sm p-5 border border-white/40 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-cocoa/5 flex items-center justify-center text-coffee group-hover:bg-cocoa group-hover:text-cream transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend === "up" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {change}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-display font-bold text-cocoa">{value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                {label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart Container */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl glass shadow-sm overflow-hidden border border-white/40 flex flex-col"
        >
          <div className="p-6 border-b border-cocoa/5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Sales Performance</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue growth over the past 2 weeks
              </p>
            </div>
            <select className="bg-transparent text-xs font-bold uppercase tracking-widest text-coffee outline-none cursor-pointer">
              <option>Revenue</option>
              <option>Orders</option>
            </select>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-end min-h-[250px] relative">
            {/* Grid lines */}
            <div className="absolute inset-6 flex flex-col justify-between pointer-events-none opacity-20">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-cocoa/20" />
              ))}
            </div>

            {/* SVG Chart */}
            <svg
              className="w-full h-40 overflow-visible"
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cocoa)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--cocoa)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M 0,100 L ${chartPoints} L 200,100 Z`} fill="url(#chartGradient)" />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d={`M ${chartPoints}`}
                fill="none"
                stroke="var(--cocoa)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-cocoa/40">
              <span>Apr 14</span>
              <span>Apr 18</span>
              <span>Apr 22</span>
              <span>Apr 26</span>
              <span>Today</span>
            </div>
          </div>
        </motion.section>

        {/* Top Products / Inventory */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-cocoa text-cream shadow-md overflow-hidden p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold">Top Sellers</h2>
            <button className="text-gold">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-cream/10 border border-white/10 group-hover:scale-105 transition-transform">
                  <img src={productImage(p)} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate group-hover:text-gold transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-cream/40 font-medium mt-0.5">
                    {p.sales} Sold this week
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">₵{p.price}</div>
                  <div className="text-[10px] font-bold text-green-400">{p.growth}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/admin/products"
            className="mt-8 w-full rounded-xl bg-cream/10 border border-white/10 text-center py-3 text-xs font-bold uppercase tracking-widest hover:bg-cream/20 transition-all"
          >
            View All Inventory
          </Link>
        </motion.section>
      </div>

      {/* Additional Analytics Row - REAL DATA */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders - real DB */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl glass shadow-sm overflow-hidden border border-white/40 flex flex-col"
        >
          <div className="p-6 border-b border-cocoa/5 flex items-center justify-between bg-white/20">
            <div>
              <h2 className="font-display text-lg font-bold">Recent Orders</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Latest transactions from the database
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold uppercase tracking-widest text-coffee border-b border-coffee pb-0.5 hover:text-cocoa transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="p-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-10 text-cocoa/40 gap-3">
                <div className="h-4 w-4 rounded-full border-2 border-cocoa/30 border-t-cocoa animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-cocoa/40">No orders yet</div>
            ) : (
              <div className="divide-y divide-cocoa/5">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 flex items-center justify-between hover:bg-white/30 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-cocoa text-sm font-mono">
                        {order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-cocoa/60 mt-0.5">{order.customer_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cocoa text-sm">
                        ₵{Number(order.total).toFixed(2)}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${order.status === "fulfilled" ? "text-green-600" : order.status === "cancelled" ? "text-red-500" : "text-yellow-600"}`}
                      >
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* New Customers - real DB */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl glass shadow-sm overflow-hidden border border-white/40 flex flex-col"
        >
          <div className="p-6 border-b border-cocoa/5 flex items-center justify-between bg-white/20">
            <div>
              <h2 className="font-display text-lg font-bold">Recent Customers</h2>
              <p className="text-xs text-muted-foreground mt-1">Recently registered accounts</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-bold uppercase tracking-widest text-coffee border-b border-coffee pb-0.5 hover:text-cocoa transition-colors"
            >
              Manage
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-5">
            {dataLoading ? (
              <div className="flex items-center justify-center py-6 text-cocoa/40 gap-3">
                <div className="h-4 w-4 rounded-full border-2 border-cocoa/30 border-t-cocoa animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-6 text-center text-sm text-cocoa/40">No customers yet</div>
            ) : (
              customers.map((user) => {
                const diff = Math.floor(
                  (Date.now() - new Date(user.updated_at).getTime()) / 86400000,
                );
                const timeLabel = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff}d ago`;
                const initials = (user.full_name ?? user.email ?? "?").charAt(0).toUpperCase();
                return (
                  <div key={user.id} className="flex items-center gap-4 group">
                    <div className="h-10 w-10 rounded-xl bg-cocoa/5 text-coffee flex items-center justify-center font-bold text-sm group-hover:bg-cocoa group-hover:text-cream transition-colors shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-cocoa text-sm truncate">
                        {user.full_name ?? <span className="italic text-cocoa/40">No name</span>}
                      </div>
                      <div className="text-xs text-cocoa/60 truncate mt-0.5">
                        {user.email ?? "—"}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-cocoa/40 shrink-0">
                      {timeLabel}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
