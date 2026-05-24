# shared/

> **도메인을 모르는 공용 자원**의 집합. 가장 아래 레이어.

## 역할

이 프로젝트의 어떤 도메인(Study, Post, User ...)에도 종속되지 않는 코드를 모은다.

- 디자인 시스템 (shadcn 컴포넌트)
- Supabase 클라이언트
- 포맷팅, 날짜, 클래스명 합치기 같은 순수 유틸
- DDD shared kernel (`Result`, `Id`, branded type 유틸)
- 환경/상수
- UI 유틸 훅 (`useDebounce`, `useToggle`)

## 의존성 규칙

- `shared/`는 **다른 어떤 레이어도 import하지 않는다**.
- 다른 모든 레이어가 `shared/`를 import할 수 있다.
- 그래서 가장 안정적이어야 하고, 변경에 민감해야 한다.

## 하위 폴더 (확정/예정)

```
shared/
  ui/           ← shadcn 컴포넌트 (현 components/ui에서 이동 예정)
  api/
    supabase/   ← createClient, queryKeys, RPC 헬퍼
  lib/          ← format, date, cn, parseFormData, validation
  kernel/       ← Result, Id, branded type — FP-DDD 공통 어휘
  config/       ← env, 상수 (region map, category map)
  hooks/        ← 도메인 무관 UI 훅
```

## 들어가지 않는 것

- 특정 도메인 타입 (`Post`, `Study` 등) → `entities/`로
- 비즈니스 로직 → `entities/` 또는 `features/`로
- "임시로 둘 데 없어서" 둔 것 → 도메인 정해서 그쪽으로

## 첫 작업

`shared/kernel/Result.ts` 부터.
이 프로젝트의 모든 도메인 함수가 의존할 `Result<T, E>` 타입을 정의한다.
