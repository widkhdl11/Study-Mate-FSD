# entities 정리 체크리스트

> [structure-guide.md](./structure-guide.md) 기준으로 실제 코드를 훑은 결과.
> 우선순위: 🔴 필수 → 🟡 정리 → 🟢 사소 → 🔵 검토.

---

## 📊 진행 현황 (2026-07-02)

**타입에러(tsc): 27 → 0 ✅ GREEN** · **query층 next/headers 유출원 0 ✅** · **A~G 전부 완료 🎉**

- **A (DI)**: ✅ **완료** — 전 query가 `(supabase, ...)` 주입. 서버 `createClient`·`'use server'` query층에서 전멸(getParticipantStatus·queryStudyDetail stray directive 포함). CSR 훅은 브라우저 client 주입.
- **B (Result)**: ✅ **완료** — query층 반환 전부 Result (ActionResponse/raw/`|null` 잔존 0). Brief 2개는 삭제.
- **C (읽기 훅 이동)**: ✅ **완료** — useIsLiked + queryIsLiked를 entity로, useToggleLike(write)는 feature 유지.
- **D (폴더 통합)**: ✅ **완료** — 로컬 타입→`types.ts`, 매퍼→query 인라인, row/view/toView 삭제. loginVerify 중복 정의(ProfileResponse·MyProfileCountResponse) 제거.
- **E (네이밍)**: ✅ **완료** — fn `queryXxx` 통일, 폴더 `get*` 접두 제거.
- **F (구조 통일)**: ✅ **완료** — participant query flat→`participantStatus/` 폴더.
- **G (검토)**: G-1 ✅ `loginVerify`→`currentUser` 전 도메인 리네임 / G-2(getImageUrl 위치)는 위반 없어 보류.
- **빌드-그린 트랙** (A~G 밖): **완료** — 아래 참고

> ⚠️ tsc는 green이나 `next build`(lint+route 검증)는 미확인. 배포 전 확인 필요.

---

## 🔴 A. DI 통일 (supabase param) — 안전+기능

study는 param화 됐지만 나머지는 **내부 `createClient`** → 배럴로 클라 번들에 `next/headers` 샐 위험. `(supabase, ...)`로 받고 caller가 client 전달.

- [x] `queryMyProfile()` → `(supabase, userId)` ✅ (5 caller repoint + NotFound 추가)
- [x] `queryMyNotification()` → `(supabase, userId)` ✅ (CSR훅에 브라우저 client 주입, B도 동시)
- [x] `queryPostDetail(id)` → `(supabase, id)` ✅ (usePostDetail 훅 + page 주입)
- [x] `queryGetAllPosts()` → `(supabase)` ✅ (posts/page + LatestSection)
- [x] `queryMyPostsWithStudy()` → `(supabase, userId)` ✅ (profile ProfileTabsLoader)
- [x] `queryGetMyStudies()` → `(supabase, userId)` ✅ (profile + posts/create·edit, create는 async 전환)
- [x] `queryLoginVerify()` → `(supabase)` ✅ (Header + useLoginVerify 브라우저 client)
- [x] `getParticipantStatus()` → `(supabase, studyId)` ✅ (SidebarSectionLoader + useParticipantStatus, auth.getUser는 내부 유지)
- [x] `queryStudyDetail` stray `'use server'` 제거 ✅
- ✅ 이미 됨: `queryStudyDetail`, `queryStudyEditView`

## 🔴 B. 반환 타입 → Result 통일

- [x] `getParticipantStatus` : ActionResponse → **Result** ✅ (비로그인/없음 = `ok(null)`, 실패만 `err`. hook·SidebarSectionLoader `.ok/.value`로 교정)
- [x] `queryMyNotification` : ActionResponse → **Result** ✅
- [x] `queryStudyBrief` : ~~raw → Result~~ → **스텁 삭제**
- [x] `queryProfileBrief` : ~~raw → Result~~ → **스텁 삭제**
- [x] `queryLoginVerify` : `... | null` → **Result** ✅ (비로그인 = `ok(null)`, DB실패 = `err(Infra)`. 오타 타입명 `QueryMyProfileError`→`QueryLoginVerifyError`)
- ✅ 이미 Result: postDetail, studyDetail, myProfile, myPostsWithStudy, postsAll, getMyStudies, studyEditView

## 🟡 C. 읽기 훅 위치 (feature → entity)

- [x] `features/post/like/model/useIsLiked` (useQuery=읽기) → **`entities/post/api/query/isLiked/`** ✅
  - `isLikedAction`(feature action) → `queryIsLiked(supabase, postId, userId)` 순수 query로 흡수(Result화), `useIsLiked`는 브라우저 client 주입. 옛 feature 파일 2개 삭제. caller: MainSection import 경로 교정.
  - ⚠️ **entity→entity 교차 의존**: useIsLiked가 `useLoginVerify`(entities/user) import. **useParticipantStatus와 동일 선례** → 일관성 위해 유지. 엄격 FSD에선 same-layer 금지라 추후 두 훅 함께 재검토 여지(현재유저를 shared/caller 주입으로).
- ✅ `useToggleLike`(mutation)은 features 유지

## 🟡 D. query 폴더 과분할 → types.ts 통합

row/view/toView 3파일인데 내용 적은 것 → 로컬 타입은 **types.ts**, 매퍼는 **query에 인라인**:

**→ 전 query 슬라이스에 일관 적용 완료.** row/view/toView 파일 **전멸**(0).

- [x] `user/api/query/myProfile` ✅ (→ query 1파일)
- [x] `notification/api/query/myNotification` ✅ (query+types+hook)
- [x] `user/api/query/currentUser` ✅ (query+types+hook, 중복 정의 제거)
- [x] `post/api/query/postDetail` ✅ (query+types+hook)
- [x] `post/api/query/postsAll` ✅ (query+types)
- [x] `post/api/query/myPostsWithStudy` ✅ (query+types)
- [x] `study/api/query/studyDetail` ✅ (query+types, 매퍼+헬퍼 인라인)
- [x] `study/api/query/myStudies` ✅ (→ query 1파일, canonical `toStudyView` 재사용)
- 큰 조인도 전부 통합 — 외부 view/row import 12파일 경로 `→types` 교정, 배럴 포함.

**통일 규칙**: 슬라이스 = `queryXxx.ts`(매퍼 인라인) + [`types.ts`(로컬 Row/View)] + [`useXxx.ts`(훅)]. row/view/toView 분할 폐지.

## 🟡 E. 네이밍 통일

- [x] fn을 `queryXxx`로: `queryGetMyStudies`→`queryMyStudies`, `queryGetAllPosts`→`queryAllPosts`, `getParticipantStatus`→`queryParticipantStatus`(+파일명 `queryParticipantStatus.ts`) ✅
- [x] 폴더명 `get*` 접두 제거: `getMyStudies`→`myStudies`, `getMyNotification`→`myNotification` (myProfile/postDetail/postsAll 방식에 통일) ✅

## 🟢 F. 구조 통일 (사소)

- [x] `participant/api/query`가 flat → **`participantStatus/` 폴더**로 (`queryParticipantStatus.ts` + `useParticipantStatus.ts`). 외부 3곳 경로 교정 ✅

## 🔵 G. 검토 필요

- [x] `loginVerify` 배치/이름 검토 ✅ → **결론: auth 아님(현재 유저 읽기)**, features/auth 이동 ❌. 대신 **`loginVerify`→`currentUser` 리네임**(query/hook/types/error/폴더 + 소비 12파일: notification·participant·post 엔티티, features, widgets 전부). 이름이 "자격증명 검증"으로 오해되던 문제 해소.
  - ⚠️ 잔여: `useCurrentUser`를 useIsLiked·useMyNotification·useParticipantStatus(타 엔티티)가 import = **entity→entity 교차 의존**. "현재 세션 유저"는 cross-cutting이라 관용 허용(선례 일치). 엄격화하려면 "세션 id는 shared / 프로필은 entities/user" 분리 — 큰 작업이라 보류.
- [ ] `getImageUrl`/`getProfileImageUrl` 위치 — **보류(선택)**. 순수 URL 빌더(supabase SDK·IO 없음)라 `shared/api/supabase`보다 `shared/lib`가 의미상 정확하나, 이미 shared라 **import 위반 0** → 기능 이득 없음. 14곳 건드릴 가치 낮아 현상 유지.

---

## 🚀 빌드-그린 트랙 (A~G 밖)

배포 게이트(`next build`)를 위해 A~G와 별개로 잡은 레거시 타입에러. **27 → 10.**

### 완료

- [x] **toView nullable 클러스터 ×3** — DB `avatar_url: string\|null`인데 read가 `string` 강제. "타입=select=현실" 원칙 → `ProfileResponse.avatarUrl: string\|null` (UI 파급 0). _참고: `Profile.fromRow`는 `as` 캐스트가 같은 불일치를 가림._
- [x] **validateWithZod 제네릭 ×4** — `data: T`(검증 후 타입)로 좁혀 있어 `parseFormData`의 loose Record가 안 들어감 → `data: unknown`(safeParse는 미검증 입력). 한 방에 postAction/createStudy/updateStudy/test 해소.
- [x] **UI repoint ×8** — components→widgets 이동 후 경로 미갱신: profile/page(→widgets/profile/ui), posts/ui(→widgets/post/ui), widgets/profile TabSection(`./info`→`../info`).
- [x] **PostsUI 삭제** — `app/(main)/posts/ui.tsx` 참조 0 dead (page.tsx가 MainSection 직접 SSR로 대체).
- [x] **StudyDeleteIntent 리네임** — 모델이 `DeleteStudyIntent`→`StudyDeleteIntent`. StudyRepository import+param 교정.
- [x] **addNotification 필드** — dead 레거시, `sender_id`→`senderId`로 build만 통과.

### 결정 필요였던 4영역 → 전부 해소 ✅

- [x] **`actions/postAction.ts` (5)** — **A안 채택**: 심볼 교정(`createPostSchema`/`CreatePostCommand`/`UpdatePostCommand`), image any는 타입 확정으로 자동 해소. *참고: 이 파일의 createPost/updatePost는 죽은 중복(진짜는 PostRepository), 살아있는 건 `getPostDetailSSR`·`increaseViewCount`뿐 → 추후 dead 제거 대상.*
- [x] **Chat (2)** — **useUser 최소 복구**: `hooks/useUser.tsx` 재작성(DI된 `queryMyProfile` 재사용). `avatar_url`→`avatarUrl` 교정. 정식 챗 FSD 이관은 배포 후 별도.
- [x] **Brief 쿼리 (2)** — **스텁 삭제**(참조 0, 배럴 미노출). 필요 시 Brief 모양+Result로 재설계.
- [x] **`.next/types/validator.ts` (1)** — stale 생성물(삭제된 account 라우트 참조). `rm -rf .next`로 소멸 확인.

---

## ✅ 잘 된 것 (유지)

- `model/`에 supabase import **0** (도메인 순수)
- 읽기 훅 대부분 entity에 (useIsLiked만 예외)

## 추천 순서

1. **A (DI)** — 배포 빌드 안전 직결
2. **B (반환 Result)**
3. **C (useIsLiked 이동)**
4. **D / E / F** — 정리
5. **G** — 검토 후 결정
