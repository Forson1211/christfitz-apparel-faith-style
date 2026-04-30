import { createFileRoute } from "@tanstack/react-router";
import { Search, MoreHorizontal, UserPlus, Mail, ShieldAlert, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  updated_at: string;
  role: "admin" | "user";
};

function UsersAdmin() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch all profiles
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, updated_at")
      .order("updated_at", { ascending: false });

    if (pErr) {
      toast.error("Failed to load users: " + pErr.message);
      setLoading(false);
      return;
    }

    // Fetch admin roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const adminIds = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));

    setUsers(
      (profiles ?? []).map((p: any) => ({
        ...p,
        role: adminIds.has(p.id) ? "admin" : "user",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "Today";
    if (d === 1) return "Yesterday";
    return `${d} days ago`;
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">— User Management</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage customer accounts and roles from Supabase.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
          <button onClick={fetchUsers} className="rounded-xl glass px-4 py-2 text-xs font-bold border border-white/40 text-cocoa/70 hover:text-cocoa flex items-center gap-2 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length },
          { label: "Customers", value: users.filter((u) => u.role === "user").length },
        ].map(({ label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl glass shadow-sm border border-white/40 p-5 text-center">
            <div className="text-3xl font-display font-bold text-cocoa">{loading ? "—" : value}</div>
            <div className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl glass shadow-sm overflow-hidden border border-white/40">
        <div className="p-4 border-b border-cocoa/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cocoa/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/50 border border-cocoa/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-cocoa/30 focus:bg-white transition-all placeholder:text-cocoa/40"
            />
          </div>
          <span className="text-xs text-cocoa/50 shrink-0">{filtered.length} users</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-cocoa/40 gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-cocoa/30 border-t-cocoa animate-spin" />
            <span className="text-sm">Loading users...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-cocoa/40 text-sm">
            {search ? "No users match your search." : "No users found. Users appear here after they sign up."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-cocoa/5 text-xs uppercase tracking-widest text-cocoa/40 bg-white/20">
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Phone</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Last Active</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/5">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-cocoa/5 text-coffee flex items-center justify-center font-bold text-sm shrink-0">
                          {(user.full_name ?? user.email ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-cocoa">{user.full_name ?? <span className="text-cocoa/40 italic">No name</span>}</div>
                          <div className="text-xs text-cocoa/60 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" /> {user.email ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-cocoa/70">{user.phone ?? "—"}</td>
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-yellow-800 flex items-center gap-1 w-fit">
                          <ShieldAlert className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cocoa/5 text-cocoa/60">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-cocoa/60 text-xs">{timeAgo(user.updated_at)}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-cocoa/40 hover:text-cocoa hover:bg-cocoa/5 rounded-lg transition">
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
    </div>
  );
}
