import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const PROJECT_ROOT = import.meta.dirname;

export default defineConfig({
  // Force hash routing for file:// protocol compatibility
  define: {
    "import.meta.env.VITE_HASH_ROUTING": JSON.stringify("true"),
  },

  plugins: [
    react(),
    tailwindcss(),
    // viteSingleFile must be last — it post-processes the built HTML
    viteSingleFile(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
      "@assets": path.resolve(PROJECT_ROOT, "attached_assets"),
    },
  },

  envDir: PROJECT_ROOT,
  root: path.resolve(PROJECT_ROOT, "client"),
  // Don't copy public/ files — they'd create extra files alongside the single HTML
  publicDir: false,

  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist/singlefile"),
    emptyOutDir: true,
    // Inline all assets (JS, CSS, fonts) — remote URLs in src/href are unaffected
    assetsInlineLimit: 100 * 1024 * 1024, // 100 MB
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(PROJECT_ROOT, "client", "singlefile.html"),
    },
  },
});
