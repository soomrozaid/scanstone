import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    env: {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      APP_URL: "http://localhost:3000",
      GUEST_COOKIE_SECRET: "test-guest-cookie-secret-32-chars-min",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "src/test/server-only-stub.ts"),
    },
  },
});
