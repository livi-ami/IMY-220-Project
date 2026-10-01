import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // polling makes hot reload work inside Docker on Windows/macOS
    watch: { usePolling: true },
  },
});
