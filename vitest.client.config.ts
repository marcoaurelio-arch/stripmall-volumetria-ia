import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname),
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./client/src/__tests__/setup.ts"],
    include: ["client/src/__tests__/**/*.test.tsx", "client/src/__tests__/**/*.test.ts"],
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
    },
  },
});
