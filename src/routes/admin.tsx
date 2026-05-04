import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Palette,
  Image as ImageIcon,
  Type,
  Navigation as NavIcon,
  LogOut,
  Home,
  ShoppingCart,
  Users,
  BarChart3,
  Tag,
  MessageSquare,
} from "lucide-react";
import { useSite, resolveImage } from "@/lib/site";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const items = [
  { to: "/admin/dashboard", label: "Overview", Icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: FolderTree },
  { to: "/admin/users", label: "Customers", Icon: Users },
  { to: "/admin/discounts", label: "Discounts", Icon: Tag },
  { to: "/admin/content", label: "Content", Icon: Type },
  { to: "/admin/testimonials", label: "Testimonials", Icon: MessageSquare },
  { to: "/admin/colors", label: "Colors & Logo", Icon: Palette },
  { to: "/admin/navigation", label: "Navigation", Icon: NavIcon },
  { to: "/admin/media", label: "Media", Icon: ImageIcon },
];

function AdminLayout() {
  const { user, isAdmin, loading, roleLoading, roleSettled, signOut, bootstrapAdmin } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (path !== "/admin/login") navigate({ to: "/admin/login" });
    }
  }, [user, loading, path, navigate]);

  if (path === "/admin/login") return <Outlet />;

  // Show spinner while session is loading, or while role check is in progress (if we don't already have a cached answer)
  if (loading || (roleLoading && !roleSettled)) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-cocoa gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-cocoa border-t-transparent animate-spin" />
        <span className="text-sm text-cocoa/60">Verifying access...</span>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-cocoa px-5">
        <div className="w-full max-w-sm text-center rounded-[2.5rem] glass shadow-luxe p-10 border border-white/40">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">✕</span>
          </div>
          <h1 className="font-display text-3xl">Access Denied</h1>
          <p className="mt-3 text-sm text-cocoa/60 leading-relaxed">
            Your account does not have admin permissions. If you are the first user, try to
            bootstrap admin access.
          </p>
          <div className="mt-8 space-y-3">
            <button
              onClick={() =>
                bootstrapAdmin().then((success) => {
                  if (success) {
                    window.location.reload();
                  } else {
                    alert(
                      "Bootstrap failed. An admin might already exist or the system is locked.",
                    );
                  }
                })
              }
              className="w-full rounded-2xl bg-gold text-cocoa px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gold/80 transition-all shadow-soft"
            >
              Try to Bootstrap Admin
            </button>
            <button
              onClick={() => signOut().then(() => navigate({ to: "/admin/login" }))}
              className="w-full rounded-2xl bg-cocoa/5 text-cocoa/60 px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-cocoa/10 transition-all"
            >
              Sign out & try another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const logoUrl = settings.logo?.url && settings.logo.url !== "/logo.png" 
    ? resolveImage(settings.logo.url) 
    : "/favicon.png";

  return (
    <div className="flex min-h-screen bg-cream text-cocoa">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-cocoa/10 bg-cream/60 backdrop-blur-xl">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 px-6 py-8 font-display text-xl"
        >
          <div className="h-10 w-10 shrink-0 overflow-hidden flex items-center justify-center">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-full w-full object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-none">{settings.brand?.name || "ChristFitz"}</span>
            <span className="text-[10px] uppercase tracking-widest text-cocoa/40 mt-1">Admin Panel</span>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {items.map(({ to, label, Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-cocoa text-cream font-medium"
                    : "text-cocoa/70 hover:bg-cocoa/5 hover:text-cocoa"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-cocoa/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-cocoa/70 hover:bg-cocoa/5 hover:text-cocoa"
          >
            <Home className="h-4 w-4" /> Visit site
          </Link>
          <button
            onClick={() => signOut().then(() => navigate({ to: "/admin/login" }))}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-cocoa/70 hover:bg-cocoa/5 hover:text-cocoa"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-cocoa/10 px-5 py-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-display text-lg">
            <div className="h-8 w-8 shrink-0 overflow-hidden flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-full w-full object-contain" 
              />
            </div>
            <span>{settings.brand?.name || "ChristFitz"}</span>
          </Link>
          <button
            onClick={() => signOut().then(() => navigate({ to: "/admin/login" }))}
            className="text-sm text-cocoa/60"
          >
            Sign out
          </button>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto border-b border-cocoa/10 px-3 py-2">
          {items.map(({ to, label, Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs ${active ? "bg-cocoa text-cream" : "text-cocoa/60"}`}
              >
                <Icon className="h-3 w-3" /> {label}
              </Link>
            );
          })}
        </nav>
        <main className="p-5 sm:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
