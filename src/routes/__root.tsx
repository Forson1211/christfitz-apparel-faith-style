import { useEffect } from "react";
import { Outlet, Link, createRootRoute, useLocation } from "@tanstack/react-router";
import { CartProvider } from "@/lib/cart";
import { SiteProvider } from "@/lib/site";
import { AuthProvider, useAuth } from "@/lib/auth";
import { CartDrawer } from "@/components/site/CartDrawer";
import { ScrollButton } from "@/components/site/ScrollButton";
import { CursorGlow } from "@/components/site/CursorGlow";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:scale-105"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <SiteProvider>
        <CartProvider>
          <AppContent />
          <Toaster />
        </CartProvider>
      </SiteProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  // Force scroll to top on refresh and every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const isAdmin = path.startsWith("/admin");
  const isAuth = (path === "/account" && !user) || path === "/admin/login";
  const hideExtras = isAdmin || isAuth;

  return (
    <>
      {!hideExtras && <CursorGlow />}
      <Outlet />
      {!hideExtras && <CartDrawer />}
      {!hideExtras && <ScrollButton />}
    </>
  );
}
