import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends("eslint:recommended"),
  {
    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 2021,
      sourceType: "module"
    },

    rules: {
      "no-console": "warn",
      "no-extra-semi": "error",
      quotes: ["error", "double"],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],

      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_"
        }
      ],

      strict: ["error", "global"],
      "prefer-const": "error",
      "no-var": "error",

      "arrow-spacing": [
        "error",
        {
          before: true,
          after: true
        }
      ],

      "object-curly-spacing": ["error", "always"],
      "comma-dangle": ["error", "never"],
      indent: ["error", 2],
      "no-trailing-spaces": "error",
      "space-before-blocks": ["error", "always"],

      "keyword-spacing": [
        "error",
        {
          before: true,
          after: true
        }
      ]
    }
  }
];
