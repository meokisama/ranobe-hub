import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
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
    },
  },
);
