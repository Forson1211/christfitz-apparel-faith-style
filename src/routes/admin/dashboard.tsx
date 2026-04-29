import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { Package, FolderTree, Type, Palette } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { products, categories, navLinks } = useSite();

  const stats = [
    { label: "Products", value: products.length, to: "/admin/products", Icon: Package },
    { label: "Categories", value: categories.length, to: "/admin/categories", Icon: FolderTree },
    { label: "Nav Links", value: navLinks.length, to: "/admin/navigation", Icon: Type },
    { label: "Theme Colors", value: 4, to: "/admin/colors", Icon: Palette },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Welcome</p>
        <h1 className="mt-2 font-display text-4xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your site content, products, and brand from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, to, Icon }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-3xl glass shadow-soft p-5 transition hover:-translate-y-1 hover:shadow-luxe"
          >
            <Icon className="h-5 w-5 text-coffee" />
            <div className="mt-4 font-display text-3xl">{value}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl bg-cocoa text-cream p-7">
        <h2 className="font-display text-2xl">Quick actions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/admin/products" className="rounded-full bg-cream px-5 py-2.5 text-sm text-cocoa hover:scale-[1.03] transition">+ Add product</Link>
          <Link to="/admin/content" className="rounded-full glass-dark px-5 py-2.5 text-sm hover:bg-cream/10 transition">Edit homepage</Link>
          <Link to="/admin/colors" className="rounded-full glass-dark px-5 py-2.5 text-sm hover:bg-cream/10 transition">Change colors</Link>
        </div>
      </div>
    </div>
  );
}
