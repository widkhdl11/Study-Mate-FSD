# shared/kernel/

> 모든 도메인이 공유하는 **공통 어휘**.

## 역할

도메인(`entities/`)이 공통으로 의존하는 기반 타입과 유틸을 모은다.

- `Result<T, E>` — 성공/실패를 값으로 표현
- `Brand<K, T>` — branded type 정의 헬퍼
- (선택) `pipe`, `compose` 등 함수 합성 도구

## 들어가는 것

- **모든 도메인이 쓸** 만큼 일반적인 타입
- 도메인 의미가 없는 추상 (Result, Id, Option 등)

## 들어가지 않는 것

- 특정 도메인 타입 (`Post`, `Study` 등) → `entities/`로
- React/Next.js에 의존하는 코드 → `shared/lib/` 또는 `shared/hooks/`
- Supabase에 의존하는 코드 → `shared/api/supabase/`

## 의존성 규칙

- 다른 어떤 것도 import 하지 않는다 (가장 기초).
- 모든 레이어가 import 한다.
- 그래서 **가장 신중하게 바꿔야 한다**.

## 파일 목록 (예정)

```
kernel/
  Result.ts   ← ok/err + 헬퍼
  Id.ts       ← branded id 유틸
  types.ts    ← ActionResponse 등 (현 types/actionType.ts 이동)
```
