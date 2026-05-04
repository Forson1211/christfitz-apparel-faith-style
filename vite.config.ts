import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — smallest possible critical chunk
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          // Radix UI primitives (many small packages, bundle together)
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Supabase client
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }
          // Charts (recharts + d3 deps) — heavy, rarely changes
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/victory-")) {
            return "vendor-charts";
          }
          // Framer Motion — animation library
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-motion";
          }
          // TanStack Router + Query
          if (id.includes("node_modules/@tanstack/")) {
            return "vendor-tanstack";
          }
          // Lucide icons — large icon set
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // Everything else in node_modules goes to a shared vendor chunk
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
});
