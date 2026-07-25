import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore non-TS-source directories
  {
    ignores: ["node_modules/", "dist/", "reader/", "uploads/", "scripts/", "eslint.config.mjs"],
  },

  // Base ESLint rules + typescript-eslint type-aware rules
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      // Pull type info from tsconfig to enable rules that need the type-checker
      // (no-floating-promises, no-misused-promises, ...)
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Unused vars: allow _ prefix (e.g. _req, _next in Express middleware)
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // `setImmediate(() => asyncFn())` is intentional fire-and-forget (these fns
      // try/catch internally). Only check misuse where it matters; skip void-return.
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],

      // no-unsafe-* group: fires constantly because `req.body`/`req.query` are `any` —
      // inherent to Express and low-signal. Disabled to keep lint output clean.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
);
