import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { useSite } from "@/lib/site";
import { LoadingScreen } from "@/components/site/LoadingScreen";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { loading } = useSite();
  const isAuthPage = location.pathname === "/account" && !user;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <LoadingScreen />
      {!isAuthPage && <Navbar />}
      <Outlet />
      {!isAuthPage && <Footer />}
    </div>
  );
}
