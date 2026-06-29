# 학습 로그 — FP-DDD + FSD 도메인 모델링

> 이 문서는 `ARCHITECTURE.md`(청사진)와 별개로 **진행 단계별 학습 내용**과 **결정 사항**을 기록한다.
> 각 단계가 끝나면 패턴/교훈/헷갈렸던 부분을 추가한다.

---

## 전체 학습 로드맵

```
Phase 0: shared/kernel                         ✅ 완료
  - Result<T, E>, Brand<K, T>

Phase 1: VO 첫 사례 (Capacity)                 ✅ 완료
  - Brand + Readonly + smart constructor

Phase 2: 판별 유니온 패턴                       ✅ 완료
  - StudyStatus, ParticipantRole, ParticipantStatus

Phase 3: Brand ID 타입                          ✅ 완료
  - StudyId, ParticipantId, UserId, PostId

Phase 4: Aggregate Root                         ✅ 완료
  - Study, Participant (생성 + 행위)

Phase 5: Repository (boundary)                  🚧 진행 중
  - Sub-1: VO들의 fromString/toString    ✅ 완료
  - Sub-2: Aggregate Root의 fromRow      ✅ 완료
  - Sub-3: Repository 함수 (Supabase 호출) 🚧 진행 중

Phase 6: UseCase + 첫 시나리오                  ⏳ 예정
  - features/participant-accept 등

Phase 7: 점진적 확장
  - 다른 features 점차 추가
  - 필요시 Repository 인터페이스 분리 등
```

---

## Phase 0: `shared/kernel/` ✅

### 만든 것

- `Result.ts` — `Result<T, E>` 판별 유니온 + 헬퍼 (`ok`, `err`, `map`, `andThen`, `andThenAsync`, `mapError`, `unwrapOr`, `all`)
- `Id.ts` — `Brand<K, T>` 헬퍼 타입
- `Result.test.ts` — 단위 테스트 (Vitest)

### 핵심 패턴

#### `Result<T, E>`

```typescript
type Result<T, E> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E }
```

→ `throw` 대신 사용. 에러를 **값**으로 반환해서 타입 시스템에 드러냄.

#### `Brand<K, T>`

```typescript
type Brand<K, T> = K & { readonly __brand: T }
```

→ 같은 모양의 값을 **타입 시스템에서만** 구분. 런타임에는 사라짐 (zero-cost abstraction).

### 결정 사항

- **Brand 스타일 통일**: `Brand<K, T>` 헬퍼 방식 (Style B). `unique symbol` 방식(Style A)은 사용 X.

---

## Phase 1: VO 첫 사례 — `Capacity` ✅

### 만든 것

- `entities/study/model/Capacity.ts`
- `examples/Money.example.ts` (학습용 참고 예시)

### VO의 5가지 핵심 패턴

```
1. 브랜드 타입         → 외부에서 객체 리터럴로 못 만듦
2. 스마트 생성자       → 검증 통과한 인스턴스만 생성됨
3. Result 기반 검증    → throw 대신 Result<T, E>
4. 모듈 함수 묶음      → `Capacity.add(a, b)` 형태
5. 불변(immutable)    → readonly 강제, 변경은 새 객체 반환
```

### 핵심 코드 구조

```typescript
// 한 파일에 모두 들어감
import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";

// 1. 타입 정의
export type Capacity = Brand<Readonly<{ current: number; max: number }>, "Capacity">;

// 2. 에러 판별 유니온
export type CapacityError = ...;

// 3. 스마트 생성자 (export X)
const construct = (current, max): Result<Capacity, CapacityError> => { ... };

// 4. 모듈 함수 (생성/질의/변환)
export const Capacity = { of: construct, isFull, increment, ... };
```

### 함수 카테고리 4가지

| 카테고리        | 의미                 | Capacity 예시                              |
| --------------- | -------------------- | ------------------------------------------ |
| 생성(create)    | 값을 처음 만든다     | `of`, `empty`                              |
| 질의(query)     | 값에서 정보를 꺼낸다 | `isFull`, `isEmpty`, `remaining`, `equals` |
| 변환(transform) | 새 값을 만들어 반환  | `increment`, `decrement`                   |
| 표시(format)    | UI용 문자열 등       | (필요시)                                   |

### 헷갈렸던 부분

#### 에러 케이스 분리: Overflow vs AlreadyFull

같은 "꽉 참" 상태지만 의미가 다름 → **분리**.

| 케이스        | 언제                   | 의미                                    |
| ------------- | ---------------------- | --------------------------------------- |
| `Overflow`    | `of(15, 10)`           | "처음부터 깨진 값" — 데이터 무결성 위반 |
| `AlreadyFull` | `increment(가득 찬 c)` | "정상이지만 자리 없음" — 비즈니스 상황  |

→ UI 메시지/처리 분기가 달라야 하므로 분리.

---

## Phase 2: 판별 유니온 패턴 ✅

### 만든 것

- `entities/study/model/StudyStatus.ts`
- `entities/participant/model/ParticipantRole.ts`
- `entities/participant/model/ParticipantStatus.ts`

### 판별 유니온의 4가지 이유

1. **타입 좁히기(narrowing)** ← 가장 큰 이유
2. **상태마다 다른 데이터를 안전하게 표현**
3. **빠뜨림 방지 (exhaustive check)**
4. **확장 쉬움**

### Brand vs 판별 유니온 결정 기준

|      | Brand                      | 판별 유니온            |
| ---- | -------------------------- | ---------------------- |
| 본질 | 단일 모양 + 검증 도장      | 여러 케이스 중 하나    |
| 예시 | Email, ID, Money, Capacity | 상태, 역할, 결과, 에러 |

**핵심 질문**: "이 값이 무엇인가?"

- "**X의 한 값**" (예: "정원 5/10") → **Brand**
- "**X의 한 종류**" (예: "모집 중") → **판별 유니온**

### 결정 사항

#### `StudyStatus`

- 3가지 상태: Recruiting / Closed / Completed
- 전이 규칙:
    - Recruiting → Completed (자동, 정원 가득)
    - Completed → Recruiting (자동, 자리 생김)
    - Recruiting → Closed (호스트 종료)
    - Completed → Closed (호스트 종료)
    - Closed: 종착
- 추가 데이터 없음 (단순 enum-like 판별 유니온)

#### `ParticipantRole`

- 2가지: Host / Common
- 전이 없음 (역할은 변하지 않음)
- 에러 타입 없음 (실패할 함수 없음)

#### `ParticipantStatus`

- 4가지: Pending / Accepted / Rejected / Removed
- 전이 규칙:
    - Pending → Accepted (호스트 수락)
    - Pending → Rejected (호스트 거절)
    - Accepted → Removed (호스트 강퇴: `kick`)
    - Accepted → Removed (자발적 탈퇴: `withdraw`)
    - 신청 취소(Pending에서)는 **데이터 삭제** (상태 전이 X)
- `kick`과 `withdraw`는 결과 같지만 의미 분리 (유비쿼터스 언어)

### 헷갈렸던 부분

#### 1. 화이트리스트 vs 블랙리스트

전이 함수는 **화이트리스트로 가야 함**:

```typescript
// ❌ 블랙리스트 — 새 상태 추가 시 자동 허용 (위험)
if (s.kind === "Closed") return err(...);

// ✅ 화이트리스트 — 새 상태 추가 시 자동 거부 (안전)
if (s.kind !== "Recruiting") return err(...);
```

#### 2. "신청 취소"는 도메인 함수가 아니라 데이터 삭제

- 자발적 탈퇴(Accepted에서) → 상태 전이 (`withdraw`) — 기록 남김
- 신청 취소(Pending에서) → 데이터 삭제 — 기록 안 남음

**기준**: 행위의 흔적을 기록할지 말지.

#### 3. 에러는 "실패할 수 있는 곳"에만

| 함수 종류                 | 실패? | 에러 타입? |
| ------------------------- | ----- | ---------- |
| 도메인 내부 생성 (인자 X) | ❌    | ❌         |
| 질의                      | ❌    | ❌         |
| 변환/전이                 | ✅    | ✅         |
| boundary 생성 (외부 raw)  | ✅    | ✅         |

---

## Phase 3: Brand ID 타입 ✅

### 만든 것

- `entities/study/model/StudyId.ts` — `Brand<number, "StudyId">`
- `entities/participant/model/ParticipantId.ts` — `Brand<number, "ParticipantId">`
- `entities/post/model/PostId.ts` — `Brand<number, "PostId">`
- `entities/user/model/UserId.ts` — `Brand<string, "UserId">` (Supabase Auth UUID)

### 핵심 패턴

```typescript
export type StudyId = Brand<number, 'StudyId'>

export type StudyIdError = { kind: 'NotPositiveInteger'; value: number }

const construct = (value: number): Result<StudyId, StudyIdError> => {
    if (!Number.isInteger(value) || value <= 0)
        return err({ kind: 'NotPositiveInteger', value })
    return ok(value as StudyId)
}

export const StudyId = {
    of: construct,
    toString: (id: StudyId): string => String(id),
    fromString: (s: string): Result<StudyId, StudyIdError> => {
        const n = Number.parseInt(s, 10)
        return construct(n)
    },
}
```

### 결정 사항

- **DB 형식 = 도메인 형식**: Supabase가 int면 도메인도 number, Supabase Auth가 UUID면 도메인도 string
- **변환은 boundary에서만**: URL/form ↔ 도메인은 `fromString`에서
- **`StudyId.of`는 사실상 boundary 함수**: 외부 raw 값에서만 만들어짐
- **import type 사용**: `Brand`, `Result` 같은 type-only는 `import type`로

### 헷갈렸던 부분

#### `String(id)` vs `id.toString()`

- `String(id)` 권장 — null/undefined 안전 + 함수 이름이 `toString`일 때 시각적 재귀 회피
- 컨벤션상 `String()`이 일반적

---

## Phase 4: Aggregate Root ✅

### 만든 것

- `entities/study/model/Study.ts` (생성)
- `entities/participant/model/Participant.ts` (생성 + 행위 4개)

### Aggregate Root의 핵심

> **여러 작은 도메인 객체를 묶어 "하나의 일관된 덩어리"로 다루는 진입점.**

1. **일관성 경계**: 내부 객체들 사이의 규칙을 한 곳에서 보장
2. **유일 진입점**: 외부는 Aggregate Root를 통해서만 내부 접근
3. **외부 참조는 ID로**: 다른 Aggregate는 객체가 아니라 ID로

### Study Aggregate

```
Study
├─ id: StudyId
├─ hostId: UserId           ← 다른 Aggregate는 ID로 참조
├─ title, description, ...  ← 기본 정보
├─ capacity: Capacity       ← VO
├─ status: StudyStatus      ← VO
└─ createdAt, updatedAt
```

### Participant Aggregate

```
Participant
├─ id: ParticipantId
├─ studyId: StudyId         ← Study는 ID로 참조
├─ userId: UserId           ← User는 ID로 참조
├─ role: ParticipantRole    ← VO
├─ status: ParticipantStatus ← VO
└─ createdAt, updatedAt
```

### Aggregate Root 행위 패턴

```typescript
accept: (p: Participant): Result<Participant, ParticipantStatusError> => {
  const next = ParticipantStatus.accept(p.status);  // ← VO에 위임
  if (!next.ok) return next;                         // ← 에러 전파
  return ok({                                        // ← 새 Aggregate 반환 (불변)
    ...p,
    status: next.value,
    updatedAt: new Date(),
  } as Participant);
},
```

**핵심**:

1. **위임**: 상태 전이 룰은 VO가 안다 (책임 분리)
2. **불변성**: 원본 안 건드리고 새 객체 반환 (`...p` 스프레드)
3. **updatedAt 갱신**: 행위가 일어났으므로 갱신

### 결정 사항

#### Participant 분리 (별도 Aggregate)

- Study 내부에 포함 vs 별도 Aggregate → **별도 Aggregate** 선택
- 이유: Next.js + Supabase 환경에서 메모리 효율 + 학습 단계 단순화

#### cross-field invariant 강제

`Participant.create`에서 "Host는 반드시 Accepted" 룰 강제:

```typescript
if (
    ParticipantRole.isHost(params.role) &&
    !ParticipantStatus.isAccepted(params.status)
) {
    return err({ kind: 'HostMustBeAccepted', status: params.status.kind })
}
```

→ 도메인 내부에서 모듈 함수 사용. narrowing 활용 안 하면 모듈 함수가 일관성 있음.

### 헷갈렸던 부분

#### 1. 입력 타입 vs 출력 타입 분리

`CreateParams`(검증 전) vs `Study`(검증 후, branded). 같은 모양처럼 보여도 **의미가 다른 두 타입**.

#### 2. 직접 비교 vs 모듈 함수

```typescript
// 직접 비교 — narrowing 자동
if (s.kind === "Recruiting") { s./* 좁혀진 케이스의 필드 */ }

// 모듈 함수 — narrowing 안 됨 (boolean 반환이라)
if (StudyStatus.isRecruiting(s)) { /* boolean만 */ }
```

**결정 기준**:

- narrowing 결과 활용 → 직접 비교
- 단순 boolean 분기 → 모듈 함수

#### 3. `as` 캐스팅의 적법한 사용

`construct` 함수 안에서만 `as <Brand 타입>` 사용. 외부에서는 사용 금지. 캐스팅 통로를 한 곳으로 모음.

---

## Phase 5: Repository (boundary) 🚧

### 단계 분리

```
Sub-1: VO들의 fromString/toString    ← 현재 위치
Sub-2: Aggregate Root의 fromRow
Sub-3: Repository 함수 (Supabase 호출)
```

### Sub-1: VO boundary 함수

DB의 string과 도메인 판별 유니온을 매핑.

```typescript
// StudyStatus.ts에 추가
fromString: (s: string): Result<StudyStatus, StudyStatusError> => {
  switch (s) {
    case "recruiting": return ok(StudyStatus.recruiting());
    case "closed":     return ok(StudyStatus.closed());
    case "completed":  return ok(StudyStatus.completed());
    default:           return err({ kind: "InvalidValue", value: s });
  }
},

toString: (s: StudyStatus): string => {
  switch (s.kind) {
    case "Recruiting": return "recruiting";
    case "Closed":     return "closed";
    case "Completed":  return "completed";
  }
},
```

### 도메인 ↔ DB 어휘 매핑

| 도메인 (PascalCase, TS 컨벤션) | DB (lowercase, 사용자 스키마) |
| ------------------------------ | ----------------------------- |
| `Recruiting`                   | `recruiting`                  |
| `Closed`                       | `closed`                      |
| `Completed`                    | `completed`                   |
| `Host`                         | `host`                        |
| `Common`                       | `common`                      |
| `Pending`                      | `pending`                     |
| `Accepted`                     | `accepted`                    |
| `Rejected`                     | `rejected`                    |
| `Removed`                      | `removed`                     |

→ **boundary가 두 세계의 어휘를 매핑하는 유일한 장소**. 도메인 코드 어디에도 lowercase는 나오지 않음.

### 학습 포인트

- 에러 타입 확장: 기존 `InvalidTransition`에 `InvalidValue` 추가
- `switch` exhaustiveness: 케이스 빠뜨리면 컴파일 에러 (판별 유니온의 또 다른 장점)
- **단계 분리의 가치**: 도메인 모델 만들 때는 비즈니스 룰만, Repository 단계에서 DB 매핑만

---

### Sub-1 완료 기록 (2026-05-25)

| VO | fromString 매핑 | 추가된 에러 케이스 |
|---|---|---|
| `StudyStatus` | recruiting / closed / completed | `InvalidValue` |
| `ParticipantStatus` | pending / accepted / rejected / removed | `InvalidValue` |
| `ParticipantRole` | host / common | `InvalidValue` (신규 — 이전엔 에러 타입 자체가 없었음) |

#### 이번 단계의 의미

> **boundary 함수는 "두 세계의 어휘를 변환하는 통역사"**
> 
> - `toString`: 도메인 → DB (저장 시)
> - `fromString`: DB → 도메인 (조회 시)
> - **매핑 룰을 도메인 모델 옆에 한 곳에 모음** → 변경 시 한 군데만 수정

#### 새로 학습한 원칙

- **타입 시스템이 보장하는 건 다시 검증하지 않는다** — `fromString(s: string)`에서 `NotString` 케이스는 dead code (TypeScript가 컴파일 타임에 차단)
- **boundary 함수가 추가되면 에러 타입이 따라온다** — `ParticipantRole`은 이전엔 실패 함수가 없어 에러 타입이 없었지만, `fromString` 추가하면서 처음으로 에러 타입을 갖게 됨

---

### Sub-2 진행 중 발견: **DB row ≠ 도메인 Aggregate**

`Participant.fromRow`를 설계하다 깨달은 핵심 통찰. 이번 챕터에서 가장 중요한 교훈 중 하나.

#### 발견 계기

participants 테이블 실제 구조:

```typescript
type ParticipantRow = {
  id: number;
  study_id: number;
  user_id: string;
  username: string;       // ← profile에 있는 정보가 비정규화로 들어감
  avatar_url: string;     // ← (조회 효율 목적)
  user_email: string;     // ←
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};
```

→ "이 비정규화 컬럼들도 `Participant` 도메인 모델에 넣어야 하나?" 의문 발생.

#### 결론: 넣지 않는다

| 관점 | 책임 | 들어갈 필드 |
|---|---|---|
| **DB row** (`ParticipantRow`) | 저장/조회 효율 | 비정규화 컬럼 모두 (`username` 등 포함) |
| **도메인 Aggregate** (`Participant`) | 비즈니스 룰 강제 | 룰에 관련된 것만 (`role`, `status` 등) |

#### 판단 기준

> **"이 필드가 이 Aggregate의 비즈니스 룰에 관여하는가?"**

| 필드 | Participant의 룰에 관여? | 어디 둘지? |
|---|---|---|
| `role`, `status` | ✅ 전이 규칙, 권한 체크 | Participant Aggregate |
| `userId`, `studyId` | ✅ 외래 식별 | Participant Aggregate |
| `username`, `avatar_url`, `user_email` | ❌ User Aggregate의 데이터 | Participant에 넣지 않음 |

→ `username`은 `User`의 책임. `Participant`가 자기 룰에 안 쓰는 데이터를 들고 있을 이유 없음.

#### 만약 도메인에 넣었다면 생길 문제

1. **불변식 모호** — username 빈 문자열이면 Participant 무효? → 그건 User의 룰
2. **변경 책임 분산** — User가 username 바꾸면 모든 Participant 새로 만들어야?
3. **테스트 부담** — Participant 테스트마다 무관한 필드 채워야 함
4. **유비쿼터스 언어 흐려짐** — "Participant"가 사실은 "User 정보 들고 있는 Participant"로 변질

#### 실전 처리: `fromRow`에서 무시

```typescript
fromRow: (row: ParticipantRow): Result<Participant, ParticipantFromRowError> => {
  // row.username, row.avatar_url, row.user_email은 읽지 않음
  // 도메인은 이 컬럼들의 존재 자체를 모름
  
  const userIdResult = UserId.of(row.user_id);
  // ... 나머지 변환
  
  return Participant.create({ ... });  // ← profile 필드 없음
};
```

→ DB row에는 있어도 **도메인 객체로 변환할 때 무시**. 도메인은 깨끗하게 유지.

#### 미해결: "그럼 UI에서 username은 어떻게 표시?"

지금 단계에선 결정 안 함 (**YAGNI**). Sub-3 (Repository) 또는 features 단계에서 다음 중 선택:

- **Option A**: View 모델 별도 (`ParticipantView = { participant, profile }`)
- **Option B**: Repository가 row를 같이 반환 (`{ participant, raw }`)

#### 새로 학습한 원칙

- **DB 비정규화 ≠ 도메인 결합** — DB가 조회 효율로 컬럼을 모아둬도, 도메인 모델은 책임 단위로 분리
- **다른 Aggregate의 데이터는 들고 있지 않는다** — 식별자(ID)로만 참조
- **`fromRow`는 selective mapping** — row의 모든 컬럼을 도메인에 옮길 필요 없음

---

### Sub-2 완료 기록 (2026-05-25)

| Aggregate | 만든 것 |
|---|---|
| `Study` | `StudyRow`, `StudyFromRowError`, `Study.fromRow` |
| `Participant` | `ParticipantRow`, `ParticipantFromRowError`, `Participant.fromRow` |

#### 새로 학습한 패턴

1. **Wrapper 에러 타입** — `{ kind: "InvalidId", cause: StudyIdError }` 형태로 boundary 단계의 에러를 감쌈. "어디서 실패했는지" 의미 보존.
2. **Early return으로 Result 합성** — 여러 boundary 호출 결과를 차례로 풀면서 실패 시 즉시 wrap해서 return.
3. **`fromRow`는 selective mapping** — row의 모든 컬럼을 도메인에 옮길 필요 없음. 비즈니스 룰 관련 필드만.

#### 새로 학습한 원칙

- **Row 타입은 도메인을 모른다** — `ParticipantRow.role`은 `ParticipantRole`이 아니라 `string`. Row는 DB가 알 만한 primitive로만 구성. (Dependency Rule: 외부 → 내부 방향)
- **자동 생성 도구 기준** — Supabase CLI 등이 만들어낼 수 있는 타입만 Row에 씀

---

### Sub-3 진행 중 깨달음: **Trust Boundary와 검증의 위치**

`findStudyById` 코드를 보다가 "검증 안의 검증 안의 검증" 구조가 어색해서 던진 질문에서 출발한 통찰. 이번 챕터에서 가장 중요한 패러다임 전환.

#### 기존 사고 (검증이 흩어진 구조)

```
검증 모듈                호출처들이 각자 알아서 부름
  ↓                         ↓
validateStudy()  ←─── studyAction.ts
validateStudy()  ←─── useStudy.tsx
validateStudy()  ←─── 다른 어딘가
```

문제:
- "어디서 검증?" 명확하지 않음
- 호출처가 안 부르면 룰 무너짐
- 같은 룰이 여러 곳에 중복
- "이 값이 검증된 건가?" 매번 의심

#### 새 사고 (검증이 도메인 객체에 박힌 구조)

```
타입 시스템              도메인 객체를 만들려면 무조건 검증 통과 필수
  ↓                         ↓
Capacity         ←─── Capacity.of(c, m)
StudyStatus      ←─── StudyStatus.fromString("recruiting")
Study            ←─── Study.create({...})
```

→ **`Capacity` 타입의 변수는 무조건 검증 통과한 값**. 검증 안 된 값은 타입상 `Capacity`가 될 수 없음 (Brand 덕분).

#### "중첩 검증"의 실체 — 작은 책임의 분담

`Study.fromRow`가 5번 검증하는 것처럼 보이지만, 사실 **5개의 다른 책임을 각자 분담**:

| 검증 | 책임 |
|---|---|
| `StudyId.of` | ID 형식 (양의 정수) |
| `UserId.of` | UUID 형식 |
| `Capacity.of` | current ≤ max, 양수 |
| `StudyStatus.fromString` | DB값 → 도메인 매핑 |
| `Study.create` | 필드 조합 비즈니스 룰 |

→ 비유: 공항 입국 심사 (여권 / 비자 / 짐 / 통관 — 각자 다른 걸 봄)

#### Trust Boundary (가장 중요한 개념)

```
┌─────────────────────────────────────────┐
│  외부 (untrusted)                        │
│   DB row, URL param, FormData, JSON      │
└──────────────────┬──────────────────────┘
                   │ ← 여기서 한 번 검증
              [boundary 함수]
                   │  fromRow, fromString, of
                   ↓
┌─────────────────────────────────────────┐
│  내부 (trusted)                          │
│   Study, Participant, Capacity, ...      │
│                                          │
│   이 안에서는 다시 검증하지 않음         │
│   어디서 쓰이든 안전                     │
└─────────────────────────────────────────┘
```

> **검증은 경계에서 딱 한 번. 그 안에선 신뢰.**

#### 이점 5가지

1. **검증 위치 명확** — "어디서?" 답: boundary. 끝.
2. **중복 검증 제거** — 한 번 통과하면 다시 안 함
3. **누락이 컴파일 에러** — `Capacity`가 필요한 곳에 raw `number` 넘기면 빨간 줄
4. **비즈니스 룰 집중** — `Capacity.isFull` 한 곳에만 존재
5. **단위 테스트 가능** — `Capacity.of(15, 10)` 단독 테스트, mock 불필요

#### 층위별 검증은 여전히 필요 (각자 다른 책임)

| 층위 | 책임 | 도구 |
|---|---|---|
| 클라이언트 | UX (즉각 피드백) | Zod, form validation |
| 서버 액션 | 형식 검증 (untrusted input) | Zod |
| **도메인** | **비즈니스 룰** | **VO/Aggregate (우리가 만든 것)** |
| 인프라 에러 | 네트워크/통신 실패 | try/catch + Repository |
| DB | 데이터 무결성 (최종 방어선) | CHECK 제약조건 |

→ 다른 층위는 다른 종류의 검증을 함. **이걸 "검증"이라는 한 카테고리로 묶으니 혼란이 생겼던 것**. 층위별로 도구와 책임이 다름.

#### "끝없는 검증 목표" 문제의 해결

| 기존 사고 | 새 사고 |
|---|---|
| "어디서든 검증할 수 있어야" | "검증 결과를 **타입으로 박는다**" |
| "어디서든 검증 호출 → 끝없음" | "타입을 받는 곳은 신뢰 가능 → 끝남" |

→ **타입 시스템을 검증의 증거로 활용**. Scott Wlaschin의 "Make illegal states unrepresentable" 원칙.

#### 핵심 한 줄

> **"검증을 어디서 부를지" → "검증된 값을 어떻게 표현할지"**
>
> 패러다임의 전환. 검증의 위치를 박아두면 그 외엔 신뢰할 수 있다.

#### 새로 학습한 원칙

- **Trust Boundary가 곧 검증 위치** — 도메인 객체 생성 시점이 검증의 유일한 지점
- **타입이 검증의 증거** — 도메인 타입을 가진 값은 이미 검증 통과한 값
- **층위별로 책임이 다름** — 모든 검증을 한 곳에 모으려 하지 말 것 (UX/형식/룰/인프라/DB)
- **도메인 룰만큼은 빈틈없이** — 다른 영역은 try/catch나 일괄 처리로 갈 수 있어도, 비즈니스 룰은 Result로 명시적으로

---

### Sub-3 추가 깨달음: Trust Boundary는 어디? + YAGNI/DRY 재해석

`updateStudy`를 만들면서 던진 세 가지 의문에서 출발.

#### 의문 1: "클라이언트에서 Study를 변형해서 넘길 수 있는 거 아냐?"

**답**: 클라이언트는 Repository를 직접 호출할 수 없음. 항상 Server Action / API Route를 통과.

```
[Client (untrusted)]
   ↓ raw data (form, JSON)
[Server Action]
   ├─ Zod 형식 검증
   ├─ Study.create / Study.fromRow ← 도메인 검증
   └─ updateStudy(study) 호출
   ↓
[Repository (trusted)]
   ↓
[Supabase]
```

→ **Trust Boundary는 Server Action 입구**. Repository는 그 안에서만 호출되므로 항상 검증된 Study만 받음.

##### 핵심 통찰

- **TypeScript는 런타임에 없음** — 클라이언트가 `as Study` 캐스팅해서 보내도 서버는 raw JSON으로 받음. Brand도 사라짐.
- **Server Action 파라미터에 도메인 타입을 쓰면 안 됨** — `someAction(study: Study)`는 위험. 항상 raw 형태(`FormData`, plain object)로 받고 서버에서 검증.
- **Repository는 호출자(server action)를 신뢰함** — 클라이언트를 신뢰하는 게 아님.

#### 의문 2: "여러 층위에서 같은 룰을 검증하는 게 DRY/YAGNI 위반 아닌가?"

**답**: 같은 룰처럼 보여도 **각 층위의 책임이 다름**. 진짜 중복이 아님.

| 층위 | 누락 시 발생하는 사고 | 책임 |
|---|---|---|
| 클라 (Zod) | UX 망함 (서버 응답 기다려야 알 수 있음) | 즉각 피드백 |
| 서버 (Zod) | 보안 구멍 (curl로 우회 가능) | untrusted input 차단 |
| 도메인 (Capacity.of) | 무효 객체가 코드 안에서 흘러다님 | 도메인 무결성 |
| DB (CHECK) | 코드 버그가 데이터 영구 파괴 | 최종 방어선 |

→ 비유: 공항 보안 / 입국 심사 / 세관 / 탑승구 — 같은 사람을 4번 확인하지만 각자 다른 위험을 봄.

##### YAGNI / DRY 위반의 진짜 모습

| | 좋은 패턴 | 진짜 위반 |
|---|---|---|
| 층위마다 검증 | 각자 자기 책임 (정당) | 미래 대비용 추상화 6개 미리 (YAGNI) |
| 룰의 표현 | 한 곳에 정의, 여러 곳에서 import | 클라/서버에 같은 Zod 스키마 복붙 (DRY) |

→ "여러 곳에서 검증한다"는 것 자체는 위반 아님. 핵심은 **표현의 중복** (DRY)과 **미래 대비 무거운 추상화** (YAGNI).

#### 의문 3: "`Capacity.toColumns` 같은 함수 만드는 게 over-engineering 아닌가?"

**답**: 작은 캡슐화는 YAGNI 표적이 아님.

##### YAGNI의 진짜 표적

- 추상 인터페이스 계층 (`IRepository`, `IUseCase` 등)
- 플러그인 아키텍처
- 다중 모드 설정 (`ValidationMode = "strict" | "lenient" | ...`)
- 변경 가능성 입증 전의 generic / extensibility

##### `Capacity.toColumns`는?

- 5줄 함수
- **지금 즉시** 사용 (`Study.toRow`에서)
- 도메인 ↔ DB 매핑은 본질적으로 도메인 책임
- 일관성 + 변경 격리 + 응집도

→ **추상화가 아니라 캡슐화**. 도메인 응집도의 자연스러운 표현.

##### 판단 기준

```
이게 추상화인가, 캡슐화인가?
   ↓
- 추상화 (interface, generic, mode, plugin)
  → 변경 가능성 입증 전엔 YAGNI 표적
  
- 캡슐화 (데이터 + 그 데이터의 변환 함수)
  → 도메인 응집도. YAGNI 영역 아님
```

#### 새로 학습한 원칙

- **Server Action 파라미터는 raw 타입으로** — 도메인 타입(`Study`)을 클라가 보낼 수 있다고 착각하면 안 됨
- **TypeScript는 런타임에 없음** — 타입으로 보안을 강제할 수 없음. 항상 boundary에서 검증.
- **같은 룰의 여러 층위 검증은 중복이 아니다** — 책임이 다르면 다른 일
- **DRY는 "표현의 중복"을 막는 것** — "검증의 위치"가 여러 곳인 건 DRY 위반 아님
- **YAGNI는 무거운 추상화를 막는 것** — 작은 캡슐화(`toColumns`)는 YAGNI 표적 아님
- **도메인 ↔ DB 매핑은 도메인의 책임** — 매핑 룰은 도메인 모듈에 응집

---

### Sub-3 핵심 깨달음: **비즈니스 룰의 위치 — Anemic Model 탈출**

> 이번 학습에서 가장 본질적이고 중요한 통찰. 모든 도메인 모델링의 동기.

#### 발견 계기

이전 프로젝트에서 사용자가 겪었던 진짜 문제:

```
1. 권한 체크 처음엔 안 함
2. DB 트리거 함수로 추가
3. Server Action 파일에도 추가
4. 다른 작업들도 비즈니스 룰 체크 필요해짐
5. 기능마다 모든 룰을 외워야 하나?
6. 불가능해 보임
```

→ **이게 진짜 불가능해요.** 시스템 커질수록 깨짐. 이 문제에 이름이 있음: **"Anemic Domain Model" (빈혈 도메인 모델)** — 데이터는 데이터, 룰은 호출자에 흩어진 상태.

#### 근본 원인: 데이터와 행위의 분리

```
[기존 사고]
"Study" = 그냥 데이터
"권한 체크" = 호출자(server action)에 있음

→ 호출자마다 매번 룰 작성
→ 새 기능 추가 시 잊을 수 있음
→ 같은 룰이 여러 곳에 흩어짐 (DRY 위반)
→ 시스템 커질수록 룰 누락 = 보안 구멍
```

#### 구조적 해결: 룰을 도메인 행위에 박는다

```
[도메인 모델 방식]
"Study" + "그 데이터에 작용하는 행위" = 같은 모듈

Study.updateTitleBy(study, requester, newTitle)
  ├─ 권한 체크 (creatorId === requester?)
  ├─ 비즈니스 룰 (status가 Closed 아닌가?)
  ├─ 입력 검증 (title 빈 문자열 아닌가?)
  └─ 새 Study 반환 (Readonly, Brand로 변조 불가)
```

→ **호출자는 룰을 모름**. 그냥 함수만 부름. 룰은 도메인이 책임.

#### 코드 예시 비교

##### Before (Anemic — 룰 흩어짐)

```typescript
export async function updateStudyAction(formData) {
  const study = await findStudyById(id);
  if (study.host_id !== user.id) return forbidden();      // ← 권한
  if (study.status === "closed") return badRequest();     // ← 비즈니스 룰
  // ... 매 server action마다 이걸 반복
}
```

##### After (Rich Domain — 룰 박힘)

```typescript
// entities/study/model/Study.ts
export const Study = {
  updateTitleBy: (study, requester, newTitle): Result<Study, StudyError> => {
    if (study.creatorId !== requester) return err({ kind: "NotAuthorized" });
    if (StudyStatus.isClosed(study.status)) return err({ kind: "AlreadyClosed" });
    if (newTitle.trim() === "") return err({ kind: "EmptyTitle" });
    return ok({ ...study, title: newTitle, updatedAt: new Date() } as Study);
  },
};

// server action은 단순 위임
export async function updateStudyAction(formData) {
  const r = await findStudyById(id);
  if (!r.ok) return notFound();

  const updated = Study.updateTitleBy(r.value, currentUserId, newTitle);
  if (!updated.ok) return errorResponse(updated.error);  // ← 룰 위반 자동 처리

  await updateStudy(updated.value);
}
```

→ 서버 액션이 하는 일: 로드 → 도메인 행위 호출 → 결과 처리. **룰을 외울 필요 없음**.

#### "잊을 수 없음" 보장

도메인 행위에 룰을 박으면:

```typescript
// 우회 시도
const updated = { ...study, title: "new" };         // ❌ Readonly 컴파일 에러
const updated = Study.updateTitleBy(study, ...);    // ✅ 유일한 변경 통로
```

→ **타입 시스템이 우회를 막음**. 도메인 행위만이 변경의 유일 통로.

#### 층위별 역할

| 층위 | 역할 |
|---|---|
| UI | 즉각 피드백 (호스트 아니면 버튼 숨김) |
| Server Action | 도메인 행위 위임 + Result 처리 |
| **도메인 (Aggregate Root)** | **비즈니스 룰 + 권한 룰** ← 핵심 |
| Repository | 단순 CRUD (룰 없음) |
| DB Trigger / RLS | 최후 방어선 (코드 우회 시) |

→ 사용자가 시도했던 것들:
- ✅ DB 트리거: 최후 방어선 (필요)
- ✅ Server Action 권한 체크: 도메인에 박을 수 있음 (위치 옮김)
- ❌ 흩어지는 룰: **도메인에 박아서 해결**

#### 우리가 지금 만들고 있는 것의 진짜 이유

```
✅ VO (Capacity, StudyStatus, ...) — 작은 룰들의 캡슐화
✅ Aggregate Root (Study, Participant) — 큰 룰 단위
✅ 행위 메서드 (Participant.accept, kick) — 상태 전이 룰
🔜 권한 + 비즈니스 룰을 행위에 박기 — features 단계
```

이미 `Participant.accept(p)`가 상태 전이 룰을 책임지고 있어요. **"누가 accept할 수 있나" (Host 권한)는 곧 Aggregate Root에서 박힐 거예요**:

```typescript
Study.acceptParticipant: (study, participant, requester) => {
  if (study.creatorId !== requester) return err({ kind: "NotAuthorized" });
  if (participant.studyId !== study.id) return err({ kind: "WrongStudy" });
  return Participant.accept(participant);  // 상태 전이 위임
}
```

→ **Aggregate Root가 룰의 조율자**. 권한 + 다른 Aggregate 조율 책임.

#### 본질 한 줄

> **"룰이 호출자에게 있으면 끝없이 외워야 한다.**
> **룰을 데이터의 행위(함수)에 박으면 호출자는 행위만 부르면 된다."**

→ OOP의 캡슐화, FP의 도메인 모델링, DDD의 Aggregate Root가 공통으로 추구하는 것.
→ **도메인 모델링이 풀려고 하는 가장 본질적 문제**.

#### 새로 학습한 원칙

- **Anemic Model은 시스템 커지면 깨진다** — 룰을 호출자가 외우는 구조는 확장 불가능
- **룰은 데이터의 행위에 박는다** — 도메인 객체의 행위 메서드가 룰의 유일한 위치
- **호출자는 행위만 부른다** — 룰을 모르고 결과(Result)만 처리
- **타입 시스템이 우회를 막는다** — Readonly + Brand + 행위 메서드 = 변경의 유일 통로
- **Aggregate Root가 룰의 조율자** — 권한 + 비즈니스 룰 + 다른 Aggregate 조율 책임

---

### Sub-3 깨달음: 모듈 구조 · 타입 분류 · Brand 기준 정리

Repository 구현을 마치고, 지금까지 만든 타입과 함수를 전체적으로 정리한 내용.

#### 모듈 함수 카테고리

하나의 도메인 모듈(예: `Study.ts`)에 들어가는 함수는 **4가지 역할**로 나뉜다.

| 카테고리 | 의미 | 반환 | 예시 |
|---|---|---|---|
| **생성** | 새 객체 만듦 | `Result<T, E>` | `create`, `createNew`, `of`, `empty` |
| **질의** | 정보를 꺼냄 | `boolean`, 값 | `isFull`, `isHost`, `remaining` |
| **변환** | 새 객체로 바꿈 (도메인 내) | `Result<T, E>` | `accept`, `close`, `increment` |
| **boundary** | 도메인 ↔ 외부 변환 | 방향에 따라 다름 | `fromRow`, `toRow`, `fromString`, `toString` |

boundary 함수는 **방향에 따라 실패 여부가 결정**된다:

| 방향 | 실패 가능? | 반환 | 이유 |
|---|---|---|---|
| 외부 → 도메인 | ✅ | `Result<T, E>` | 외부 데이터는 untrusted |
| 도메인 → 외부 | ❌ | 그냥 `T` | 도메인 객체는 이미 검증 완료 (trusted) |

#### 에러 타입 규칙

| 상황 | 처리 방법 |
|---|---|
| 함수가 직접 실패 | 해당 모듈의 Error 사용 (`StudyError`) |
| 다른 함수 실패 전파 | union (`StudyError \| CapacityError`) |
| "어디서 실패?" 구분 필요 | wrapper (`{ kind: "InvalidId", cause: StudyIdError }`) |
| 실패 없는 함수 | 에러 타입 없음, Result도 안 씀 |

#### 타입 분류: 4종류

**1. 도메인 객체 (Brand + Readonly)**

```
Study, StudyInsert, Capacity, StudyId, UserId ...
```

- 검증 통과해야만 존재 가능 (Brand)
- 변경 불가 (Readonly)
- action, usecase, repo **모두** 사용 가능
- **export ✅**

**2. Row 타입 (primitive only, Brand 없음)**

```
StudyRow, StudyInsertRow, ParticipantRow ...
```

- DB 컬럼과 1:1 매핑 (`snake_case`)
- primitive만 (`string`, `number`) — 도메인 타입 포함 금지
- **repo 안에서만** 사용 (아키텍처 규칙)
- export는 repo가 다른 파일이라 필요 → barrel export(`index.ts`)에서 제외하여 외부 노출 차단

**3. Params 타입 (입력 명세, 내부용)**

```
CreateParams, CreateNewParams
```

- "이 함수에 뭘 넘겨야 하는지" 명세
- **export 안 함** — 호출자는 inline 객체로 넘기면 TS가 체크
- Brand 불필요

**4. Error 타입 (판별 유니온)**

```
StudyError, CapacityError, StudyFromRowError ...
```

- 각각 다른 실패 의미를 표현
- "잘못된 에러"라는 개념이 없으므로 **Brand 불필요**
- 호출자가 에러 분기 처리에 필요 → **export ✅**

#### Brand 기준: 딱 하나의 질문

> **"이 값이 존재하면 검증이 완료된 것"을 보장해야 하는가?**

- **Yes → Brand** (도메인 객체: `Study`, `StudyInsert`, `Capacity`, `StudyId` ...)
- **No → 일반 type** (Row, Params, Error)

#### export 기준

| 타입 | export? | 이유 |
|---|---|---|
| 도메인 객체 | ✅ | 여러 레이어에서 사용 |
| Error | ✅ | 호출자가 에러 분기에 사용 |
| Row | ✅ (but 제한) | repo 파일이 별도라서 export 필요하나, barrel에서 제외 |
| Params | ❌ | 같은 파일 안에서만 사용 |

> **export = "사용 가능"이지 "사용 권장"이 아니다.**
> TypeScript에는 `package-private`이 없으므로, 레이어 규칙은 barrel export + 팀 컨벤션으로 보완한다.

#### 전체 흐름에서 타입이 흐르는 모양

```
[Action / UseCase]
  │  CreateNewParams 모양 (inline 객체)
  ↓
Study.createNew(...)
  │  → StudyInsert (Brand, 검증 완료)
  ↓
insertStudy(studyInsert)       ← Repository
  │  → StudyInsertRow (primitive, DB용)  ← Study.toInsertRow()
  ↓
Supabase
  │  → StudyRow (primitive, DB에서 옴)
  ↓
Study.fromRow(row)
  │  → Study (Brand, 검증 완료)
  ↓
[Action / UseCase에 반환]
```

#### 새로 학습한 원칙

- **함수 카테고리** — 생성 / 질의 / 변환 / boundary로 나누면 모듈이 정리됨
- **boundary 방향 = 실패 여부** — 외부→도메인은 Result, 도메인→외부는 plain
- **Brand 기준** — "존재 = 검증 완료"를 보장해야 하면 Brand, 아니면 일반 type
- **export ≠ 사용 권장** — TS에 접근 제한이 없으므로 barrel export로 보완
- **Row는 primitive only** — DB의 거울이므로 도메인 타입이 섞이면 안 됨

---

### Sub-3 깨달음: 책임 분배 · 의존 방향 · 레이어 역할

Repository와 UseCase의 관계, 조회 전용 함수, 비정규화 컬럼 처리 등을 다루면서 정리한 원칙.

#### 비즈니스 로직의 정의

> **"개발자가 아닌 기획자/사장이 결정하는 규칙"**

- "정원이 차면 참여 불가" → 비즈니스 로직 ✅
- "Supabase를 쓸지 Firebase를 쓸지" → 비즈니스 로직 ❌
- DB가 뭐든, 프레임워크가 뭐든 동일한 규칙이 비즈니스 로직

코드에서 비즈니스 로직은 **전부 `model/` 안에** 있다.

#### 레이어별 역할

| 레이어 | 하는 일 | 절대 안 하는 일 |
|---|---|---|
| **도메인 모듈 (model/)** | "뭘 바꿀지" 결정 + 검증 | DB 접근 |
| **Repo (api/)** | 하나의 Aggregate 저장/조회 | 비즈니스 판단 |
| **UseCase (actions/)** | 위 둘을 조립 | 직접 검증하거나 직접 DB 접근 |

어떤 기능이든 분해하면 이 3가지 조합:
- 테이블 1개 → UseCase에서 도메인 행위 + repo 1개
- 테이블 2개 → UseCase에서 도메인 행위 + repo 2개
- 일부만 변경 → 도메인이 일부만 바꾼 새 객체 반환 + repo는 전체 저장
- 조건부 로직 → 도메인이 Result로 성공/실패 판단 + UseCase가 분기

#### repo는 "비즈니스 로직을 지원"하는 것

- repo 자체에 비즈니스 로직은 없음
- 비즈니스 로직 전후에 **데이터를 가져오고 저장하는 도구**

```
UseCase: acceptParticipant
  findParticipantById(id)          ← repo: 데이터 가져옴 (로직 없음)
  Participant.accept(participant)   ← model: 비즈니스 로직 실행
  updateParticipant(updated)       ← repo: 결과 저장 (로직 없음)
```

#### 도메인 repo vs 조회 전용 함수

| | 도메인 repo | 조회 전용 함수 |
|---|---|---|
| **누가 부르나** | UseCase (행위 실행 흐름) | 화면 (표시 목적) |
| **반환** | Brand 타입 (행위 적용 가능) | View 타입 (표시용, 행위 없음) |
| **JOIN** | ❌ 자기 테이블만 | ✅ 필요한 만큼 |
| **로직 포함?** | ❌ | ❌ |

차이는 "반환한 객체로 뭘 하느냐":
- 도메인 repo → 반환값으로 행위(accept, reject...)를 적용할 예정
- 조회 전용 → 반환값을 화면에 그대로 표시할 예정

#### 업데이트 패턴: 전체 로드 → 도메인 행위 → 전체 저장

"일부만 변경"은 도메인 행위에서 일어남. repo는 항상 완성된 객체를 받아 전체 저장.

```
UseCase:
  1. findStudyById(id)              → Study (전체 로드)
  2. Study.updateTitle(study, new)  → 새 Study (title만 바뀜)
  3. updateStudy(newStudy)          → 전체 저장
```

- repo는 "뭐가 바뀌었는지" 모름. 항상 전체 저장.
- 특화 repo 함수(current만 변경 등)는 성능 문제가 실제로 생겼을 때만 (YAGNI).

#### 두 테이블 쓰기: UseCase가 조립

repo는 **테이블(Aggregate) 단위**. "두 테이블을 한 번에" 하는 repo는 만들지 않음.

```
UseCase: createStudyWithHost
  Study.createNew(...)           → StudyInsert
  insertStudy(studyInsert)       → Study        (repo 1)
  Participant.createNew(...)     → ParticipantInsert
  insertParticipant(hostInsert)  → Participant   (repo 2)
```

"하나의 기능"은 UseCase 함수의 이름과 시그니처가 표현.

#### 의존 방향 = "누가 누구를 알고 있나"

```typescript
import { something } from "./B";  // A가 B에 의존 = A가 B를 알고 있음
```

B가 바뀌면 A도 영향받음. 이게 의존.

**의존 방향이 꼬인다 = 변경할 때 엉뚱한 곳을 건드려야 함**

예: 프로필 구조가 바뀌었는데 참여자 폴더를 열어야 하면 → 구조가 잘못된 것.

#### 배치 기준: "누가 촉발하느냐"

> **"어떤 테이블을 건드리느냐"가 아니라 "왜, 누가" 기준으로 배치한다.**

같은 `participants` 테이블을 건드려도:

| 누가/왜 | 위치 |
|---|---|
| 참여자 행위 (수락/거절) | `entities/participant/` |
| 프로필 동기화 | `entities/profile/` |
| 화면 표시용 조회 | `entities/participant/api/Queries.ts` |

#### 단일 책임 원칙 (SRP)

> **"변경의 이유가 같은 것끼리 모은다"**

| 변경 이유 | 영향받는 코드 | 모이는 곳 |
|---|---|---|
| 참여 수락 규칙 변경 | Participant model, repo | `entities/participant/` |
| 프로필 구조 변경 | Profile 관련 전부 | `entities/profile/` |
| 화면 디자인 변경 | View 컴포넌트 | `features/` |

프로필이 바뀌었는데 참여자 폴더를 열어야 하면 → 구조가 잘못된 것.

#### 비정규화 컬럼은 도메인이 모른다

participants 테이블의 `username`, `avatar_url`, `user_email`은 성능 최적화를 위한 비정규화.

| 계층 | profile 필드 | 이유 |
|---|---|---|
| DB 테이블 | ✅ 있음 | 성능 (JOIN 줄이기) |
| Participant (도메인) | ❌ 없음 | 비즈니스 규칙에 불필요 |
| ParticipantView (조회용) | ✅ 있음 | 화면 표시에 필요 |

- 도메인이 모르는 컬럼은 도메인이 관리하지 않음
- 비정규화 동기화는 DB 트리거 또는 별도 함수(entities/profile/api/)

#### Row 타입 분리: 용도에 따라

| 타입 | 용도 | profile 필드 |
|---|---|---|
| `ParticipantRow` | SELECT 결과 (fromRow) | ✅ 포함 |
| `ParticipantUpdateRow` | UPDATE 입력 (toRow) | ❌ 제외 |
| `ParticipantInsertRow` | INSERT 입력 (toInsertRow) | ❌ 제외 |

#### 타입 나누는 기준: "필드가 다른가"

| 상황 | 구조 차이? | 별도 타입? |
|---|---|---|
| INSERT | ✅ id, timestamps 없음 | ✅ `StudyInsert` |
| UPDATE | ❌ 같은 필드, 값만 다름 | ❌ 그대로 `Participant` |

#### FSD 레이어 import 규칙

```
shared/    ← 누구나 import 가능
entities/  ← shared만 import 가능, 다른 entity ❌
features/  ← entities + shared import 가능
```

#### Result를 쓰는 기준

> **"실패할 수 있는 함수만 Result를 쓴다"**

| params 내용 | 실패 가능? | 반환 |
|---|---|---|
| primitive (string, number) | ✅ 검증 필요 | `Result` |
| 전부 도메인 타입 (Brand) | ❌ 이미 검증됨 | 그냥 `T` |

#### Brand 타입 → createNew 필요 여부 판단

> **Brand 타입이 있고, 외부에서 만들어야 하는 상황 → 생성 함수 필요**

`as BrandType` 캐스트는 모듈 내부만 가능 → 외부가 Brand 객체를 만들려면 생성 함수가 있어야 함.

#### repo 함수는 UseCase가 부를 때만 만든다

> **"이 함수를 부르는 UseCase가 지금 존재하는가?"**

필요 없는 repo 함수를 미리 만들지 않는다 (YAGNI).

#### 비즈니스 규칙 없으면 도메인 경유 불필요

단순 데이터 동기화(컬럼 복사)에는 도메인 객체를 만들고 행위를 적용할 이유 없음. Supabase 직접 호출.

#### 새로 학습한 원칙

- **비즈니스 로직 = 기획자가 정하는 규칙** — DB/프레임워크 무관하게 동일한 규칙
- **레이어 3종** — model(검증) + repo(저장) + usecase(조립). 어떤 기능이든 이 조합.
- **repo = 지원자** — 로직 없음. 데이터 가져오고 저장만.
- **전체 로드 → 행위 → 전체 저장** — 일부 변경도 이 패턴. 특화 함수는 YAGNI.
- **UseCase = 비즈니스 목적의 단위** — 두 테이블 쓰기도 UseCase가 조립.
- **의존 = import = 알고 있다** — B가 바뀌면 A도 영향. 방향이 꼬이면 변경이 전파.
- **배치는 "누가 촉발하느냐"** — 테이블 기준이 아님.
- **SRP = 변경의 이유가 같은 것끼리** — 프로필 변경은 profile 폴더에서 끝나야.
- **비정규화 = 인프라 관심사** — 도메인이 모르는 컬럼은 도메인이 관리 안 함.
- **Result는 실패 가능할 때만** — params가 전부 도메인 타입이면 Result 불필요.
- **Brand → createNew 필요 여부** — Brand인데 외부에서 만들어야 하면 생성 함수 필수.

---

## 다음 단계

### Sub-3 완료 사항

- ✅ `StudyInsert`에 Brand 추가
- ✅ `createNew` 함수 본문 구현 (status 제거)
- ✅ `entities/participant/api/ParticipantRepository.ts` 구현
- ✅ `Participant.createNew` 구현

### 다음 예정

- UseCase(Action) 구현 — model + repo 조립
- 조회 전용 함수 구현 (`ParticipantQueries.ts`)
- `entities/profile/` 구조 잡기

---

## 학습한 핵심 원칙 모음

1. **YAGNI** — 진짜 필요할 때 만든다. 미리 만들지 않는다.
2. **trusted world** — 도메인 안은 이미 검증된 세계. 다시 검증 X.
3. **boundary 함수** — 외부 raw → 도메인은 한 곳에서.
4. **불변성** — 변경은 새 객체 반환. 원본 안 건드림.
5. **유비쿼터스 언어** — 비즈니스 용어를 코드에 그대로 반영.
6. **단계 분리** — 한 번에 한 종류의 고민만 (도메인 vs DB 매핑 vs 시나리오).
7. **화이트리스트** — 허용 조건을 명시. 거부 조건이 아니라.
8. **YAGNI의 적용** — 검증할 게 없으면 검증 안 함. 에러 케이스 없으면 에러 타입 X.
9. **함수 카테고리** — 생성 / 질의 / 변환 / boundary로 모듈 함수를 분류.
10. **boundary 방향 규칙** — 외부→도메인은 `Result`, 도메인→외부는 plain 반환.
11. **Brand 기준** — "존재 = 검증 완료" 보장이 필요하면 Brand.
12. **export ≠ 사용 권장** — barrel export + 컨벤션으로 레이어 접근 제한 보완.
13. **비즈니스 로직** — 기획자가 정하는 규칙. model/ 안에만 존재.
14. **레이어 역할** — model(검증) + repo(저장) + usecase(조립).
15. **전체 로드 → 행위 → 전체 저장** — 업데이트의 표준 패턴.
16. **의존 방향** — import 방향이 곧 의존. 꼬이면 변경이 전파됨.
17. **배치 기준** — "어떤 테이블"이 아니라 "누가 촉발하느냐".
18. **SRP** — 변경의 이유가 같은 것끼리 모은다.
19. **비정규화 = 인프라** — 도메인이 모르는 컬럼은 도메인이 관리 안 함.
20. **Result 기준** — 실패 가능한 함수만. 도메인 타입만 받으면 불필요.
21. **Brand → 생성 함수** — Brand인데 외부에서 만들어야 하면 생성 함수 필수.

---

## 변경 이력

| 날짜       | 내용                                        |
| ---------- | ------------------------------------------- |
| 2026-05-25 | 최초 작성. Phase 0~4 완료, Phase 5 진행 중. |
| 2026-05-27 | Sub-3 모듈 구조·타입 분류·Brand 기준 정리 추가. |
| 2026-05-27 | Sub-3 책임 분배·의존 방향·레이어 역할 정리 추가. |
