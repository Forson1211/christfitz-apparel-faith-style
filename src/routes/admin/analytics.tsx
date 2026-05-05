import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  MousePointer2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
};

function Analytics() {
  const { products, userCount, refresh: refreshSite } = useSite();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    const { data: orderData } = await supabase
      .from("orders")
      .select("id, total, status, created_at, items")
      .order("created_at", { ascending: false });
    
    if (orderData) setOrders(orderData as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // 1. Calculate KPI Metrics
  const fulfilledOrders = orders.filter(o => o.status === 'fulfilled');
  const totalRevenue = fulfilledOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / fulfilledOrders.length : 0;
  
  // Synthetic trend logic (comparing to 30 days ago)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentOrders = fulfilledOrders.filter(o => new Date(o.created_at) > thirtyDaysAgo);
  const recentRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);
  
  const kpis = [
    {
      label: "Total Revenue",
      value: `₵${totalRevenue.toLocaleString()}`,
      change: recentRevenue > 0 ? `₵${recentRevenue.toLocaleString()} last 30d` : "No recent sales",
      trend: "up",
      sub: "Total fulfilled revenue",
      Icon: TrendingUp,
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      change: orders.filter(o => new Date(o.created_at) > thirtyDaysAgo).length.toString(),
      trend: "up",
      sub: "orders in last 30 days",
      Icon: ShoppingCart,
    },
    {
      label: "Registered Users",
      value: userCount.toLocaleString(),
      change: "+100%",
      trend: "up",
      sub: "total community members",
      Icon: Users,
    },
    {
      label: "Avg. Order Value",
      value: `₵${avgOrderValue.toFixed(2)}`,
      change: "Stable",
      trend: "up",
      sub: "per fulfilled order",
      Icon: MousePointer2,
    },
  ];

  // 2. Weekly Revenue Breakdown
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyRevenue = days.map((day, idx) => {
    const dayOrders = fulfilledOrders.filter(o => new Date(o.created_at).getDay() === idx);
    const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
    return { day, revenue, orders: dayOrders.length };
  });

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.revenue), 100);

  // 3. Category Breakdown
  const categoryStats = products.reduce((acc: any, p) => {
    const pSales = orders.reduce((sum, o) => {
      const item = o.items?.find((i: any) => i.id === p.id);
      return sum + (item?.quantity || 0);
    }, 0);
    
    if (!acc[p.category]) acc[p.category] = { revenue: 0, count: 0 };
    acc[p.category].revenue += pSales * p.price;
    acc[p.category].count += pSales;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryStats).map(([name, data]: [string, any]) => {
    const pct = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;
    return { 
      name, 
      pct, 
      revenue: `₵${data.revenue.toLocaleString()}`,
      color: name === "Hoodies" ? "bg-cocoa" : name === "T-Shirts" ? "bg-coffee" : "bg-gold"
    };
  }).sort((a, b) => b.pct - a.pct).slice(0, 3);

  // 4. Top Products
  const topProducts = products
    .map(p => {
      const sales = orders.reduce((sum, o) => {
        const item = o.items?.find((i: any) => i.id === p.id);
        return sum + (item?.quantity || 0);
      }, 0);
      return { ...p, sales, totalRevenue: sales * p.price };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)
    .map((p, i, arr) => ({
      ...p,
      revenue: `₵${p.totalRevenue.toLocaleString()}`,
      pct: arr[0].totalRevenue > 0 ? Math.round((p.totalRevenue / arr[0].totalRevenue) * 100) : 0
    }));

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">
            — Store Performance
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live insights from your store's database.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-2"
        >
          <button 
            onClick={() => { fetchAnalyticsData(); refreshSite(); }}
            className="rounded-xl glass px-4 py-2 text-xs font-bold border border-white/40 text-cocoa/70 hover:text-cocoa flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, change, trend, sub, Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group rounded-2xl glass shadow-sm p-5 border border-white/40 hover:-translate-y-0.5 hover:shadow-md transition-all"
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
              <div className="text-2xl font-display font-bold text-cocoa">{loading ? "..." : value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">
                {label}
              </div>
              <div className="text-[10px] text-cocoa/40 mt-1">{sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Bar Chart + Category Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-2xl glass shadow-sm border border-white/40 overflow-hidden"
        >
          <div className="p-6 border-b border-cocoa/5 flex items-center justify-between bg-white/20">
            <div>
              <h2 className="font-display text-lg font-bold">Revenue by Day</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Total fulfilled revenue grouped by day of week
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-cocoa/30" />
          </div>
          <div className="p-6">
            <div className="flex items-end gap-3 h-52">
              {weeklyRevenue.map((d, i) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-cocoa/0 group-hover:text-cocoa/60 transition-colors">
                    ₵{d.revenue.toLocaleString()}
                  </div>
                  <div
                    className="w-full rounded-t-xl bg-cocoa/10 group-hover:bg-cocoa transition-colors relative overflow-hidden"
                    style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 5)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-cocoa/80 to-coffee/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cocoa/50">
                    {d.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl glass shadow-sm border border-white/40 overflow-hidden"
        >
          <div className="p-6 border-b border-cocoa/5 bg-white/20">
            <h2 className="font-display text-lg font-bold">Sales by Category</h2>
            <p className="text-xs text-muted-foreground mt-1">Revenue share per category (Live)</p>
          </div>
          <div className="p-6 space-y-5">
            {categoryBreakdown.length > 0 ? categoryBreakdown.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-cocoa">{cat.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-cocoa">{cat.pct}%</span>
                    <span className="text-xs text-cocoa/50 ml-2">{cat.revenue}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-cocoa/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-xs text-muted-foreground">No sales data yet</div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Top Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl glass shadow-sm border border-white/40 overflow-hidden"
        >
          <div className="p-6 border-b border-cocoa/5 flex items-center justify-between bg-white/20">
            <div>
              <h2 className="font-display text-lg font-bold">Top Products</h2>
              <p className="text-xs text-muted-foreground mt-1">Best performing by real revenue</p>
            </div>
          </div>
          <div className="divide-y divide-cocoa/5">
            {topProducts.filter(p => p.sales > 0).length > 0 ? topProducts.filter(p => p.sales > 0).map((p, i) => (
              <div
                key={p.id}
                className="p-4 flex items-center gap-4 hover:bg-white/30 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-cocoa/5 text-coffee flex items-center justify-center text-xs font-bold shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-cocoa truncate">{p.name}</div>
                  <div className="mt-1 h-1.5 bg-cocoa/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ delay: 0.6 + i * 0.05, duration: 0.7 }}
                      className="h-full rounded-full bg-cocoa"
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-cocoa">{p.revenue}</div>
                  <div className="text-[10px] text-cocoa/50">{p.sales} sold</div>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-xs text-muted-foreground">Waiting for your first sale...</div>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl glass shadow-sm border border-white/40 overflow-hidden"
        >
          <div className="p-6 border-b border-cocoa/5 flex items-center justify-between bg-white/20">
            <div>
              <h2 className="font-display text-lg font-bold">Store Activity</h2>
              <p className="text-xs text-muted-foreground mt-1">Recent order statuses</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {orders.slice(0, 5).map((o, i) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-white/30 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${o.status === 'fulfilled' ? 'bg-green-500' : 'bg-gold'}`} />
                  <div className="text-xs font-bold text-cocoa">Order #{o.id.slice(0, 8)}</div>
                </div>
                <div className="text-[10px] text-cocoa/50 font-bold uppercase tracking-widest">{o.status}</div>
                <div className="text-xs font-bold text-cocoa">₵{o.total.toLocaleString()}</div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-10 text-xs text-muted-foreground">No recent activity</div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
