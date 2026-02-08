import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "ui",
  base: "./",
  build: {
    outDir: "../ui-dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@core": resolve(__dirname, "src"),
    },
  },
});
