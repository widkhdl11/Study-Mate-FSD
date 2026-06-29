# entities/

> **도메인 개념 단위**의 모델 + 영속성 + 표현. FP-DDD의 심장부.

## 역할

이 앱이 다루는 명사(Study, Post, Participant, User ...) 각각에 대해
**"그게 무엇인지(model)"**, **"어떻게 저장/조회하는지(api)"**, **"어떻게 보여주는지(ui)"** 를 한 폴더에 모은다.

| 폴더           | 역할                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| **`model/`**   | 타입·VO, **단일 VO** 생성·질의·전이, aggregate 매핑 (`fromRow`/`toRow`)        |
| **`service/`** | **여러 VO/필드 조합** 루트 규칙, cross-aggregate 시나리오(주도 aggregate 기준) |
| **`api/`**     | Repository(Write) · Query(Read) — **DB only**                                  |
| **`ui/`**      | props만 받는 표현                                                              |

> **`service` 주의**: 인프라/Nest service가 아님. **순수 도메인 연산** (DB·auth·`{ success, error }` 금지).

## 구조 예시

```
entities/study/
  model/
    Study.ts
    StudyStatus.ts
    Capacity.ts
    errors.ts
  service/
    StudyMembership.ts     # canAcceptParticipant, assertAllows…
  api/
    StudyRepository.ts
    queryStudyDetail.ts
  ui/
    StudyStatusBadge.tsx

entities/participant/
  model/
    Participant.ts           # kick(p), accept(p) — 단일 전이만
    ParticipantStatus.ts
    errors.ts
  service/
    ParticipantHostActions.ts    # kick, accept, reject
    ParticipantSelfActions.ts    # createDeleteIntent
  api/
    ParticipantRepository.ts
  ui/

entities/user/
  model/
    UserId.ts                # 공유 VO — 다른 entity에서 직접 import OK
```

## model vs service

| 넣는 곳     | 내용                              | 예                                                        |
| ----------- | --------------------------------- | --------------------------------------------------------- |
| **model**   | 단일 VO predicate·전이            | `StudyStatus.isRecruiting`, `Participant.kick(p)`         |
| **service** | status + capacity 등 **조합**     | `StudyMembership.canAcceptParticipant`                    |
| **service** | Participant 시나리오 + Study 조건 | `ParticipantHostActions.kick` → `StudyMembership.assert…` |

**바깥에서 `StudyStatus` 직접 import ❌** → `Study/service` 경유.

## 의존성

```
features/api (Use Case)
    ↓
Participant/service  ──→  Study/service
    ↓                           ↓
Participant/model         Study/model
```

- entities는 **`shared/`** import 가능.
- **entities 간**: `Participant/service` → `Study/service` ✅ / `Study/service` → `Participant` ❌
- **`UserId`**: `entities/user` 공유 VO — 직접 import ✅

## Read vs Write

|                   | Read                      | Write                                   |
| ----------------- | ------------------------- | --------------------------------------- |
| **api**           | `queryXxx.ts`             | Repository `find` / `update` / `delete` |
| **model/service** | 사용 안 함                | Load → service/model → Save             |
| **호출 주체**     | `features/api/getXxxView` | `features/api/*Action`                  |

### Write 도장

| 연산   | Save 인자                          |
| ------ | ---------------------------------- |
| insert | `ParticipantInsert` 등 Brand       |
| update | 전이된 VO + `guardStatus`          |
| delete | `DeleteParticipantIntent` 등 Brand |

## 폴더별 규칙

### `model/`

- ✅ `Readonly<T>` + branded type, `Result<T, E>`
- ❌ 여러 VO 조합 규칙, Supabase, 다른 aggregate sub-VO 직접 사용

### `service/`

- ✅ Load된 VO만 인자, `Result` bubble
- ❌ Repository, auth, UI 응답

### `api/`

- ✅ Supabase는 이 폴더만
- 조회 hook(useQuery)은 여기. mutation hook은 `features/`.

### `ui/`

- props only, slot pattern. mutation 직접 호출 ❌

## 도메인 목록

| entity        | 비고                                                   |
| ------------- | ------------------------------------------------------ |
| `study`       | Aggregate Root. `service/`에 status+capacity 루트 규칙 |
| `Participant` | Study 연관 시나리오는 `Participant/service/`           |
| `user`        | 공유 VO (`UserId`)                                     |
| `post`        | Aggregate Root                                         |

## model 구현 순서 (참고)

1. 타입 정의 (Brand / 판별 유니온)
2. 에러 정의 (`errors.ts`)
3. 생성자 (smart constructor)
4. 단일 VO 기능 모듈

여러 VO가 엮이면 → **`service/`로 이동**.
