import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Bỏ qua các thư mục không phải mã nguồn TS của backend
  {
    ignores: ["node_modules/", "dist/", "reader/", "uploads/", "scripts/", "eslint.config.mjs"],
  },

  // Rule cơ bản của ESLint + rule type-aware của typescript-eslint
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      // Lấy thông tin kiểu từ tsconfig để bật các rule cần type-checker
      // (no-floating-promises, no-misused-promises, ...)
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Biến chưa dùng: cho phép prefix _ (vd _req, _next trong middleware Express)
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // `setImmediate(() => asyncFn())` là fire-and-forget cố ý (các hàm này tự
      // try/catch bên trong). Chỉ kiểm tra misuse ở vị trí quan trọng, bỏ void-return.
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],

      // Nhóm no-unsafe-*: phát sinh dày đặc do `req.body`/`req.query` là `any` —
      // vốn cố hữu của Express, giá trị cảnh báo thấp. Tắt để giữ tín hiệu lint sạch.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
);
