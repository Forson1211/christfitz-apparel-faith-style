import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = location.pathname === "/account" && !user;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {!isAuthPage && <Navbar />}
      <Outlet />
      {!isAuthPage && <Footer />}
    </div>
  );
}
