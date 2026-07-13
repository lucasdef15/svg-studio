import js from "@eslint/js";
import json from "@eslint/json";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";
import importX from "eslint-plugin-import-x";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
    "*.config.js",
    "*.config.ts",
  ]),

  js.configs.recommended,

  ...tseslint.configs.recommended,

  react.configs.flat.recommended,

  reactHooks.configs.flat.recommended,

  reactRefresh.configs.vite,

  ...tailwind.configs["flat/recommended"],

  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  importX.flatConfigs.recommended,

  perfectionist.configs["recommended-natural"],

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    plugins: {
      "unused-imports": unusedImports,
    },

    rules: {
      /*
       * React
       */

      "react/react-in-jsx-scope": "off",

      /*
       * React Refresh
       */

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      /*
       * Imports
       */

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

      /*
       * import-x
       */

      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/no-duplicates": "error",

      /*
       * Perfectionist
       */

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

      /*
       * Tailwind
       */

      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off",
    },
  },

  {
    files: ["**/*.json"],

    plugins: {
      json,
    },

    language: "json/json",

    extends: ["json/recommended"],
  },
]);
