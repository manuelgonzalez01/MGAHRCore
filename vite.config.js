import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve("src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("scheduler")) {
              return "react-vendor";
            }

            if (id.includes("react-router")) {
              return "router-vendor";
            }

            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }

            return "vendor";
          }
        },
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
