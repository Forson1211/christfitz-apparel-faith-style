import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite, productImage } from "@/lib/site";
import { Package, FolderTree, Palette, TrendingUp, Users, DollarSign, MousePointer2, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { products, categories } = useSite();

  const metrics = [
    { label: "Total Revenue", value: "₵42,850", change: "+12.5%", trend: "up", Icon: DollarSign },
    { label: "Site Visits", value: "8,240", change: "+18.2%", trend: "up", Icon: Users },
    { label: "Conversion", value: "3.2%", change: "-2.1%", trend: "down", Icon: TrendingUp },
    { label: "Click Rate", value: "12.4%", change: "+4.3%", trend: "up", Icon: MousePointer2 },
  ];

  const topProducts = products.slice(0, 3).map((p, i) => ({
    ...p,
    sales: [42, 38, 31][i] || 15,
    growth: ["+8.2%", "+5.4%", "+2.1%"][i] || "+1.0%",
  }));

  // Simulating a chart path
  const chartPoints = "0,80 20,60 40,70 60,30 80,45 100,10 120,40 140,25 160,55 180,20 200,50";

  return (
    <div className="max-w-7xl space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coffee font-bold">— Performance Overview</p>
          <h1 className="mt-2 font-display text-5xl">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Detailed analytics and management for your kingdom.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-2"
        >
          <div className="rounded-2xl glass px-4 py-2 text-xs font-bold text-cocoa/60 border border-white/40">Last 30 Days</div>
          <button className="rounded-2xl bg-cocoa text-cream px-4 py-2 text-xs font-bold shadow-soft hover:scale-[1.03] transition">Download Report</button>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, change, trend, Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-[2rem] glass shadow-soft p-6 border border-white/40 transition-all hover:shadow-luxe hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-2xl bg-cocoa/5 flex items-center justify-center text-coffee group-hover:bg-cocoa group-hover:text-cream transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {change}
              </div>
            </div>
            <div className="mt-6">
              <div className="text-3xl font-display font-bold text-cocoa">{value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sales Chart Container */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-[2.5rem] glass shadow-luxe overflow-hidden border border-white/40 flex flex-col"
        >
          <div className="p-8 border-b border-cocoa/5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl">Sales Performance</h2>
              <p className="text-xs text-muted-foreground mt-1">Revenue growth over the past 2 weeks</p>
            </div>
            <select className="bg-transparent text-xs font-bold uppercase tracking-widest text-coffee outline-none cursor-pointer">
              <option>Revenue</option>
              <option>Orders</option>
            </select>
          </div>
          
          <div className="flex-1 p-8 flex flex-col justify-end min-h-[300px] relative">
            {/* Grid lines */}
            <div className="absolute inset-8 flex flex-col justify-between pointer-events-none opacity-20">
              {[1,2,3,4].map(i => <div key={i} className="w-full border-t border-cocoa/20" />)}
            </div>
            
            {/* SVG Chart */}
            <svg className="w-full h-48 overflow-visible" viewBox="0 0 200 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cocoa)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--cocoa)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`M 0,100 L ${chartPoints} L 200,100 Z`} 
                fill="url(#chartGradient)" 
              />
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
            
            <div className="flex justify-between mt-6 text-[10px] font-bold uppercase tracking-widest text-cocoa/30">
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
          className="rounded-[2.5rem] bg-cocoa text-cream shadow-luxe overflow-hidden p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl">Top Sellers</h2>
            <button className="text-gold"><MoreHorizontal className="h-5 w-5" /></button>
          </div>
          
          <div className="space-y-6 flex-1">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden bg-cream/10 border border-white/10 group-hover:scale-105 transition-transform">
                  <img src={productImage(p)} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate group-hover:text-gold transition-colors">{p.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-cream/40 font-medium mt-0.5">{p.sales} Sold this week</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">₵{p.price}</div>
                  <div className="text-[10px] font-bold text-green-400">{p.growth}</div>
                </div>
              </div>
            ))}
          </div>
          
          <Link to="/admin/products" className="mt-10 w-full rounded-2xl bg-cream/10 border border-white/10 text-center py-4 text-xs font-bold uppercase tracking-widest hover:bg-cream/20 transition-all">
            View All Inventory
          </Link>
        </motion.section>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-3xl glass-dark p-8 text-cream relative overflow-hidden group">
          <Palette className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 group-hover:scale-110 transition-transform" />
          <h3 className="font-display text-xl">Brand Identity</h3>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">Customize colors, typography, and logos for the brand.</p>
          <Link to="/admin/colors" className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-gold border-b border-gold pb-1">Edit Palette</Link>
        </section>

        <section className="rounded-3xl glass p-8 text-cocoa relative overflow-hidden group border border-white/40">
          <FolderTree className="absolute -right-4 -bottom-4 h-32 w-32 text-cocoa/5 group-hover:scale-110 transition-transform" />
          <h3 className="font-display text-xl">Store Structure</h3>
          <p className="mt-2 text-sm text-cocoa/60 leading-relaxed">Organize products into categories and manage collections.</p>
          <Link to="/admin/categories" className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-coffee border-b border-coffee pb-1">Manage Links</Link>
        </section>

        <section className="rounded-3xl bg-gold p-8 text-cocoa relative overflow-hidden group">
          <Package className="absolute -right-4 -bottom-4 h-32 w-32 text-cocoa/10 group-hover:scale-110 transition-transform" />
          <h3 className="font-display text-xl">Inventory Hub</h3>
          <p className="mt-2 text-sm text-cocoa/80 leading-relaxed">Add new pieces, update pricing, and check stock levels.</p>
          <Link to="/admin/products" className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-cocoa border-b border-cocoa pb-1">Add Product</Link>
        </section>
      </div>
    </div>
  );
}
