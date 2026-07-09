import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.js"],
    testTimeout: 15000, // in-memory Mongo + bcrypt hashing can be slow on first run
    hookTimeout: 30000,
  },
});
