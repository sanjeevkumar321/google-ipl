import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api-match": {
        target: "https://www.cricbuzz.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-match/, ""),
      },
    },
  },
});
