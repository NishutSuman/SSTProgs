import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Live sync / write-back / n8n triggers go through the thin Node server.
      "/api": "http://localhost:8787",
    },
  },
});
