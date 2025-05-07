import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    include: [
      "@partisiablockchain/abi-client",
      "@partisiablockchain/blockchain-api-transaction-client",
      "@partisiablockchain/zk-client",
      "elliptic",
      "hash.js",
    ],
    esbuildOptions: {
      target: "esnext",
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  build: {
    commonjsOptions: {
      include: [/@partisiablockchain\/.*/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
});
