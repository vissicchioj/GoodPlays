import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Server actions and helpers run in Node, not a browser.
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Reset every mock's call history and return values before each test, so
    // one test can't leak state into the next.
    mockReset: true,
  },
});
