import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use environment variable for base path (GitHub Pages) or default to './' for local dev
  base: process.env.VITE_BASE_PATH || "./",
  build: {
    outDir: "dist",
  },
});
