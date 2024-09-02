import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Buffer } from "buffer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  define: {
    global: {},
    Buffer: `window.Buffer || ${Buffer.toString()}`,
  },
});
