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
    ignorePatterns: ["dist/**", "coverage/**", "**/*.md", "example/output/**"],
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    plugins: ["typescript", "unicorn", "oxc", "vitest"],
    ignorePatterns: ["dist/**", "coverage/**"],
  },
});
