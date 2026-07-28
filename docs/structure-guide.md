# FSD + DDD 구조 가이드 (study-mate)

> 헷갈릴 때 이 문서 하나만 본다. 규칙은 **하나로 통일.**
> 타입 세부는 [type-layers.md](./type-layers.md) 참고.

---

## 0. 레이어 & import 규칙 (하드 제약)

```
app > (pages=app route) > widgets > features > entities > shared
```

- **import는 위 → 아래만.** 같은 레이어끼리 ❌ (feature→feature, widget→widget 금지).
- 그래서 **여러 곳에서 쓸 것은 아래 레이어(entity)에** 둬야 모두 접근 가능.

| 레이어   | 역할                                                         |
| -------- | ------------------------------------------------------------ |
| app      | 라우팅, 전역 provider                                        |
| widgets  | 여러 feature/entity **조합**해 화면 블록 (Header, 상세 위젯) |
| features | **사용자 행위(쓰기 use-case)**: 폼+액션+훅                   |
| entities | **도메인**(타입·규칙) + **데이터 접근**(repo·query)          |
| shared   | 공용(ui kit, lib, api client, kernel)                        |

---

## 1. 무엇을 어디에 (한 장 요약)

| 종류                        | 위치                               |
| --------------------------- | ---------------------------------- |
| 쓰기(사용자 행위)           | `features/*`                       |
| 읽기 — 표시 DTO             | `entities/*/api/query`             |
| 읽기 — 도메인 VO (커맨드용) | `entities/*/api` (repo `findById`) |
| 도메인 타입·규칙·VO         | `entities/*/model`                 |
| 교차-aggregate 정책         | `entities/*/service`               |
| 조합/화면                   | `widgets/*`, `app/*/page`          |
| **supabase 접근**           | **`entities/*/api`에서만**         |
| 인증(누구냐)                | `shared/lib/auth` (caller가 호출)  |

---

## 2. entities/\* 내부 구조 (확정)

```
entities/study/
  model/          ← 도메인 (supabase import ❌)
    Study.ts        aggregate + createNew/update/delete + toRow/toInsertRow/fromRow
    StudyId.ts, Capacity.ts, StudyStatus.ts   VO
    types.ts        Response(DTO) 타입 + toStudyView 매퍼 + Row 타입
    studyFormSchema.ts   Command 스키마(z.infer)
  api/            ← DB 접근 (supabase import ✅ 여기서만)
    StudyRepository.ts   쓰기 + VO읽기(findById/insert/update/delete)
    query/               표시 읽기 (아래 §3)
  service/        ← 도메인 서비스 (교차 aggregate 정책)
    StudyPolicy.ts
  ui/             ← 순수 표시 컴포넌트 (StudyCard)
  index.ts        ← Public API 배럴 (외부는 이것만 import)
```

---

## 3. 읽기 슬라이스 구조 (핵심 — feature처럼 폴더로)

읽기 하나 = **한 폴더**에 query + 훅 + types 응집. **row/view/toView 3파일로 쪼개지 말 것.**

```
entities/study/api/query/
  detail/
    queryStudyDetail.ts   supabase fetch + toView (서버)
    useStudyDetail.ts     읽기 훅(useQuery) — 읽기 훅은 항상 여기!
    types.ts              Row + View + toView  (작으면 1파일, 크면 분리)
  recruitable/
    ...
```

- **작으면** query 파일 하나에 다 넣어도 됨. **커지면** types.ts 분리.
- **"action"은 읽기에 없음** (쓰기 개념). 읽기 폴더 = query + hook + (필요시 SSR loader) + types.

---

## 4. 매퍼 4종 (fromRow vs toView 혼동 종결)

| 매퍼                  | 방향                           | 누가 씀                           |
| --------------------- | ------------------------------ | --------------------------------- |
| `toInsertRow`         | Insert(VO) → InsertRow(snake)  | repo **insert**                   |
| `toRow`/`toUpdateRow` | Aggregate → Row(snake)         | repo **update**                   |
| **`fromRow`**         | Row(snake) → **Aggregate(VO)** | **repo `findById`** (읽기→도메인) |
| **`toView`**          | Row(snake) → **View(DTO)**     | **query** (읽기→표시)             |

- **읽기가 두 갈래** → 매퍼도 둘: 도메인 읽기=`fromRow`, 표시 읽기=`toView`.
- **view는 fromRow 안 씀** (DTO가 필요하니 toView). 서로 안 섞임.

---

## 5. repo vs query

|      | repo (`api/XRepository`)          | query (`api/query`)       |
| ---- | --------------------------------- | ------------------------- |
| 반환 | **Aggregate (VO)**                | **View (DTO, primitive)** |
| 매퍼 | `fromRow`                         | `toView`                  |
| 용도 | 커맨드(쓰기 + 도메인 로직용 읽기) | 표시                      |

> **VO/aggregate 필요 → repo. 화면 DTO → query.** (조인 여부 무관)

---

## 6. 훅: 읽기 vs 쓰기 (흩어짐 종결)

| 훅                    | 위치                                  |
| --------------------- | ------------------------------------- |
| **읽기(useQuery)**    | `entities/*/api/query/<read>/useX.ts` |
| **쓰기(useMutation)** | `features/*/<action>/model/useX.ts`   |

→ **읽기 훅은 entity, 쓰기 훅은 feature.** widget에 훅 두지 말 것(위젯은 훅을 _써서_ 렌더만).

---

## 7. 반환 타입: Result vs ActionResponse

| 레이어                              | 반환                             |
| ----------------------------------- | -------------------------------- |
| model / repo / query / service      | **Result<T, E>**                 |
| **feature action** (`'use server'`) | **ActionResponse** ← 여기서 변환 |

- **action 아래는 전부 Result.** action이 마지막에 Result→ActionResponse로 번역(에러타입→유저메시지).
- query도 Result (서버액션 아니니 ActionResponse ❌). page/hook이 Result 처리.

---

## 8. 타입 네이밍 (통일)

| 개념                | 이름                      | 위치               |
| ------------------- | ------------------------- | ------------------ |
| aggregate 전체 속성 | `XxxProps`                | model              |
| 신규 생성 인자      | `CreateXxxProps`          | model              |
| 수정 인자           | `UpdateXxxProps`          | model              |
| aggregate           | `Xxx` (Brand)             | model              |
| DB row (snake)      | `XxxRow`                  | model              |
| 클라 입력(z.infer)  | `XxxCommand`              | model(schema)      |
| 표시 출력(DTO)      | `XxxResponse` / `XxxView` | model/types, query |

- **복수형 배열 별칭 금지**: `Studies...` ❌ → `StudyResponse[]`.
- export 경계 = `XxxCommand`(입력) ↔ `XxxResponse`(출력). 나머지 내부.

---

## 9. VO 배치

- **Brand VO(UserId/StudyId/Capacity...)** = model 안(aggregate/Props). Row/Response/Command는 **원시값**.
- **plain 값(ImageUrl `{id,url,...}`)** = 어디나 OK, 업로드 전엔 `File`.
- **`ImageUrl` vs `string` = DB 저장형이 결정** (avatar=string 경로, post이미지=ImageUrl[] jsonb).
- **VO는 진짜 불변식/식별자에만** — 닫힌 코드(gender, status)는 **union**, Brand ❌. 불변식 없으면 aggregate/construct도 생략(예: Notification).

---

## 10. 커맨드 흐름 (쓰기 표준)

```ts
// features/x/api/xAction.ts ('use server') → ActionResponse
1. auth        const { user } = await CustomUserAuth(supabase)
2. validate    const c = validate(schema, cmd)              // Result
3. VO          const idVO = XId.of(...)                     // Result
4. load        const agg = await findById(supabase, idVO)   // Result (aggregate)
5. policy      const intent = Policy.xIntent(agg, ...)      // Result
6. write       await repoWrite(supabase, intent.value)      // Result
7. revalidate/redirect (+ side-effect: createNotification)
```

- **커맨드마다 findById로 aggregate 로드는 정상**(load→판단→저장). 중복 아님(같은 함수 재사용).

---

## 11. side-effect (알림 / 조회수)

- **query에 write 절대 넣지 마** (순수·멱등).
- 조회 시 업데이트 = **읽기(query) + 별도 write**:
    - mutation(조회수+1, 읽음처리) → **entity repo**.
    - 트리거(언제) → 클라 훅 / 페이지.
- **알림 생성**: `createNotification(supabase, {..., ctx})` = **entity(저장, ctx는 인자로)**. enrich(이름 조회)+트리거 = **feature 액션**(이미 로드한 데이터 재사용). entity가 study/user 조회 ❌(entity→entity).

---

## 12. 결정 트리

**읽기 위치**

```
여러 엔티티 가로지름? → widget/page 조합 (각 query 모음)
aggregate(VO) 반환?  → repo findById
표시 DTO?           → entities/api/query/<read>/
```

**feature냐 entity냐**

```
데이터를 바꾸나(mutation)? → feature(action) + entity(repo write)
개념 데이터 조회?         → entity (query 또는 repo)
개념 지식(규칙/타입)?      → entity(model)
```

---

## 13. DO / DON'T

**DO**

- supabase는 `entities/*/api`에만.
- 읽기=entity(query/repo), 쓰기=feature, 조합=widget/page.
- 읽기 훅=entity, 쓰기 훅=feature.
- Result(내부) → ActionResponse(action 경계).
- 읽기 폴더에 query+hook+types 응집(파일 과분할 X).

**DON'T**

- ❌ feature→feature, widget→widget import.
- ❌ query에 write / VO 재구성(fromRow)은 repo.
- ❌ `as`로 select와 어긋난 타입 우기기(여분 필드 유출).
- ❌ 복수형 배열 타입(`Studies...`).
- ❌ 불변식 없는데 aggregate/VO 남발.

> **한 줄: 개념(읽기·규칙·데이터접근)은 entity, 행위(쓰기)는 feature, 조합은 widget. supabase는 entity/api에만. Result는 내부, ActionResponse는 경계.**
