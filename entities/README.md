# entities/

> **도메인 개념 단위**의 모델 + 영속성 + 표현. FP-DDD의 심장부.

## 역할

이 앱이 다루는 명사(Study, Post, Participant, User ...) 각각에 대해
**"그게 무엇인지(model)"**, **"어떻게 저장/조회하는지(api)"**, **"어떻게 보여주는지(ui)"** 를 한 폴더에 모은다.

## 구조

```
entities/study/
  model/       ← FP-DDD: type + 순수 함수
    Study.ts             ← Aggregate (type + acceptParticipant 등)
    Participant.ts       ← Aggregate 내 Entity
    Capacity.ts          ← Value Object
    StudyStatus.ts       ← 판별 유니온
    ParticipantStatus.ts ← 판별 유니온
    errors.ts            ← 도메인 에러 판별 유니온
    types.ts             ← DB row 매핑용 타입
  api/         ← 영속성 + 조회 훅
    StudyRepository.ts   ← Repository type + Supabase 구현
    useStudyDetail.ts    ← React Query 조회 훅 (mutation은 features로)
  ui/          ← Presentational only
    StudyCard.tsx
    StudyCapacityIndicator.tsx
    StudyStatusBadge.tsx
  lib/         ← 도메인 헬퍼
  index.ts
```

## 폴더별 규칙

### `model/`

- ✅ `Readonly<T>` + branded type
- ✅ 순수 함수 (class 없음)
- ✅ `Result<T, E>` 반환 (throw는 smart constructor의 검증 실패뿐)
- ❌ Supabase 호출, fetch, `new Date()` 직접 사용 X
- ❌ `useState`, `useEffect` X (UI 코드 아님)

### `api/`

- Repository는 **함수 record 패턴**: `{ findById, save, ... }`
- 조회 hook(useQuery)은 여기. mutation hook은 `features/`로.
- Supabase 호출은 이 폴더 안에만.

### `ui/`

- 데이터를 props로만 받음.
- fetch / mutation 직접 호출 X (entity는 자기 데이터를 모름).
- `useState`는 순수 UI 효과(호버, 토글)만.
- 액션 자리는 slot으로 비움 (`rightSlot?: ReactNode`).

## 의존성 규칙

- entities는 **`shared/`만 import** 가능.
- entities 간 import는 가능하지만 **최소화** (강한 결합이면 합쳐야 할 신호).
- features/widgets/app은 entities를 자유롭게 import.

## 예정 도메인 목록

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

## 첫 작업

`entities/study/model/Capacity.ts` 부터.
"정원" 개념을 branded type + smart constructor로 모델링하면서 FP-DDD 패턴을 익힌다.
