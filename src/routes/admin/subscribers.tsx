import { createFileRoute } from "@tanstack/react-router";
import { Search, Mail, RefreshCw, Download, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscribers")({
  component: SubscribersAdmin,
});

type Subscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  created_at: string;
};

function SubscribersAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load subscribers: " + error.message);
    } else {
      setSubscribers((data as Subscriber[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;

    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete subscriber");
    } else {
      toast.success("Subscriber removed");
      setSubscribers(subscribers.filter((s) => s.id !== id));
    }
  };

  const downloadCSV = () => {
    const headers = ["Email", "Status", "Joined At"];
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      new Date(s.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">
            — Growth & Marketing
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold">Subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your newsletter audience and export email lists.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-2"
        >
          <button
            onClick={downloadCSV}
            disabled={subscribers.length === 0}
            className="rounded-xl bg-cocoa text-cream px-4 py-2 text-xs font-bold flex items-center gap-2 transition hover:bg-cocoa/90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={fetchSubscribers}
            className="rounded-xl glass px-4 py-2 text-xs font-bold border border-white/40 text-cocoa/70 hover:text-cocoa flex items-center gap-2 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Subscribers", value: subscribers.length },
          { label: "Active", value: subscribers.filter((s) => s.status === "active").length },
          { label: "New This Week", value: subscribers.filter(s => {
              const date = new Date(s.created_at);
              const now = new Date();
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return date > weekAgo;
            }).length 
          },
        ].map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl glass shadow-sm border border-white/40 p-5 text-center"
          >
            <div className="text-3xl font-display font-bold text-cocoa">
              {loading ? "—" : value}
            </div>
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
        <div className="p-4 border-b border-cocoa/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cocoa/40" />
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/50 border border-cocoa/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-cocoa/30 focus:bg-white transition-all placeholder:text-cocoa/40"
            />
          </div>
          <span className="text-xs text-cocoa/50 shrink-0">{filtered.length} subscribers found</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-cocoa/40 gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-cocoa/30 border-t-cocoa animate-spin" />
            <span className="text-sm">Syncing with database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-cocoa/40 text-sm">
            {search
              ? "No subscribers match your search."
              : "Your subscriber list is currently empty."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-cocoa/5 text-xs uppercase tracking-widest text-cocoa/40 bg-white/20">
                  <th className="px-6 py-4 font-bold">Email Address</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Joined Date</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/5">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-cocoa/5 text-coffee flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-cocoa">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === "active" ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-700 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-700 flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" /> Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-cocoa/60 text-xs">
                      {new Date(sub.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-cocoa/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Remove Subscriber"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
