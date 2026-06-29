# study-mate 아키텍처

> Next.js + Supabase + TypeScript 풀스택 프로젝트의 폴더 구조 및 도메인 모델링 가이드.
> **FP + DDD(전술적) + FSD**를 이 프로젝트 규모에 맞게 부분 차용한 청사진.

---

## 0. 한 줄 요약

> **함수형 컴포넌트는 그대로, 도메인 레이어를 FP-DDD로 강화, 폴더 구조는 FSD(부분)로 재배치.**

- UI: 함수형 컴포넌트 + React Query (현재 유지)
- 도메인: `entities/*/model`(VO·전이) + `entities/*/service`(루트·cross 규칙) + FP-DDD
- Use Case: `features/*/api/*Action` — repo Load/Save + domain `service`/`model` 호출
- 인프라: Repository·Query로 Supabase 격리 (`entities/*/api`)
- 폴더: `entities / features / widgets / shared` 4-레이어 (FSD), Next.js `app/`은 라우팅만

---

## 1. 설계 철학

### 1-a. 왜 이 조합인가

| 결정                                       | 이유                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **FP 채택 (클래스 X)**                     | TS 판별 유니온, Readonly, branded type으로 OOP 캡슐화를 표현 가능. Next.js 직렬화 문제 없음. UI(React)와 도메인이 같은 패러다임 → 인지 부하 ↓ |
| **DDD 전술적 패턴만**                      | 불변식이 많은 도메인(`exercise.md` G1~G5 등)이 존재. VO/Aggregate/Repository로 불변식을 코드 구조에 박는다                                    |
| **DDD 전략적 패턴 생략** (BC 폴더 분리 등) | 1인 풀스택 규모에선 오버엔지니어링. FSD `entities/` 폴더로 충분히 분리됨                                                                      |
| **FSD 부분 채용**                          | UI 분류/재사용 기준이 명확해짐. 단, `pages/` 레이어는 Next.js `app/`과 충돌하므로 제거                                                        |
| **`src/` 미사용**                          | 현재 `@/*` → `./*` 별칭이라 마이그레이션 비용 최소화 위해 루트에 새 폴더 배치                                                                 |

### 1-b. 적용하지 않는 것 (오버엔지니어링 경계선)

- ❌ Bounded Context별 최상위 폴더 (`contexts/studies/...`) — `entities/study/`로 충분
- ❌ Domain Event Bus — Supabase 트랜잭션(RPC)으로 충분
- ❌ 모든 시나리오마다 UseCase 클래스 — 복잡한 것만 함수로 추출
- ❌ 본격 DI 컨테이너 (tsyringe 등) — 부분 적용/팩토리 함수로 충분
- ❌ `fp-ts` / `effect-ts` — 자체 정의 `Result` 타입으로 시작, 필요시 `neverthrow` 정도
- ❌ FSD의 `pages/` 레이어 — Next.js `app/` 사용

#### 원칙 vs 실무 (이동·배치 판단 3원칙)

구조는 _값을 줄 때_ 적용한다. 다이어그램을 만족시키려 움직이지 않는다.

1. **곧 마이그레이션될 legacy로/그 주변으로 타입·코드를 옮기지 마라.** 그 슬라이스가 이동할 때 _함께_ 옮긴다 (churn for churn 금지). 예: 추천 읽기 DTO는 원칙상 추천 기능 소유지만, 소비처가 아직 legacy `actions/`라면 ai-recommend 마이그레이션 때 같이 이동.
2. **원칙 만족용 빈 폴더·1줄 세그먼트를 만들지 마라.** `model/types.ts`에 넣을 게 없으면 그냥 비워둔다 (빈 게 정상 — 아키텍처가 깔끔하다는 신호).
3. **전환기(transitional) 상태는 허용하되 기록하라.** "원칙상 X, 지금은 Y, Z 시점에 이동"을 메모리/주석에 남긴다.

> 보조 관점: FSD = _예측 가능한 위치 + 의존성 통제(import 규칙)로 변경 범위(blast radius)를 가둠_. DDD = _불변식·도메인 언어·신뢰 경계를 model 한 곳에 모음_. 마이그레이션 중 잦은 이동은 구조를 세우는 일회성 비용이고, "이동 최소화"는 정상상태의 결과지 여정의 규칙이 아니다.

---

## 2. 전체 폴더 구조

```
study-mate/
│
├─ app/                              ← Next.js App Router (라우팅 전용, 그대로)
├─ public/                           ← 정적 파일 (그대로)
│
├─ widgets/                          🆕 페이지의 큰 블록 (조립 단위)
│  ├─ post-detail-sidebar/
│  ├─ post-detail-main/
│  ├─ post-list/
│  ├─ study-detail-header/
│  ├─ study-detail-tabs/
│  ├─ site-header/
│  └─ site-footer/
│
├─ features/                         🆕 사용자 시나리오 (액션 + 훅 + UI 한 폴더)
│  ├─ post-create/
│  ├─ post-edit/
│  ├─ post-delete/
│  ├─ post-like-toggle/
│  ├─ post-view-track/
│  ├─ participant-apply/
│  ├─ participant-accept/
│  ├─ participant-reject/
│  ├─ participant-remove/
│  ├─ study-create/
│  ├─ study-edit/
│  ├─ study-delete/
│  ├─ auth-login/
│  ├─ auth-logout/
│  ├─ notification-mark-read/
│  ├─ chat-send/
│  └─ ai-recommend/
│
├─ entities/                         🆕 도메인 (model + service + api + ui)
│  ├─ study/
│  │  ├─ model/                      ← 타입, VO, 단일 VO 생성·질의·전이
│  │  ├─ service/                    ← aggregate 루트 규칙 (여러 VO/컬럼 조합)
│  │  ├─ api/                        ← Repository + Query (DB only)
│  │  ├─ ui/                         ← 표현 컴포넌트 (Presentational)
│  │  └─ lib/                        ← 도메인 헬퍼
│  ├─ Participant/
│  │  ├─ model/
│  │  ├─ service/                    ← Participant 시나리오 (Study는 Study/service 경유)
│  │  ├─ api/
│  │  └─ ui/
│  ├─ post/
│  ├─ participant/
│  ├─ user/
│  ├─ profile/
│  ├─ notification/
│  ├─ chat-room/
│  └─ message/
│
├─ shared/                           🆕 도메인 무관 공용 자원
│  ├─ ui/                            ← shadcn (현 components/ui 이동)
│  ├─ api/
│  │  └─ supabase/                   ← 클라이언트 + RPC 헬퍼
│  ├─ lib/                           ← format, date, cn, parseFormData
│  ├─ kernel/                        ← DDD shared kernel (Result, Id, brand)
│  ├─ config/                        ← 상수, env
│  └─ hooks/                         ← useDebounce 등 UI 유틸 훅
│
│  ───── 아래는 점진 이동 중인 옛 폴더 (마이그레이션 후 삭제) ─────
│
├─ actions/                          🟡 → features/*/api/
├─ components/                       🟡 → entities/*/ui/, features/*/ui/, widgets/*/ui/
├─ hooks/                            🟡 → entities/*/api/, features/*/model/
├─ lib/                              🟡 → shared/, entities/, features/
├─ types/                            🟡 → entities/*/model/types.ts
├─ utils/                            🟡 → shared/lib/
│
├─ types_db.ts                       ← Supabase 자동 생성 (그대로)
└─ next.config.ts, package.json...   (그대로)
```

---

## 3. 각 폴더 상세

### 3-a. `app/` — Next.js 라우팅 전용

```
app/
  posts/page.tsx                ← widget/feature 조립만, 30줄 이하
  posts/[id]/page.tsx
  posts/create/page.tsx
  studies/page.tsx
  studies/[id]/page.tsx
  layout.tsx
  providers.tsx                 ← React Query Provider 등
```

- **역할**: URL → 어떤 widget/feature를 그릴지 지정.
- **들어가는 것**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- **들어가지 않는 것**: 비즈니스 로직, 도메인 모델, 데이터 fetching 디테일
- **이상적인 모습**: 페이지 한 개당 30줄 이내. 대부분은 widget 한두 개 import + 조립.

### 3-b. `widgets/` — 페이지의 큰 블록 (조립 단위)

한 페이지의 일부분이지만 여러 features/entities를 조합한 덩어리.

```
widgets/post-detail-sidebar/
  ui/SidebarSection.tsx        ← 현 components/posts/detail/SidebarSection.tsx 이동
  index.ts                     ← public API (re-export)
```

- **역할**: features/entities를 조립한 페이지 단위 큰 영역.
- **들어가는 것**: 큰 레이아웃 컴포넌트.
- **상태**: 거의 없음 (오케스트레이션용 useState만 가끔).
- **들어가지 않는 것**: mutation 호출(→ feature), 도메인 룰(→ entity).
- **이 프로젝트 신호**: 파일 이름이 `*Section` 인 것들은 보통 widget.

### 3-c. `features/` — 사용자 행위 (앱의 명세서)

"사용자가 _하는_ 한 가지 행위(상호작용)"를 한 폴더에 모은 것.

> **feature = 행위(action)지, 조회(read)가 아니다.** (정통 FSD)
> 사용자가 클릭·제출·입력·토글로 _무언가를 일으키는_ 단위만 feature다 (신청/수락/삭제/검색 등).
> 단순히 데이터를 **보여주기만** 하는 것(상세 뷰 등)은 feature가 **아니다** →
> 조회는 `entities/*/api`, 표현은 `entities/*/ui`, 조립은 `widgets`/`app`.
> 판별 기준은 read/write가 아니라 **"사용자가 행동을 하는가?"** — 검색은 읽지만 *조작*하므로 feature, 상세 뷰는 _바라볼_ 뿐이라 아님.

```
features/participant-accept/
  ui/AcceptButton.tsx            ← 클릭 가능한 UI
  model/useAcceptParticipant.ts  ← React Query mutation 훅
  api/acceptParticipantAction.ts ← 'use server' (얇은 어댑터)
  application/                   ← (선택) 복잡한 시나리오만
    acceptParticipantUseCase.ts
  index.ts                       ← 외부에 노출할 것만 re-export
```

- **역할**: 한 시나리오의 UI + 훅 + **Use Case(action)** 를 한 폴더에 응집.
- **들어가는 것**: 그 시나리오에만 쓰이는 모든 것.
- **들어가지 않는 것**: 여러 시나리오가 공유하는 도메인 모델(→ entity), 재사용 UI(→ entity ui), **순수 조회/표시(→ `entities/api`·`ui`, `widgets`/`page`)**.
- **`api/*Action` = App Service (Use Case)**: auth → repo Load → `entities/*/service` 또는 `model` → repo Save → `{ success, error }`.
- **`application/` 폴더 규칙**: 복잡할 때만 만듦. 단순 시나리오는 액션에 inline.
- **features 폴더 = 앱이 할 수 있는 일의 명세서**.

#### Write 요청 흐름 (CSR)

```
app/.../page.tsx          SSR 레이아웃·초기 데이터 (Read는 아래 참고)
  → features/기능/ui     폼·버튼·useState
    → features/기능/model  useMutation 등 hook
      → features/기능/api/*Action   Use Case
           ├─ entities/*/api        Repository load/save
           ├─ entities/*/service    도메인 연산 (cross-aggregate 포함)
           └─ entities/*/model      단일 aggregate 전이 (필요 시)
```

**aggregate root가 repo를 실행하지 않음.** Load/Save는 Use Case(action) 책임.

### 3-d. `entities/` — 도메인 (FP-DDD의 심장부)

도메인 개념(Study, Participant, Post, User ...) 단위로 **model / service / api / ui** 를 모은 곳.

> **`service` 주의**: Nest/인프라 service가 아님. **순수 도메인 연산 모음** (DDD Domain Service·Aggregate Root 연산). DB/Supabase 호출 금지.

```
entities/study/
  model/
    Study.ts                     ← Aggregate 타입, fromRow/toRow (얇게)
    Capacity.ts                  ← Value Object — 단일 VO 생성·질의·전이
    StudyStatus.ts               ← 판별 유니온 — 단일 VO 생성·질의·전이
    errors.ts
  service/
    StudyMembership.ts           ← 여러 VO 조합 루트 규칙 (예: canAcceptParticipant)
  api/
    StudyRepository.ts           ← Write: findById, save …
    queryStudyDetail.ts          ← Read: DB 조인 only
  ui/
    StudyCard.tsx
    StudyStatusBadge.tsx
  index.ts

entities/participant/
  model/
    Participant.ts               ← Aggregate 타입, 단일 aggregate 전이 (kick, accept …)
    ParticipantStatus.ts
    ParticipantRole.ts
    errors.ts
  service/
    ParticipantHostActions.ts    ← kick, accept, reject (Study/service 경유)
    ParticipantSelfActions.ts    ← createDeleteIntent (자진 취소/탈퇴)
  api/
    ParticipantRepository.ts
  ui/
  index.ts

entities/user/
  model/
    UserId.ts                    ← 공유 VO (여러 aggregate에서 직접 import OK)
```

#### `model` vs `service` — 역할 분리

| 폴더           | 담당                                                                                   | 예                                                                    |
| -------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **`model/`**   | 타입·VO 정의, **단일 VO** 생성·질의·전이, aggregate 타입·매핑                          | `StudyStatus.kick`, `Capacity.isFull`, `Participant.kick(p)`          |
| **`service/`** | **여러 VO/필드가 엮이는 비즈니스 규칙**, cross-aggregate 시나리오(주도 aggregate 기준) | `StudyMembership.canAcceptParticipant`, `ParticipantHostActions.kick` |
| **`api/`**     | Repository·Query — **DB만**                                                            | `findStudyById`, `queryStudyDetail`                                   |
| **`ui/`**      | props만 받는 표현                                                                      | `StudyStatusBadge`                                                    |

**같은 aggregate 안** (Study + Capacity + StudyStatus):

- `StudyStatus.isRecruiting` → `model/`
- `canAcceptParticipant` (status + capacity) → `study/service/`
- 바깥에서는 **`Study/service`만** 호출. `StudyStatus` 직접 import ❌

**다른 aggregate 연관** (강퇴 = Participant 기능 + Study 조건):

- 구현 위치 → **`Participant/service/`** (Participant 주도 시나리오)
- Study 조건 접근 → **`Study/service/`** 경유 (`StudyStatus` 직접 ❌)
- `Participant/model`의 `kick(p)` — participant **단일 전이만** (accepted → kicked)

#### 도메인 목록

| entity         | 비고                                                       |
| -------------- | ---------------------------------------------------------- |
| `study`        | Aggregate Root. `service/`에 status+capacity 등 루트 규칙. |
| `Participant`  | Study와 연관되나 단독 조회/UI·시나리오가 있어 분리.        |
| `post`         | Aggregate Root. PostImage(VO)를 포함.                      |
| `user`         | 공유 VO (`UserId`). aggregate가 아닌 identity 연산.        |
| `profile`      | 프로필 정보.                                               |
| `notification` | 알림.                                                      |
| `chat-room`    | 채팅방.                                                    |
| `message`      | 채팅 메시지.                                               |

#### entities 간 의존 방향

```
features/api (Use Case)
    ↓
Participant/service  ──→  Study/service
    ↓                           ↓
Participant/model         Study/model (VO)
    ↓
Participant/api (Repository)
```

- `Study/service` → `Participant` ❌
- `Participant/model` → `Study` ❌
- `Participant/service` → `Study/service` ✅
- `UserId` — `entities/user/model`에서 **공유 VO**로 직접 import ✅

### 3-e. `shared/` — 도메인 무관 공용 자원

```
shared/
  ui/                          ← shadcn 컴포넌트 (button, dialog, ...)
  api/
    supabase/                  ← createClient, queryKeys, RPC 헬퍼
  lib/                         ← format, date, cn, parseFormData, validation
  kernel/                      ← 🆕 DDD shared kernel
    Result.ts                  ← ok/err + helpers
    Id.ts                      ← branded ID 유틸
    pipe.ts                    ← (선택) 함수 합성
    types.ts                   ← ActionResponse 등
  config/                      ← 상수 (env, region/category map)
  hooks/                       ← useDebounce, useToggle 등 UI 유틸
```

#### `shared/kernel/` — 가장 중요한 새 폴더

모든 도메인이 의존하는 공통 어휘.

```typescript
// shared/kernel/Result.ts
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

// shared/kernel/Id.ts (branded id 유틸)
export type Brand<K, T> = K & { readonly __brand: T }
```

#### `shared/`에 들어가면 안 되는 것

- 특정 도메인 타입(`Post`, `Study` ...) → entities로
- 비즈니스 로직 → entities/features로
- "임시로 둘 데 없어서" 둔 것 → 도메인 정해서 그쪽으로

---

## 4. Read vs Write

|               | **Read (읽기)**                               | **Write (쓰기)**                     |
| ------------- | --------------------------------------------- | ------------------------------------ |
| 목적          | 화면에 **보여주기**                           | 상태 **바꾸기**                      |
| DB            | `entities/*/api` (Query/Repository)           | `entities/*/api` (Repository)        |
| VO / service  | **안 씀** (plain / row)                       | **씀** (Load → service/model → Save) |
| orchestration | `entities/*/api` 조회 + `widgets`/`page` 조립 | `features/*/api/*Action`             |
| 응답          | `Result<PlainView, E>`                        | `{ success, error }`                 |

### Read 경로

```
entities/*/api/queryXxx.ts       DB 조인·조회 + 정렬 + Result + plain (조회 책임 일체)
entities/*/api/useXxx.ts         React Query 조회 훅 (선택)
widgets / page                   조회 결과 + entity UI + feature 버튼 조립
```

- VO, Domain service 호출 없음. mapper 계층은 보류(현재 `as` 허용).
- **`getXxxView`는 features에서 폐지** — 조회 가공(정렬·plain 변환)은 `entities/*/api` 쿼리가 일체 담당. features는 행위(`*Action`)만.

### Write 경로 + 도장 3종

```
features/*/api/*Action
  → Auth + ID VO
  → Repository Load (fromRow → VO)
  → entities/*/service (또는 model 전이)
  → Repository Save
  → { success, error }
```

| 연산       | Save에 넘기는 것                                   |
| ---------- | -------------------------------------------------- |
| **insert** | `ParticipantInsert` 등 Brand                       |
| **update** | 전이된 **VO** + `guardStatus` (Update Intent 없음) |
| **delete** | `DeleteParticipantIntent` 등 Brand                 |

---

## 5. 폴더 안의 규칙 (강제 사항)

### 5-a. `entities/*/model/` 규칙

- ✅ `Readonly<T>` + branded type
- ✅ **단일 VO** 생성·질의·전이, aggregate 타입·`fromRow`/`toRow`
- ✅ 순수 함수만 (class 없음)
- ✅ `Result<T, E>` 반환 (throw는 smart constructor의 검증 실패뿐)
- ❌ 여러 VO를 묶는 루트 규칙 (→ `service/`)
- ❌ 다른 aggregate의 sub-VO 직접 import (→ 해당 aggregate `service/`)
- ❌ Supabase 호출, fetch
- ❌ `useState`, `useEffect` X (UI 코드 아님)

### 5-b. `entities/*/service/` 규칙

- ✅ **여러 VO/필드 조합** 비즈니스 규칙 (같은 aggregate)
- ✅ **주도 aggregate 기준** cross-aggregate 시나리오 (`Participant/service` → `Study/service`)
- ✅ `Result<T, E>` 반환, `if (!r.ok) return r` bubble
- ✅ Load된 VO만 인자로 받음 (repo 호출 ❌)
- ❌ Supabase, auth, `{ success, error }` (→ features/api)
- ❌ 다른 aggregate의 `model/StudyStatus` 직접 호출 (→ `Study/service`)

### 5-c. `entities/*/api/` 규칙

api는 **데이터 경계 세그먼트**다. 두 측(CQRS)이 공존하며, **의도적으로 이질적**이다 — 한 폴더에 섞인 게 아니라 _측별로 가른_ 것이다.

- **command측 (Write)**: Repository — `findById`, `save`, `update`, `delete` … → **도메인 VO(Aggregate) 반환**.
- **query측 (Read)**: Query — `queryStudyDetail` 등 → **plain DTO 반환** (VO 아님). DB 조회·정렬·매핑까지 일체.
- **조회 훅**(React Query)은 query측에 둔다. mutation 훅은 feature(`features/*/model`)로.
- 측 구분은 **파일명**(`*Repository` / `query*`·`use*`) 또는 **하위폴더**(`api/query/`)로. entity가 커지면 하위폴더 권장.
- Supabase 호출은 이 폴더 안에만.
- ❌ 조회 훅을 `model/`에 두지 말 것 — DDD 순수 도메인이 React에 오염됨. `ui/`도 ❌ (fetch 금지 규칙).

#### Read DTO 규칙 — 캐논 1개 + 파생 view

조회 타입은 **엔티티당 캐논(default) 타입 1개**를 두고, **읽기마다 그 캐논에서 `Pick`/`Omit`으로 파생한 view**를 쓴다. 손으로 새 타입을 다시 적지 않는다.

- **캐논**: 그 엔티티의 _실제 모양_(DB 컬럼/도메인). 화면별 요구의 합집합으로 부풀리지 말 것(god-type 금지). 예) `PostResponse`, `ProfileResponse`.
- **파생 view**: 그 읽기가 _실제 쓰는 필드만_. `type StudyDetailPostView = Omit<PostResponse, "commentsCount">` / `type StudyDetailCreatorView = Pick<ProfileResponse, "id"|"username"|"email"|"avatarUrl">`. view는 **그 모양을 필요로 하는 슬라이스**에 둔다(study-detail용 post view는 study가 소유).
- **불변식 — 타입 = select = 현실**: row 타입·SQL `select`·view 셋이 항상 같은 필드. row 타입은 "갖고 싶은 필드"가 아니라 "쿼리가 실제 주는 필드". 셋이 어긋난 채 `as`로 덮으면 런타임 `undefined`가 새는 거짓말이 된다(읽기 경계 `data as Row`는 supabase 추론↔명명 타입의 정당한 trust-boundary 캐스팅으로 한정).
- **UI 컴포넌트는 자기가 그리는 최소 모양만 받는다**: `entities/post/ui`의 카드는 `PostCardView`(= `Pick<PostResponse, …>`)를 prop으로 받음 → 그 필드를 가진 어떤 view든 주입 가능.
- **소유 엔티티 vs 조인된 외부 애그리거트**: 소유 자식(study의 post·participant)은 풀 재사용도 무방. 조인된 _다른_ 애그리거트(study 쿼리 속 creator=Profile)는 사적 필드(bio/points 등)까지 끌어오지 말고 `Pick`으로 좁힐 것.

### 5-d. `entities/*/ui/` 규칙

- 데이터를 props로만 받음.
- fetch / mutation 직접 호출 X.
- `useState`는 순수 UI 효과(호버, 토글)만.
- 액션 자리는 slot으로 비움 (`rightSlot?: ReactNode`).

### 5-e. `features/*/api/` 규칙 (Use Case = App Service)

`*Action`은 헥사고날 아키텍처의 **App Service**. domain(`model`/`service`)과 persistence(`entities/*/api`) **둘 다** 호출한다.

UseCase를 별도 파일로 추출할 때 3원칙:

UseCase로 추출한다면 다음 3원칙 준수. 안 지키면 분리 의미 없음.

1. **부수효과를 받는다, 일으키지 않는다** — `Deps`를 파라미터로 받기 (`createClient`, `new Date()` 직접 호출 X)
2. **Next.js를 모른다** — `revalidatePath`, `redirect`는 액션에만. UseCase는 결과만 반환
3. **Throw 대신 `Result` 반환** — 에러를 타입에 드러냄

```typescript
// features/participant-accept/application/acceptParticipantUseCase.ts
export const acceptParticipantUseCase =
    (
        deps: { studyRepo: StudyRepository; now: () => Date } // ← 원칙 1
    ) =>
    async (cmd): Promise<Result<void, AcceptFailure>> => {
        // ← 원칙 3
        // Next.js 코드 없음                                         ← 원칙 2
    }
```

### 5-f. UseCase 추출 기준

| 추출 권장                                | inline 유지                |
| ---------------------------------------- | -------------------------- |
| 분기/검증 단계 3개 이상                  | 단일 호출 (`sb.rpc` 한 번) |
| 외부 호출 2개 이상 조정 (Repo + 알림 등) | 단순 조회                  |
| 테스트하고 싶음                          | 본문이 10줄 이하           |
| 시나리오 본문 30줄 이상                  | 한 함수로 빼는 게 우스움   |

---

## 6. 의존성 방향 규칙

```
app/  →  widgets  →  features  →  entities  →  shared
```

### 6-a. Layer Import Rule (FSD 공식)

- Slice 내부 모듈은 **자신보다 아래 Layer의 Slice만** import한다 (`app → widgets → features → entities → shared`, 위→아래 단방향).
- **Slice 격리**: 같은 Layer의 다른 Slice는 import 금지 (`features/post-create`가 `features/post-edit` 못 부름). 목표는 **Zero 결합 + 높은 응집**.
- `shared`·`app`은 **Slice가 없다** (shared=비즈니스 로직 없음, app=앱 전체라 다시 나눌 의미 없음). `shared`는 다른 어떤 것도 import 안 함.

### 6-b. entities 내부 방향

- `Participant/service` → `Study/service` → `Study/model` (sub-VO 직접 노출 금지)
- `entities/user` (`UserId`) — 공유 VO, 여러 entity에서 직접 import OK
- `entities/study`가 `entities/post`를 import? 가능하지만 최소화

### 6-c. Slice 이름 · Slice Group · Public API (FSD 공식)

- **Slice 이름은 고정 규칙이 없다** — 앱의 비즈니스 도메인에 맞춰 자유롭게 정함. `study-create`(플랫), `study/create`(그룹), `participant-apply` 모두 정식. → "플랫만 정통"은 틀린 말. 다만 앱 안에서 **한 컨벤션으로 일관**되게(취향 문제, FSD 규칙 아님).
- **Slice Group**: 연관 높은 Slice들을 폴더로 묶을 수 있다 (`features/study/{create,edit,delete}`). **단, 그룹으로 묶어도 격리 규칙은 그대로** — 그룹 내부라고 `study/create`↔`study/edit` 코드 공유가 허용되는 게 **아니다**.
- **Slice Public API Rule**: 각 Slice는 외부 노출용 **Public API(`index.ts`)** 를 정의하고, 외부는 내부 파일에 직접 접근하지 않고 Public API로만 접근한다. (→ 이 프로젝트는 Phase 0에서 `index.ts`를 **의도적으로 보류** 중 = FSD 정식 규칙을 아직 안 지키는 지점.)

→ Phase 1에서는 수동 준수. 익숙해진 후 ESLint(`eslint-plugin-boundaries`)로 강제 가능.

### 6-d. 에러 전파 (Result) convention

에러는 **가장 깊은 VO에서 origin을 한 번만 정의**하고, 위로는 **버블링(통과)** 시킨다. 변환은 *경계*에서만.

- **origin 정의**: 가장 깊은 VO가 자기 에러를 소유. 전이 에러는 generic `InvalidTransition` + `from`/`to` payload(각 연산의 `to`가 달라 맥락 복원). → kind는 **연산별 granular + 체인 전체에서 unique**.
- **Aggregate 안 = 통과(passthrough)**: 같은 Ubiquitous Language. `return next`로 origin을 그대로 올림(재정의·래핑 X). 예: `Participant.accept` → `ParticipantStatus.accept` 통과.
- **Aggregate/컨텍스트/UI 경계 = 번역(ACL)**: 다른 Aggregate의 에러를 통과시키지 않는다. 정책이 자기 kind로 갈아입힌다. 예: `hostAccept`가 Study 사실을 `NotHost`/`StudyNotActive`로 번역.
- **action = 버블 정지 → UI 메시지**: origin kind를 메시지로 매핑. **reachable kind만** case로(호출 체인 추적) + `default`. 연산별 메시지 필요하면 `from`/`to`로 분기.
- **plumbing/버그류**(`Capacity`의 `NegativeCurrent` 등)는 사용자 에러가 아니라 버그 → 경계에서 collapse(일반 메시지).

판별 3줄:

1. **유니온 vs 래핑** — action의 `kind` switch까지 저수준 유니온이 _새면_ 막아라(번역). `cause` 안 유니온은 아무도 switch 안 하니 둬도 됨.
2. **래핑 vs 통과** — 래퍼 kind에 _의미 있는 새 이름_(위치/도메인 이유)을 못 지으면(타입 이름 echo면) 감싸지 말고 통과/유니온.
3. **결합 측정** — "참조가 있냐"가 아니라 **"바뀌면 거기도 고쳐야 하냐"**. 통과는 결합을 Aggregate 안으로 한정, 경계 번역이 결합을 차단.

---

## 7. 마이그레이션 매핑 표

| 현재 파일                                              | 새 위치                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| `app/`                                                 | `app/` (그대로)                                                  |
| `actions/postAction.ts` → `createPost`                 | `features/post-create/api/createPostAction.ts`                   |
| `actions/postAction.ts` → `updatePost`                 | `features/post-edit/api/updatePostAction.ts`                     |
| `actions/postAction.ts` → `deletePost`                 | `features/post-delete/api/deletePostAction.ts`                   |
| `actions/postAction.ts` → `toggleLike`                 | `features/post-like-toggle/api/toggleLikeAction.ts`              |
| `actions/postAction.ts` → 조회들                       | `entities/post/api/usePostDetail.ts` 등                          |
| `actions/participantAction.ts` → `applyParticipant`    | `features/participant-apply/api/applyParticipantAction.ts`       |
| `actions/participantAction.ts` → `acceptParticipant`   | `features/participant-accept/api/acceptParticipantAction.ts`     |
| `actions/participantAction.ts` → `rejectParticipant`   | `features/participant-reject/api/rejectParticipantAction.ts`     |
| `actions/participantAction.ts` → `removeParticipant`   | `features/participant-remove/api/removeParticipantAction.ts`     |
| `actions/studyAction.ts`                               | `features/study-*/api/`, `entities/study/api/`                   |
| `components/ui/`                                       | `shared/ui/`                                                     |
| `components/posts/detail/SidebarSection.tsx`           | `widgets/post-detail-sidebar/ui/SidebarSection.tsx`              |
| `components/posts/create/CreateForm.tsx`               | `features/post-create/ui/CreatePostForm.tsx`                     |
| `components/posts/MainSection.tsx`                     | `widgets/post-list/ui/PostList.tsx` (또는 분리)                  |
| `components/studies/detail/TabSection.tsx`             | `widgets/study-detail-tabs/ui/TabSection.tsx`                    |
| `hooks/usePost.tsx` → `useGetMyPosts` 등 조회          | `entities/post/api/`                                             |
| `hooks/usePost.tsx` → `useCreatePost` 등 mutation      | `features/post-*/model/`                                         |
| `hooks/useParticipant.tsx` → `useParticipant` 조회     | `entities/participant/api/useParticipant.ts`                     |
| `hooks/useParticipant.tsx` → `useApplyParticipant` 등  | `features/participant-*/model/`                                  |
| `hooks/useStorage.tsx`                                 | `shared/api/supabase/useStorage.ts`                              |
| `hooks/use-chat-scroll.tsx`                            | `shared/hooks/use-chat-scroll.ts`                                |
| `lib/parseFormData.ts`                                 | `shared/lib/parseFormData.ts`                                    |
| `lib/posts/buildPostInsert.ts`                         | `features/post-create/lib/` 또는 `entities/post/lib/`            |
| `lib/posts/uploadPostImages.ts`                        | `entities/post/api/uploadImages.ts` 또는 `features/post-create/` |
| `lib/zod/schemas/postSchema.ts`                        | `entities/post/model/schema.ts`                                  |
| `lib/supabase/server.ts`, `client.ts`                  | `shared/api/supabase/`                                           |
| `lib/reactQuery/queryKeys.ts`                          | `shared/api/queryKeys.ts`                                        |
| `lib/constants/region.ts`, `study-category.ts`         | `shared/config/`                                                 |
| `types/postType.ts`                                    | `entities/post/model/types.ts`                                   |
| `types/studiesType.ts`                                 | `entities/study/model/types.ts`                                  |
| `types/participantType.ts`                             | `entities/participant/model/types.ts`                            |
| `types/actionType.ts`                                  | `shared/kernel/types.ts`                                         |
| `types/file.ts`                                        | `shared/kernel/types.ts` 또는 `entities/post/model/`             |
| `utils/auth.ts`                                        | `shared/lib/auth.ts`                                             |
| `utils/cn.ts`, `format.ts`, `date.ts`, `validation.ts` | `shared/lib/`                                                    |
| `utils/conversion/`                                    | `shared/lib/conversion/`                                         |

---

## 8. Phase별 도입 로드맵

### Phase 0 — 사전 결정 사항

- [x] `src/` 사용 여부 → **미사용** (`@/*` → `./*` 그대로 유지, 마이그레이션 비용 최소화)
- [ ] `index.ts` 배럴 파일(= FSD **Slice Public API**) → **처음엔 미사용**(정식 규칙을 의도적으로 보류), Slice 안정되면 추가
- [ ] 옛 폴더 정책 → 새 코드는 새 폴더에, 옛 코드는 **수정할 때만** 이동

### Phase 1 — 기반 타입 + 첫 Value Object (이번 주)

**딱 6개 파일만 생성. 빈 폴더는 만들지 않음.**

```
shared/kernel/
  Result.ts                 ← 새 파일
  Id.ts                     ← 새 파일
  types.ts                  ← ActionResponse를 여기로 이동

entities/study/model/
  Capacity.ts               ← 🥇 첫 Value Object
  StudyStatus.ts            ← 판별 유니온
  ParticipantStatus.ts      ← 판별 유니온
```

목표: VO 패턴 + 판별 유니온 패턴 정립. 단위 테스트도 같이 작성.

### Phase 2 — 첫 Aggregate + Repository (다음 주)

```
entities/study/model/
  Study.ts                  ← Aggregate (type + 순수 함수)
  Participant.ts
  errors.ts

entities/study/api/
  StudyRepository.ts        ← Repository type + Supabase 구현
```

목표: `acceptParticipant` 시나리오 1개를 Aggregate + Repository로 리팩터링. 기존 액션과 병렬로 두고 동작 검증.

### Phase 3 — 첫 FSD 분리 (다음 다음 주)

```
features/participant-accept/
  ui/AcceptButton.tsx
  model/useAcceptParticipant.ts
  api/acceptParticipantAction.ts   ← 새 Aggregate 사용

widgets/post-detail-sidebar/
  ui/SidebarSection.tsx            ← 분리된 entity 컴포넌트 사용

entities/study/ui/
  StudyStatusBadge.tsx
  StudyCapacityIndicator.tsx
```

목표: `SidebarSection.tsx`(115줄)를 entity + feature + widget으로 분리. 한 시나리오 end-to-end 완성.

### Phase 4 — 확산

- 나머지 액션(`applyParticipant`, `removeParticipant`, `updateStudy`)을 같은 패턴으로 이동
- `Post` 도메인도 같은 방식으로 적용
- 단순 액션(`toggleLike`, `increaseViewCount`)은 UseCase 없이 inline 유지

---

## 9. 자주 헷갈리는 것 정리

### Q1. 새로 만든 폴더 위치는 어떻게 정하나?

판별 알고리즘:

1. 도메인 의미 없음 + 액션 없음 → `shared/ui/`
2. 도메인 의미 있음 + 액션 없음 (단순 표현) → `entities/*/ui/`
3. 도메인 + 사용자 시나리오 트리거 (클릭하면 뭔가 변함) → `features/*/ui/`
4. 위 셋 이상을 조립한 큰 영역 → `widgets/*/ui/`

### Q2. hook은 어디에 두나?

| hook이 하는 일                            | 위치                |
| ----------------------------------------- | ------------------- |
| 도메인 데이터 조회 (useQuery)             | `entities/*/api/`   |
| mutation + 시나리오 (useMutation + toast) | `features/*/model/` |
| 도메인 무관 UI 유틸                       | `shared/hooks/`     |

→ 파일당 hook 1개 권장. 현재 `usePost.tsx`(8개 hook 묶음)는 분리됨.

### Q3. `useState`는 어디에 쓰나?

| 종류                               | 위치                   |
| ---------------------------------- | ---------------------- |
| 호버/접힘/드롭다운 등 순수 UI 상태 | entity 또는 feature OK |
| 폼 입력 상태, mutation 진행 상태   | feature                |
| 여러 컴포넌트가 공유               | widget 또는 page       |

### Q4. entity 컴포넌트에 클릭 액션을 못 넣으면?

**slot pattern** 사용:

```tsx
// entities/post/ui/PostCard.tsx
export function PostCard({
    post,
    rightSlot,
}: {
    post: Post
    rightSlot?: ReactNode
}) {
    return (
        <div>
            <h3>{post.title}</h3>
            <p>{post.likesCount}</p>
            {rightSlot}
        </div>
    )
}

// 호출처 (widget 또는 page)
;<PostCard post={post} rightSlot={<LikeButton postId={post.id} />} />
//                                  ↑ features/post-like-toggle/ui/
```

### Q5. UseCase는 항상 만드나?

**아니오. 다음 중 하나라도 해당될 때만 추출:**

- 분기/검증 단계 3개 이상
- 외부 호출 2개 이상 조정
- 테스트하고 싶음
- 본문 30줄 이상

단순 시나리오(`toggleLike`, `increaseViewCount`)는 액션에 inline OK.

### Q6. action이 repo를 호출하는 게 맞나? aggregate가 실행해야 하지 않나?

**action(Use Case)이 repo를 호출하는 게 맞다.** aggregate/`service`는 순수 도메인만 — Load/Save는 App Service 책임. 헥사고날에서 안쪽(domain)이 바깥(persistence)을 모른다.

### Q7. `model`과 `service`는 어떻게 나누나?

- **단일 VO** 규칙 → `model/` (`StudyStatus`, `Capacity`)
- **여러 VO/컬럼 조합** → `service/` (`canAcceptParticipant`)
- **Participant 기능 + Study 조건** → `Participant/service/` (Study는 `Study/service` 경유)

### Q8. `StudyStatus`를 Participant에서 직접 써도 되나?

**❌** 다른 aggregate의 sub-VO. `Study/service`의 `assertAllows…` / `canAccept…` 만 호출.

### Q9. Domain Service와 `entities/*/service`는 같은가?

이름만 같음. 여기서 `service` = **순수 도메인 연산 폴더** (인프라 service 아님). cross-aggregate는 **주도 aggregate의 `service/`** 에 둔다.

---

## 10. 부록: FP-DDD 핵심 패턴 코드 템플릿

### 10-a. Value Object (smart constructor + branded type)

```typescript
// entities/study/model/Capacity.ts
declare const CapacityBrand: unique symbol

export type Capacity = Readonly<{
    current: number
    max: number
}> & { readonly [CapacityBrand]: true }

const construct = (current: number, max: number): Capacity => {
    if (max < 1) throw new Error('max는 1 이상')
    if (current < 0) throw new Error('current는 0 이상')
    if (current > max) throw new Error('current ≤ max 위반')
    return { current, max } as Capacity
}

export const Capacity = {
    of: construct,
    isFull: (c: Capacity) => c.current >= c.max,
    hasRoom: (c: Capacity) => !Capacity.isFull(c),
    increment: (c: Capacity) => construct(c.current + 1, c.max),
    decrement: (c: Capacity) => construct(c.current - 1, c.max),
    canResizeTo: (c: Capacity, newMax: number) => newMax >= c.current,
}
```

### 10-b. 판별 유니온 + 상태 머신

```typescript
// entities/study/model/ParticipantStatus.ts
export type ParticipantStatus =
    | { kind: 'pending' }
    | { kind: 'accepted'; acceptedAt: Date }
    | { kind: 'rejected'; rejectedAt: Date }

export const ParticipantStatus = {
    pending: (): ParticipantStatus => ({ kind: 'pending' }),
    accepted: (at: Date): ParticipantStatus => ({
        kind: 'accepted',
        acceptedAt: at,
    }),
    rejected: (at: Date): ParticipantStatus => ({
        kind: 'rejected',
        rejectedAt: at,
    }),

    isPending: (s: ParticipantStatus): s is { kind: 'pending' } =>
        s.kind === 'pending',
    isAccepted: (
        s: ParticipantStatus
    ): s is { kind: 'accepted'; acceptedAt: Date } => s.kind === 'accepted',
}
```

### 10-c. Aggregate `model` + `service` 분리

```typescript
// entities/study/model/Study.ts — 타입·매핑만 (얇게)
export type Study = Brand<{ id: StudyId; status: StudyStatus; capacity: Capacity; ... }, 'Study'>

// entities/study/service/StudyMembership.ts — 여러 VO 조합
export const StudyMembership = {
  canAcceptParticipant: (s: Study): boolean =>
    StudyStatus.isRecruiting(s.status) && !Capacity.isFull(s.capacity),

  assertAllowsHostMemberManagement: (s: Study): Result<void, StudyStatusError> => {
    if (!StudyStatus.isRecruiting(s.status) && !StudyStatus.isCompleted(s.status)) {
      return err({ kind: 'InvalidStudyStatus', status: s.status.kind })
    }
    return ok(undefined)
  },
}

// entities/participant/service/ParticipantHostActions.ts — cross-aggregate (Participant 주도)
export const ParticipantHostActions = {
  kick: (p: Participant, study: Study, actorId: UserId): Result<Participant, ParticipantError> => {
    const host = UserId.isSelf(study.creatorId, actorId)
    if (!host.ok) return host
    const studyOk = StudyMembership.assertAllowsHostMemberManagement(study)
    if (!studyOk.ok) return studyOk
    return Participant.kick(p) // model — 단일 전이만
  },
}
```

### 10-d. Repository (함수 record + 부분 적용 DI)

```typescript
// entities/study/api/StudyRepository.ts
export type StudyRepository = {
    findById: (id: StudyId) => Promise<Result<Study, 'NotFound'>>
    findByParticipant: (id: ParticipantId) => Promise<Result<Study, 'NotFound'>>
    save: (study: Study) => Promise<Result<void, 'SaveFailed'>>
}

export const createSupabaseStudyRepository = (
    sb: SupabaseClient
): StudyRepository => ({
    findById: async (id) => {
        /* ... */
    },
    findByParticipant: async (id) => {
        /* ... */
    },
    save: async (study) => {
        const { error } = await sb.rpc('save_study_with_participants', {
            p_study: toStudyRow(study),
            p_participants: study.participants.map(toParticipantRow),
        })
        return error ? err('SaveFailed') : ok(undefined)
    },
})
```

### 10-e. UseCase (고차 함수, 선택)

```typescript
// features/participant-accept/application/acceptParticipantUseCase.ts
export const acceptParticipantUseCase =
  (deps: { studyRepo: StudyRepository; now: () => Date }) =>
  async (cmd: { participantId: number; hostId: string }): Promise<Result<void, ...>> => {
    const studyR = await deps.studyRepo.findByParticipant(ParticipantId.of(cmd.participantId));
    if (!studyR.ok) return studyR;

    const updatedR = acceptParticipant(
      studyR.value, ParticipantId.of(cmd.participantId), UserId.of(cmd.hostId), deps.now(),
    );
    if (!updatedR.ok) return updatedR;

    const saveR = await deps.studyRepo.save(updatedR.value);
    if (!saveR.ok) return saveR;

    return ok(undefined);
  };
```

### 10-f. Server Action (Use Case = App Service)

```typescript
// features/participant-kick/api/kickParticipantAction.ts
'use server'
export async function kickParticipantAction(participantId: number) {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    // … UserId / ParticipantId VO

    const loadP = await findParticipantById(supabase, participantIdVO)
    if (!loadP.ok) return { success: false, error: { message: '…' } }

    const loadStudy = await findStudyById(loadP.value.studyId)
    if (!loadStudy.ok) return { success: false, error: { message: '…' } }

    const kicked = ParticipantHostActions.kick(
        loadP.value,
        loadStudy.value,
        userIdVO
    )
    if (!kicked.ok) return { success: false, error: { message: '…' } }

    const saved = await updateParticipant(
        supabase,
        kicked.value /* guard: accepted */
    )
    if (!saved.ok) return { success: false, error: { message: '…' } }

    return { success: true }
}
```

---

## 11. 참고 자료

- 《Domain Modeling Made Functional》 — Scott Wlaschin (F# 기반이지만 TS에 그대로 적용 가능)
- 《도메인 주도 개발 시작하기》 — 최범균 (한국어 DDD 입문)
- Feature-Sliced Design 공식 문서 — https://feature-sliced.design/
- 프로젝트 자체 학습 노트 — `utils/exercise.md`

---

## 12. 변경 이력

| 날짜       | 내용                                                                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-23 | 최초 작성. Phase 1 시작 전 청사진 확정.                                                                                                                                                                                                   |
| 2026-05-25 | 도메인 모델 1차 완료 (Capacity, Status/Role VO, ID 타입, Study/Participant Aggregate). 단계별 학습 로그는 `docs/learning-log.md` 참고.                                                                                                    |
| 2026-06-04 | `entities/*/service` 도입. model/service/api 역할 분리, Read/Write 경로, Use Case(action)↔repo↔domain 계층, cross-aggregate 규칙 정리.                                                                                                    |
| 2026-06-10 | **feature 정의를 행위(action) 전용으로 확정** (정통 FSD). 순수 조회/표시는 features에서 제외 → `entities/*/api`(조회·가공) + `widgets`/`page`(조립). `getXxxView` 폐지. → `study-detail`/`participant-status` 등 조회성 폴더 재배치 대상. |
| 2026-06-10 | `entities/*/api`를 **command(Repository→VO) / query(Query→DTO·조회훅)** 두 측으로 명시 (CQRS). `model`은 DDD 순수 도메인 전용 → 조회 훅은 api/query측. ("model" 단어가 FSD↔DDD에서 겹쳐 생기던 이질감 정리.)                              |
| 2026-06-12 | FSD 공식문서 반영 — **Slice 이름 자유 / Slice Group / Slice Public API / Layer Import Rule** 명문화(6-a~c). `features/study/*` 같은 Slice Group은 정식(격리 규칙 유지 조건). "플랫만 정통"이라던 이전 메모 철회.                          |
| 2026-06-12 | **에러 전파 convention 확정(6-d)** — origin 1회 정의 → Aggregate 안 통과(passthrough) → 경계 번역(ACL) → action 매핑. 전이 에러는 generic `InvalidTransition`+from/to. participant(accept/reject/kick/policy)를 레퍼런스로 정렬 완료.     |
