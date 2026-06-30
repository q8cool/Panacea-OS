import { defineConfig } from "vitest/config";

export default defineConfig({
  appType: "spa",
  server: {
    port: 5174,
    strictPort: false
  },
  preview: {
    port: 4174,
    strictPort: false
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: []
  }
});
