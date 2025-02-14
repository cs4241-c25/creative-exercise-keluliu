import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Vite's build folder
    emptyOutDir: true,
  },
  server: {
    port: 5173, // React development server
  }
});