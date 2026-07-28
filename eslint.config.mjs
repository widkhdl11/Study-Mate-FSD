import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  // Next.js 권장 규칙셋 (성능/웹바이탈 + TypeScript)
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // shadcn: 서드파티 생성 컴포넌트 — lint 제외(직접 수정 대상 아님)
    "shared/shadcn/**",
  ]),

  // entities/widgets/features는 Public API(@/<layer>/<slice>)로만 import — 내부 경로 deep import 금지
  // (= 각 슬라이스가 index.ts로 공개면만 노출하게 강제. 딥임포트하면 여기서 걸림)
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              // entities/widgets = 1-level 슬라이스(@/entities/<slice>), features = 2-level(@/features/<도메인>/<슬라이스>)
              group: ["@/entities/*/**", "@/widgets/*/**", "@/features/*/*/**"],
              message:
                "슬라이스는 Public API(@/<layer>/<slice>)로만 import 하세요. 내부 경로 deep import 금지.",
            },
          ],
        },
      ],
    },
  },
  // entities 내부 파일은 부품 직접 사용 허용 (Repository/policy가 fromRow·매퍼·VO, 엔티티간 조합 등).
  // widgets/features는 자기 내부를 상대경로로 쓰므로 off 불필요 (딥임포트 alias는 잡히는 게 맞음).
  {
    files: ["entities/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },

  // ── FSD 레이어 경계 (eslint-plugin-boundaries) ──
  // 설치: npm i -D 시 --legacy-peer-deps 사용.
  //   이유: eslint-import-resolver-typescript가 끌어오는 eslint-plugin-import-x가
  //   @typescript-eslint/utils@^8.56을 요구하는데, eslint-config-next@16이 8.46.3으로 고정 → peer 충돌.
  //   해당 peer는 peerOptional이고 lint는 정상 동작하므로 충돌을 덮음. (config-next 상향 시 플래그 제거 가능)
  // app > widgets > features > entities > shared. 상위→하위만, 같은레이어 금지.
  // entities→entities는 허용(DDD read-model 조합, public API는 위 규칙이 별도 강제).
  // actions/components/hooks = legacy 버킷: app/widgets/features가 당분간 쓸 수 있음(마이그레이션 대상).
  {
    files: [
      "app/**/*.{ts,tsx}",
      "widgets/**/*.{ts,tsx}",
      "features/**/*.{ts,tsx}",
      "entities/**/*.{ts,tsx}",
      "shared/**/*.{ts,tsx}",
      "actions/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "hooks/**/*.{ts,tsx}",
    ],
    plugins: { boundaries },
    settings: {
      // 경계 검사 대상 경로 (여기 밖은 미검사)
      "boundaries/include": [
        "app/**",
        "widgets/**",
        "features/**",
        "entities/**",
        "shared/**",
        "actions/**",
        "components/**",
        "hooks/**",
      ],
      // 각 폴더 → 레이어 타입 매핑 (slice = 하위 폴더명 캡처)
      "boundaries/elements": [
        { type: "app", pattern: "app", mode: "folder" },
        { type: "widgets", pattern: "widgets/*", mode: "folder", capture: ["slice"] },
        { type: "features", pattern: "features/*", mode: "folder", capture: ["slice"] },
        { type: "entities", pattern: "entities/*", mode: "folder", capture: ["slice"] },
        { type: "shared", pattern: "shared", mode: "folder" },
        { type: "legacy", pattern: ["actions", "components", "hooks"], mode: "folder" },
      ],
      // @/ 별칭 해석 (tsconfig paths 기반) — 없으면 import 경로 매칭 실패
      "import/resolver": { typescript: { alwaysTryTypes: true } },
    },
    rules: {
      // default: disallow → 아래 policies에 허용된 방향만 통과 (상위→하위)
      "boundaries/dependencies": [
        "warn",
        {
          default: "disallow",
          policies: [
            { from: { element: { types: "app" } }, allow: { to: { element: { types: { anyOf: ["app", "widgets", "features", "entities", "shared", "legacy"] } } } } },
            { from: { element: { types: "widgets" } }, allow: { to: { element: { types: { anyOf: ["features", "entities", "shared", "legacy"] } } } } },
            { from: { element: { types: "features" } }, allow: { to: { element: { types: { anyOf: ["entities", "shared", "legacy"] } } } } },
            { from: { element: { types: "entities" } }, allow: { to: { element: { types: { anyOf: ["entities", "shared"] } } } } },
            { from: { element: { types: "shared" } }, allow: { to: { element: { types: "shared" } } } },
            { from: { element: { types: "legacy" } }, allow: { to: { element: { types: { anyOf: ["app", "widgets", "features", "entities", "shared", "legacy"] } } } } },
          ],
        },
      ],
    },
  },

  // no-unused-vars: rest로 키 제외(...rest) 패턴 허용 + _접두 의도적 미사용 허용
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // React 훅 규칙 (rules-of-hooks, exhaustive-deps, set-state-in-effect 등)
  reactHooks.configs.flat.recommended,
  {
    rules: {
      // 기본값은 error → warn으로 낮춤 (제거 시 error로 복귀)
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // 테스트 파일은 아키텍처 import 규칙에서 제외 (테스트는 크로스-레이어 픽스처 import 허용)
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
      "boundaries/dependencies": "off",
    },
  },
]);

export default eslintConfig;
