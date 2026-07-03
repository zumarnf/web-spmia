import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/components/**",
        "src/types/**",
        "src/**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      // Match the tsconfig "@/*" path alias.
      "@": resolve(__dirname, "src"),
      // "server-only" is a build-time guard with no runtime; stub it for tests.
      "server-only": resolve(__dirname, "vitest.server-only-stub.ts"),
    },
  },
});
