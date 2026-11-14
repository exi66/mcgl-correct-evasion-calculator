import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  prettier,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      // shadcn-vue генерирует однословные имена компонентов (Button, Label, ...).
      "vue/multi-word-component-names": "off",
    },
  },
  {
    // Сгенерировано shadcn-vue, не правим руками.
    files: ["src/components/ui/**"],
    rules: { "vue/require-default-prop": "off" },
  },
  {
    files: ["*.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
