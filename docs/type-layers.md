# 타입 레이어 — 전체 정리

엔티티 하나에 타입이 여러 개인 이유: **데이터가 흐르며 모양·신뢰·소유가 바뀌기 때문.**
한 번에 보자.

---

## 0. 전체 흐름 (쓰기 → DB → 읽기 → 표시)

```
■ 쓰기 (클라 입력 → 저장)
[Request]                     클라 폼 입력 (primitive, 편집 subset, 미신뢰)   ← export
   │  validate(zod) + VO.of()  (+ 서버: authorId/creatorId 주입, 이미지 업로드)
   ▼
[CreateNewParams]             신규 생성 인자 (VO, subset)                      내부
   │  Aggregate.createNew
   ▼
[Insert(Brand)]               저장용 도메인 (VO, id/dates/counts 없음)         내부
   │  toInsertRow (camel→snake, VO 언팩)
   ▼
[InsertRow]                   INSERT용 snake (primitive)                       내부
   ▼  supabase.insert
  DB

■ 읽기 (DB → 도메인/표시)
  DB
   ▼  select
[Row]                         DB 거울 (snake, 전체, primitive)                 내부
   ├─ fromRow ─ VO.of로 [CreateParams] 채워 → construct → [Aggregate(Brand)]   ← repo (VO, 커맨드용)
   └─ toView ─────────────────────────────────▶ [Response]                    ← query (DTO, 표시용) export
```

핵심 쌍: **export 되는 경계 = `Request`(입력) ↔ `Response`(출력).** 나머지는 전부 내부.

---

## 1. 마스터 표

| 타입 | 방향/용도 | export | 네이밍 | id | 이미지 | VO | 신뢰 | 쓰는 함수 |
|---|---|---|---|---|---|---|---|---|
| **Request** (=FormValues) | 클라→서버 입력 | ✅ | camel | `string`/`number` | `File` | ❌ 원시 | ❌ 미신뢰 | 폼 + action |
| **CreateNewParams** | 신규 생성 인자(subset) | ❌ | camel | `UserId` 등 | `ImageUrl` | ✅ VO | ✅ | `createNew` |
| **Insert (Brand)** | 저장용 도메인 | (배럴) | camel | VO | `ImageUrl[]` | ✅ VO | ✅ | `createNew`→repo |
| **InsertRow** | INSERT용 snake | ❌ | **snake** | `string`/`number` | DB형 | ❌ 원시 | ✅ | `toInsertRow`→insert |
| **CreateParams** | 복원/전체 생성 인자 | ❌ | camel | VO | `ImageUrl[]` | ✅ VO | ✅ | `construct`/`fromRow`/`update` |
| **Aggregate (Brand)** | 항상 유효한 도메인 | (배럴) | camel | VO | `ImageUrl[]`/`string` | ✅ VO+Date | ✅ | 도메인/커맨드 |
| **Row** | DB 거울(select) | ❌ | **snake** | `string`/`number` | DB형 | ❌ 원시 | ✅ DB | `fromRow`/`toView` |
| **Response (DTO)** | 서버→클라 표시 | ✅ | camel | `string`/`number` | DB형 | ❌ 원시 | ✅ | query → UI |

**한눈 요약**
- **VO(Brand)** = `Insert`/`CreateParams`/`Aggregate` (도메인 안)에만. 경계(Request/Row/Response)는 **원시값**.
- **camel** = 도메인·클라(Request/Aggregate/Response). **snake** = DB(Row/InsertRow).
- **export** = `Request`·`Response`(경계 계약) + Aggregate(배럴). 나머지 내부.

---

## 2. 비슷해 보이는 것들 구분 (헷갈림 포인트)

| 비교 | 같은 점 | 다른 점 |
|---|---|---|
| **Request vs CreateNewParams** | 편집 필드(title 등) 겹침 | Request=원시·미신뢰·File / CreateNewParams=VO·creatorId(auth서 추가)·ImageUrl |
| **Request vs Response** | 일부 표시 필드 겹침 | Response=전체+권위필드(id/counts/status/dates)+신뢰 / Request=subset·미신뢰 |
| **CreateNewParams vs CreateParams** | 둘 다 VO | NewParams=신규 subset(status/counts/id 없음) / CreateParams=복원 full(전부) |
| **Row vs Response** | 필드 1:1 | Row=snake(DB) / Response=camel(앱). `toView`로 변환 |

> 절대 합치면 안 되는 것: **Request ↔ Response** (입력 미신뢰 subset vs 출력 전체 권위). 합치면 클라가 id/counts/status 주입 가능 = 무결성 위반.

---

## 3. VO 규칙

- **Brand VO** (`UserId`, `StudyId`, `PostId`, `Capacity`, `Gender`, `StudyStatus`):
  - **도메인 안(Insert/CreateParams/Aggregate)에만.** 경계(Request/Row/Response)는 원시값(string/number).
  - 경계에서 도메인으로: `VO.of()` (validate). 도메인에서 경계로: 언팩(`capacity` → `max/current`).
- **plain 값 타입** (`ImageUrl = {id,url,originalName,size}`): Brand 아님 → 직렬화됨 → Row(jsonb)/Response/Aggregate 그대로. **업로드 전엔 `File`**.
- **`ImageUrl` vs `string`** = DB 저장형이 결정. 경로 string 저장(avatar)=`string`, jsonb 객체(post이미지)=`ImageUrl[]`. ("타입=select=현실")

---

## 4. Study 전체 예시 (모든 VO 등장: StudyId·UserId·Capacity·StudyStatus)

```ts
// ── 경계: 입력 (export) ──
type StudyCreateRequest = {        // = FormValues
  title: string
  description: string
  studyCategory: string
  region: string
  maxParticipants: number          // 원시
}                                  // creatorId/id/status/counts/dates ❌

// ── 내부: 신규 생성 인자 (VO subset) ──
type CreateNewParams = {
  creatorId: UserId                // ← auth서 주입, VO
  title: string
  description: string
  studyCategory: string
  region: string
  maxParticipants: number
}                                  // status/currentParticipants/id ❌ (도메인 default)

// ── 내부: 복원/전체 생성 인자 (VO full) ──
type CreateParams = {
  id: StudyId
  creatorId: UserId
  title: string
  description: string
  studyCategory: string
  region: string
  capacity: Capacity               // ← max+current 묶은 VO
  status: StudyStatus              // ← VO
  createdAt: Date
  updatedAt: Date
}

// ── 도메인 (Brand) ──
type Study = Brand<{
  id: StudyId; creatorId: UserId
  title: string; description: string; studyCategory: string; region: string
  capacity: Capacity; status: StudyStatus
  createdAt: Date; updatedAt: Date
}, "Study">

// ── DB 거울 (snake, 원시) ──
type StudyRow = {
  id: number
  creator_id: string
  title: string; description: string; study_category: string; region: string
  max_participants: number         // capacity 언팩
  current_participants: number
  status: string                   // StudyStatus 언팩
  created_at: string; updated_at: string
}

// ── 경계: 출력 DTO (camel, 원시, export) ──
type StudyResponse = {
  id: number
  creatorId: string                // VO 아님
  title: string; description: string; studyCategory: string; region: string
  maxParticipants: number
  currentParticipants: number
  status: string
  createdAt: string; updatedAt: string
}
```
(Post는 `imageUrl: ImageUrl[]`(폼은 `images: File[]`), User/Profile은 `avatarUrl: string`만 다르고 구조 동일.)

---

## 5. 매퍼 (레이어 잇기)

| 매퍼 | 방향 | 어디 |
|---|---|---|
| `validate(zod)` + `VO.of()` | Request → CreateNewParams | action/createNew |
| `Aggregate.createNew` | CreateNewParams → Insert | model |
| `toInsertRow` | Insert → InsertRow (camel→snake, VO언팩) | model |
| `fromRow` | Row → Aggregate (snake→camel, VO재구성) | model (repo가 사용) |
| `toView` | Row → Response (snake→camel) | api/query |

- **repo 읽기** = `Row → fromRow → Aggregate(VO)` (커맨드용)
- **query 읽기** = `Row → toView → Response(DTO)` (표시용)

---

## 6. DO / DON'T

**DO**
- VO는 도메인(Insert/CreateParams/Aggregate)에만, 경계는 원시값.
- `ImageUrl` vs `string`은 DB 저장형으로. 이미지 입력은 `File`.
- Row=snake(=select), Response=camel, 사이는 `toView`.
- 읽기: 커맨드용=repo(VO), 표시용=query(DTO).
- 신규 생성=CreateNewParams(subset), DB복원=CreateParams(full).

**DON'T**
- ❌ **Request ↔ Response 합치기** (입력 subset/미신뢰 vs 출력 전체/권위). 클라가 id/counts/status 주입 위험.
- ❌ Row/Response/Request에 Brand VO 넣기 (경계는 원시값).
- ❌ `as`로 select(=DB 현실)와 어긋난 타입 우기기 (누락 필드 숨김 금지).

> **한 줄: VO는 도메인 안에만 · 경계는 원시값 · 입력(Request)과 출력(Response)은 분리 · 타입=select=현실.**
