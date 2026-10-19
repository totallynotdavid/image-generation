import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "node",
    dts: true,
    clean: true,
    publint: true,
    attw: { profile: "esm-only" },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "junit.xml" },
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      reporter: ["text", "lcov"],
    },
  },
  fmt: {
    printWidth: 80,
    proseWrap: "always",
    ignorePatterns: ["dist/**", "coverage/**", "example/output/**", "bun.lock"],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "vitest"],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
    },
    options: { typeAware: true },
    ignorePatterns: ["dist/**", "coverage/**"],
  },
});
