import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", "playwright-report"] },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React-specific rules
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // React Refresh (Vite HMR)
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Relax rules for test files
  {
    files: ["src/test/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  {
    files: ["src/router.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
