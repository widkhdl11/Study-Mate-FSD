# study-mate 아키텍처

> Next.js + Supabase + TypeScript 풀스택 프로젝트의 폴더 구조 및 도메인 모델링 가이드.
> **FP + DDD(전술적) + FSD**를 이 프로젝트 규모에 맞게 부분 차용한 청사진.

---

## 0. 한 줄 요약

> **함수형 컴포넌트는 그대로, 도메인 레이어를 FP-DDD로 강화, 폴더 구조는 FSD(부분)로 재배치.**

- UI: 함수형 컴포넌트 + React Query (현재 유지)
- 도메인: `Readonly` + branded type + smart constructor + 순수 함수 (FP-DDD)
- 인프라: Repository 패턴으로 Supabase 격리
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
├─ entities/                         🆕 도메인 (model + api + ui)
│  ├─ study/
│  │  ├─ model/                      ← FP-DDD: type + 순수 함수
│  │  ├─ api/                        ← Repository + 조회 훅
│  │  ├─ ui/                         ← 표현 컴포넌트 (Presentational)
│  │  └─ lib/                        ← 도메인 헬퍼
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

### 3-c. `features/` — 사용자 시나리오 (앱의 명세서)

"사용자가 하는 한 가지 일"을 한 폴더에 모은 것.

```
features/participant-accept/
  ui/AcceptButton.tsx            ← 클릭 가능한 UI
  model/useAcceptParticipant.ts  ← React Query mutation 훅
  api/acceptParticipantAction.ts ← 'use server' (얇은 어댑터)
  application/                   ← (선택) 복잡한 시나리오만
    acceptParticipantUseCase.ts
  index.ts                       ← 외부에 노출할 것만 re-export
```

- **역할**: 한 시나리오의 UI + 훅 + 액션을 한 폴더에 응집.
- **들어가는 것**: 그 시나리오에만 쓰이는 모든 것.
- **들어가지 않는 것**: 여러 시나리오가 공유하는 도메인 모델(→ entity), 재사용 UI(→ entity ui).
- **`application/` 폴더 규칙**: 복잡할 때만 만듦. 단순 시나리오는 액션에 inline.
- **features 폴더 = 앱이 할 수 있는 일의 명세서**.

### 3-d. `entities/` — 도메인 (FP-DDD의 심장부)

도메인 개념(Study, Post, Participant ...) 단위로 모델 + 영속성 + 표현을 모은 곳.

```
entities/study/
  model/                         ← FP-DDD: type + 순수 함수
    Study.ts                     ← Aggregate 타입 + 순수 함수 (acceptParticipant 등)
    Participant.ts               ← Study 안의 자식 Entity
    Capacity.ts                  ← Value Object (branded type + 모듈)
    StudyStatus.ts               ← 판별 유니온 + 헬퍼
    ParticipantStatus.ts         ← 판별 유니온 + 헬퍼
    errors.ts                    ← AcceptError, ApplyError 등 판별 유니온
    types.ts                     ← DB row 매핑용 타입
  api/                           ← 영속성 + 조회 훅
    StudyRepository.ts           ← Repository type + Supabase 구현 함수
    useStudyDetail.ts            ← React Query 조회 훅
    useGetMyStudies.ts
    useGetMyCreatedStudies.ts
  ui/                            ← Presentational only (props만 받음)
    StudyCard.tsx
    StudyCapacityIndicator.tsx
    StudyStatusBadge.tsx
    StudyDetailLayout.tsx        ← slot pattern
  lib/                           ← 도메인 유틸 (헬퍼 함수)
  index.ts
```

#### 도메인 목록

| entity         | 비고                                         |
| -------------- | -------------------------------------------- |
| `study`        | Aggregate Root. Participant를 자식으로 가짐. |
| `post`         | Aggregate Root. PostImage(VO)를 포함.        |
| `participant`  | Study 자식이지만 단독 조회/UI도 있어 분리.   |
| `user`         | Auth 사용자. `UserId` 브랜드.                |
| `profile`      | 프로필 정보.                                 |
| `notification` | 알림.                                        |
| `chat-room`    | 채팅방.                                      |
| `message`      | 채팅 메시지.                                 |

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

## 4. 폴더 안의 규칙 (강제 사항)

### 4-a. `entities/*/model/` 규칙

- ✅ `Readonly<T>` + branded type
- ✅ 순수 함수만 (class 없음)
- ✅ `Result<T, E>` 반환 (throw는 smart constructor의 검증 실패뿐)
- ❌ Supabase 호출, fetch, `new Date()` 직접 사용 X
- ❌ `useState`, `useEffect` X (UI 코드 아님)

### 4-b. `entities/*/api/` 규칙

- Repository: 함수 record 패턴 (`{ findById, save, ... }`)
- 조회 훅(React Query)은 여기. mutation 훅은 feature로.
- Supabase 호출은 이 폴더 안에만.

### 4-c. `entities/*/ui/` 규칙

- 데이터를 props로만 받음.
- fetch / mutation 직접 호출 X.
- `useState`는 순수 UI 효과(호버, 토글)만.
- 액션 자리는 slot으로 비움 (`rightSlot?: ReactNode`).

### 4-d. `features/*/api/` 규칙 (UseCase 추출 시 3원칙)

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

### 4-e. UseCase 추출 기준

| 추출 권장                                | inline 유지                |
| ---------------------------------------- | -------------------------- |
| 분기/검증 단계 3개 이상                  | 단일 호출 (`sb.rpc` 한 번) |
| 외부 호출 2개 이상 조정 (Repo + 알림 등) | 단순 조회                  |
| 테스트하고 싶음                          | 본문이 10줄 이하           |
| 시나리오 본문 30줄 이상                  | 한 함수로 빼는 게 우스움   |

---

## 5. 의존성 방향 규칙

```
app/  →  widgets  →  features  →  entities  →  shared
```

- 위에서 아래로만 import
- 같은 레이어끼리 import 금지 (`features/post-create`가 `features/post-edit` 못 부름)
- `entities/study`가 `entities/post`를 import? 가능하지만 최소화 (강한 결합이면 합쳐야 할 신호)
- `shared`는 다른 어떤 것도 import 안 함

→ Phase 1에서는 수동 준수. 익숙해진 후 ESLint(`eslint-plugin-boundaries`)로 강제 가능.

---

## 6. 마이그레이션 매핑 표

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

## 7. Phase별 도입 로드맵

### Phase 0 — 사전 결정 사항

- [x] `src/` 사용 여부 → **미사용** (`@/*` → `./*` 그대로 유지, 마이그레이션 비용 최소화)
- [ ] `index.ts` 배럴 파일 → **처음엔 미사용**, entity 안정되면 추가
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

## 8. 자주 헷갈리는 것 정리

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

---

## 9. 부록: FP-DDD 핵심 패턴 코드 템플릿

### 9-a. Value Object (smart constructor + branded type)

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

### 9-b. 판별 유니온 + 상태 머신

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

### 9-c. Aggregate (type + 순수 함수)

```typescript
// entities/study/model/Study.ts
declare const StudyBrand: unique symbol

export type Study = Readonly<{
    id: StudyId
    creatorId: UserId
    title: string
    status: StudyStatus
    capacity: Capacity
    participants: ReadonlyArray<Participant>
}> & { readonly [StudyBrand]: true }

export type AcceptError =
    | { kind: 'NotHost' }
    | { kind: 'StudyCompleted' }
    | { kind: 'StudyFull' }
    | { kind: 'ParticipantNotFound' }
    | { kind: 'NotPending' }

export const acceptParticipant = (
    study: Study,
    participantId: ParticipantId,
    hostId: UserId,
    now: Date
): Result<Study, AcceptError> => {
    if (!UserId.equals(study.creatorId, hostId)) return err({ kind: 'NotHost' })
    if (StudyStatus.isCompleted(study.status))
        return err({ kind: 'StudyCompleted' })
    if (Capacity.isFull(study.capacity)) return err({ kind: 'StudyFull' })

    const target = study.participants.find((p) =>
        ParticipantId.equals(p.id, participantId)
    )
    if (!target) return err({ kind: 'ParticipantNotFound' })
    if (!ParticipantStatus.isPending(target.status))
        return err({ kind: 'NotPending' })

    return ok({
        ...study,
        capacity: Capacity.increment(study.capacity),
        participants: study.participants.map((p) =>
            ParticipantId.equals(p.id, participantId)
                ? { ...p, status: ParticipantStatus.accepted(now) }
                : p
        ),
    } as Study)
}
```

### 9-d. Repository (함수 record + 부분 적용 DI)

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

### 9-e. UseCase (고차 함수, 선택)

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

### 9-f. Server Action (얇은 어댑터)

```typescript
// features/participant-accept/api/acceptParticipantAction.ts
'use server'
export async function acceptParticipant(participantId: number) {
    const sb = await createClient()
    const { user } = await CustomUserAuth(sb)

    const run = acceptParticipantUseCase({
        studyRepo: createSupabaseStudyRepository(sb),
        now: () => new Date(),
    })

    const result = await run({ participantId, hostId: user.id })
    if (!result.ok) return toActionResponse(result)

    revalidatePath('/studies', 'layout')
    return { success: true }
}
```

---

## 10. 참고 자료

- 《Domain Modeling Made Functional》 — Scott Wlaschin (F# 기반이지만 TS에 그대로 적용 가능)
- 《도메인 주도 개발 시작하기》 — 최범균 (한국어 DDD 입문)
- Feature-Sliced Design 공식 문서 — https://feature-sliced.design/
- 프로젝트 자체 학습 노트 — `utils/exercise.md`

---

## 11. 변경 이력

| 날짜       | 내용                                    |
| ---------- | --------------------------------------- |
| 2026-05-23 | 최초 작성. Phase 1 시작 전 청사진 확정. |
