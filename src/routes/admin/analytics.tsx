import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  MousePointer2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

function Analytics() {
  const { products, categories } = useSite();

  const kpis = [
    {
      label: "Total Revenue",
      value: "₵42,850",
      change: "+12.5%",
      trend: "up",
      sub: "vs last month",
      Icon: TrendingUp,
    },
    {
      label: "Total Orders",
      value: "318",
      change: "+8.3%",
      trend: "up",
      sub: "vs last month",
      Icon: ShoppingCart,
    },
    {
      label: "Unique Visitors",
      value: "8,240",
      change: "+18.2%",
      trend: "up",
      sub: "vs last month",
      Icon: Users,
    },
    {
      label: "Avg. Order Value",
      value: "₵134.75",
      change: "-2.1%",
      trend: "down",
      sub: "vs last month",
      Icon: MousePointer2,
    },
  ];

  const weeklyRevenue = [
    { day: "Mon", revenue: 3200, orders: 24 },
    { day: "Tue", revenue: 4100, orders: 30 },
    { day: "Wed", revenue: 2800, orders: 21 },
    { day: "Thu", revenue: 5200, orders: 38 },
    { day: "Fri", revenue: 6800, orders: 51 },
    { day: "Sat", revenue: 7900, orders: 59 },
    { day: "Sun", revenue: 5100, orders: 38 },
  ];

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.revenue));

  const categoryBreakdown = [
    { name: "Hoodies", pct: 48, revenue: "₵20,568", color: "bg-cocoa" },
    { name: "T-Shirts", pct: 31, revenue: "₵13,283", color: "bg-coffee" },
    { name: "Accessories", pct: 21, revenue: "₵8,998", color: "bg-gold" },
  ];

  const topProducts = products.slice(0, 5).map((p, i) => ({
    ...p,
    sales: [128, 96, 74, 61, 48][i] ?? 20,
    revenue: `₵${(p.price * ([128, 96, 74, 61, 48][i] ?? 20)).toLocaleString()}`,
    pct: [100, 75, 58, 48, 38][i] ?? 30,
  }));

  const trafficSources = [
    { source: "Organic Search", sessions: 3240, pct: 39 },
    { source: "Direct", sessions: 2180, pct: 26 },
    { source: "Social Media", sessions: 1650, pct: 20 },
    { source: "Referral", sessions: 820, pct: 10 },
    { source: "Email", sessions: 350, pct: 5 },
  ];

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
            Deep insights into your store's performance and growth.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-2"
        >
          {["7D", "30D", "90D", "1Y"].map((p, i) => (
            <button
              key={p}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition border ${i === 1 ? "bg-cocoa text-cream border-cocoa" : "glass border-white/40 text-cocoa/70 hover:text-cocoa"}`}
            >
              {p}
            </button>
          ))}
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
              <div className="text-2xl font-display font-bold text-cocoa">{value}</div>
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
              <h2 className="font-display text-lg font-bold">Weekly Revenue</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Daily revenue for the past 7 days
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-cocoa/30" />
          </div>
          <div className="p-6">
            <div className="flex items-end gap-3 h-52">
              {weeklyRevenue.map((d, i) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-cocoa/0 group-hover:text-cocoa/60 transition-colors">
                    ₵{(d.revenue / 1000).toFixed(1)}k
                  </div>
                  <div
                    className="w-full rounded-t-xl bg-cocoa/10 group-hover:bg-cocoa transition-colors relative overflow-hidden"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
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
            <p className="text-xs text-muted-foreground mt-1">Revenue share per category</p>
          </div>
          <div className="p-6 space-y-5">
            {categoryBreakdown.map((cat) => (
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
            ))}
          </div>
        </motion.section>
      </div>

      {/* Top Products + Traffic Sources */}
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
              <p className="text-xs text-muted-foreground mt-1">Best performing by revenue</p>
            </div>
          </div>
          <div className="divide-y divide-cocoa/5">
            {topProducts.map((p, i) => (
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
            ))}
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
              <h2 className="font-display text-lg font-bold">Traffic Sources</h2>
              <p className="text-xs text-muted-foreground mt-1">Where your visitors come from</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {trafficSources.map((s, i) => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-cocoa">{s.source}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cocoa">{s.pct}%</span>
                    <span className="text-[10px] text-cocoa/50 ml-2">
                      {s.sessions.toLocaleString()} sessions
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-cocoa/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ delay: 0.65 + i * 0.05, duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: `hsl(${20 + i * 12}, 40%, ${30 + i * 10}%)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
