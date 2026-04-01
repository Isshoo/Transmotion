import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "public/**",
  ]),

  {
    rules: {
      // Hindari console.log tertinggal di production
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Hindari variabel tidak terpakai
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Hindari penggunaan variabel atau fungsi atau hal yang tidak di defined
      "no-undef": "error",

      // Hindari penggunaan useEffect tanpa dependency array
      "react-hooks/exhaustive-deps": "warn",

      // Next.js — pakai next/link bukan <a> biasa
      "@next/next/no-html-link-for-pages": "error",

      // Next.js - pakai next/image bukan <img> biasa
      "@next/next/no-img-element": "error",

      // React — tidak perlu import React di setiap file (Next.js sudah handle)
      "react/react-in-jsx-scope": "off",

      // Konsistensi — gunakan === bukan ==
      eqeqeq: ["error", "always"],

      // Hindari var, pakai const/let
      "no-var": "error",

      // Prefer const kalau variable tidak pernah di-reassign
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
