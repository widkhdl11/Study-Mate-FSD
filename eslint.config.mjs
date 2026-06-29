import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/entities/*/**"],
              message:
                "entities는 Public API(@/entities/<slice>)로만 import 하세요. deep import 금지.",
            },
          ],
        },
      ],
    },
  },
  // 슬라이스 *내부*는 부품 직접 사용 허용 (Repository/policy가 fromRow·매퍼·VO 사용).
  {
    files: ["entities/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  reactHooks.configs.flat.recommended,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn', // 또는 'error'
    },
  },
]);

export default eslintConfig;
