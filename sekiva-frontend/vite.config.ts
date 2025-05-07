import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Polyfills to include - including all crypto-related ones
      include: [
        "buffer",
        "process",
        "crypto",
        "stream",
        "path",
        "assert",
        "util",
        "events",
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
    },
  },
});
