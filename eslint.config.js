import { defineConfig, globalIgnores } from "eslint/config";

import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

import importX from "eslint-plugin-import-x";
import perfectionist from "eslint-plugin-perfectionist";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "node_modules",
    ".vite",
    ".turbo",
    "*.config.js",
    "*.config.ts",
  ]),

  // ============================================================================
  // JavaScript
  // ============================================================================

  js.configs.recommended,

  // ============================================================================
  // TypeScript
  // ============================================================================

  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // ============================================================================
  // React
  // ============================================================================

  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  // ============================================================================
  // Imports
  // ============================================================================

  importX.flatConfigs.recommended,

  // ============================================================================
  // Organização
  // ============================================================================

  perfectionist.configs["recommended-natural"],

  // ============================================================================
  // Prettier
  // ============================================================================

  prettier,

  // ============================================================================
  // Projeto
  // ============================================================================

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      "unused-imports": unusedImports,
    },

    rules: {
      // ==========================================================================
      // React Refresh
      // ==========================================================================

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      // ==========================================================================
      // Unused Imports
      // ==========================================================================

      "unused-imports/no-unused-imports": "error",

      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // ==========================================================================
      // Import-X
      // ==========================================================================

      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/no-duplicates": "error",

      // ==========================================================================
      // Perfectionist
      // ==========================================================================

      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
        },
      ],

      "perfectionist/sort-named-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
        },
      ],

      "perfectionist/sort-objects": [
        "warn",
        {
          type: "natural",
          order: "asc",
        },
      ],

      "perfectionist/sort-jsx-props": [
        "warn",
        {
          type: "natural",
          order: "asc",
        },
      ],

      "perfectionist/sort-interfaces": "warn",
      "perfectionist/sort-union-types": "warn",
    },
  },
]);
