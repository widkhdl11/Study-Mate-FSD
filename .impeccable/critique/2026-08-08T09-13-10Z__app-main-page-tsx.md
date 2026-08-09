---
target: 홈 화면
total_score: 26
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
timestamp: 2026-08-08T09-13-10Z
slug: app-main-page-tsx
---
Method: dual-agent (A: design-review · B: detector+browser)

# Critique — 홈 화면 (`app/(main)/page.tsx` + `widgets/home`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | 스켈레톤 스트리밍·실시간 카운트는 좋으나 "새 글" 시각 신호 없음 |
| 2 | Match System / Real World | 3 | 한국어·카테고리·상태 라벨은 자연스럽지만 hero 피처 카드는 추상 마케팅어 |
| 3 | User Control and Freedom | 3 | 브라우즈 진입점, 파괴적 동작 없음 — 무난 |
| 4 | Consistency and Standards | 3 | 같은 블루를 CategorySection=primary / PostCard=accent 다른 토큰명 사용 |
| 5 | Error Prevention | 3 | 입력 표면 적음, 빈/에러 상태는 설계돼 있음 |
| 6 | Recognition Rather Than Recall | 4 | 아이콘+라벨 카테고리, 시각적 카드로 회상 부담 최소 — 강점 |
| 7 | Flexibility and Efficiency | 2 | 발견 진입점인데 개인화·저장 필터·"내 지역/내 스터디" 가속 경로 전무 |
| 8 | Aesthetic and Minimalist | 2 | 오브+그리드+플로팅+그라디언트가 자기 시스템의 Border-First·near-flat 위반 |
| 9 | Error Recovery | 3 | 로드 실패 안내 카피는 있으나 재시도 없음 + 이 분기 자체가 도달 불가 |
| 10 | Help and Documentation | n/a | 홈 발견 진입점엔 문서/도움말 부적용 |
| **Total** | | **26/36** | **Good (72%, 하단)** |

## Design Specificity Verdict

**Split — 스크롤 아래는 authored, hero는 category-interchangeable.**

- **LLM 평가:** Hero(`HeroSection.tsx:47-141`)는 generic SaaS 랜딩 문법(풀블리드 블루 그라디언트 + 블러 오브 3개 + 그리드 오버레이 + `animate-float` 흰 카드 3장). 피처 카피("다양한 스터디/체계적 학습/목표 달성")는 어떤 학습 서비스에도 붙는 boilerplate로 Study Mate의 차별점(원스톱·지역·매칭·모집 상태)을 한 마디도 말하지 않음. 반면 below-fold(`CategorySection` 8개 대분류 택소노미, `PostCard`의 카테고리 경로·지역·상태·참여 progress·호스트)는 진짜 이 제품을 위해 authored됨. **정체성이 스크롤해야 나타난다.**
- **결정적 스캔(디텍터):** `detect.mjs --json widgets/home app/(main)/page.tsx` → **exit 0, finding 0건 (clean).** 디텍터 정상 작동 교차검증됨(widgets 전체 스캔 시 1건 나옴 → 홈 스코프는 진짜 clean). 즉 홈의 문제는 **디텍터가 잡는 결정적 안티패턴이 아니라 구조·전략·도메인 정합성 층위**에 있다. (주의: hero의 `shadow-sm`/`animate-float`/풀블리드는 DESIGN.md 위반이지만 디텍터 룰에는 안 걸림 — 룰 사각지대.)
- **브라우저 오버레이:** 확장 미연결로 fallback(오버레이 없음). dev 서버는 localhost:3000에 실제 구동 중.

## Overall Impression

시각적 첫인상은 밝고 환영적이지만, **로그인 사용자의 발견 진입점**이라는 홈의 실제 역할과 어긋난다. 최대 지면을 (이미 전환된 사용자에게) 재영업하는 마케팅 hero에 쓰고, 정작 유용한 발견·추천은 아래로 밀림. 가장 큰 기회는 **hero 축소 + 발견/개인화 상단화**. 그리고 코드 층에 조용히 깨진 에러 정책이 하나 있다.

## What's Working

1. **정직한 실데이터 스탯 + 스탯별 독립 폴백** (`HeroStats.tsx:19-23`) — 지어낸 지표 전무, 한 쿼리 실패가 나머지를 안 막음. PRODUCT.md "정직한 데모" 원칙 준수.
2. **도메인에 맞춰 authored된 PostCard** (`PostCard.tsx:49-103`) — 카테고리 경로·지역·상태·참여 게이지·호스트를 한 카드에 압축. "빠른 판단"(Product Principle 2) 정조준. `maxParticipants>0`·username 빈값 가드까지 방어적.
3. **회복탄력적 상태 설계** — LatestSection이 에러·빈 상태·스켈레톤을 모두 갖추고, 빈 상태는 "첫 스터디 만들기" CTA로 전환.

## Priority Issues

**[P1 · correctness] `queryAllPosts`가 실패 시 `notFound()`를 throw → 에러 UX 전부 죽은 코드**
- What: `queryPostsAll.ts:70-72`에서 에러 시 `err()` 반환이 아니라 `notFound()` 호출(throw). 반환 타입은 `Result`이지만 err 경로가 없음.
- Why: `LatestSection`의 `!postsData.ok` 은은한 안내 분기(`LatestSection.tsx:32-43`)도, **직전에 추가한 `posts/page.tsx`의 인라인 에러+RetryButton도** 절대 실행되지 않고 사용자는 통째 404를 맞음. "홈 전체를 404로 만들지 않는다"는 코드 주석의 의도와 정반대.
- Fix: `queryAllPosts`가 에러 시 `err({kind:"Infra", ...})`를 반환하도록 변경. 그러면 두 소비처의 에러 처리가 실제로 동작.

**[P1] 홈이 모집글을 전량 렌더 — 프리뷰가 아님**
- What: `queryAllPosts`는 limit 없음, `LatestSection.tsx:76`은 `.slice` 없이 전부 map.
- Why: 6개 스켈레톤·"더 많은 모집글 보기" CTA가 프리뷰를 약속하는데 실제론 전량 렌더 → 성능·인지 부하, 프리뷰→목록 패턴 붕괴. 운영 시 수백 개면 홈이 카드 덤프.
- Fix: `posts.slice(0, 6)` 또는 홈 전용 쿼리에 `.limit`.

**[P1 · 이전 세션 사용자 보류] Hero가 DESIGN.md 금지 문법(풀블리드 히어로) 차용**
- What: 풀블리드 그라디언트 + 블러 오브 + 그리드 + `animate-float`/`border-0` 카드(`HeroSection.tsx:47-59,116-136`).
- Why: `DESIGN.md:207`(풀블리드 히어로 금지)·`:149`(Border-First) 정면 위반이자 specificity 문제의 근원. **단, 사용자가 지난 세션에 이 항목을 의도적으로 보류함** — 재논의 대상.
- Fix(원할 때만): near-flat + 얇은 테두리 구획으로 재작성, 오브/그리드/float 제거, 피처 카피를 고유 흐름(발견→신청→승인→대화)·지역·상태 언어로 교체.

**[P2] 로그인 발견 진입점인데 최대 지면을 재영업에 소비, 개인화 부재**
- What: 거대한 마케팅 hero + generic 피처 카드가 상단 지배. "내 스터디/이어서/내 지역" 개인화 없음. 가장 개인화된 AI 추천은 최하단(`page.tsx`).
- Why: 이미 전환된 사용자에게 제품 pitch 재노출, 유용한 것(발견·추천)을 아래로 밀어냄.
- Fix: 로그인/비로그인 분기 검토, 로그인 시 hero 축소 + 발견/이어하기 상단화.

**[P2 · 확인 필요] embedded `study.status` 필터에 `!inner` 없음 → study=null 행 유입 소지**
- What: `queryPostsAll.ts:66`의 `.in("study.status", ["recruiting","completed"])`는 embedded 필터인데 `study:study_id!inner` 힌트가 없어, 상태 미일치 post가 `study=null`로 딸려올 수 있음.
- Why: 그 경우 `toStudyView(null)`·PostCard의 `post.study.*` 접근이 깨질 소지.
- Fix: `!inner` 조인 힌트 추가 여부 확인/적용.

## Persona Red Flags

- **Jordan (첫 사용자):** 로그인 직후 이미 "가입한" 제품의 마케팅 피처 카드를 다시 만남. 구체적 다음 걸음은 흰 버튼 2개뿐, 그 아래 모집글이 전량으로 쏟아짐 → 방향 상실.
- **Casey (모바일):** hero(`py-20~32`) + 스탯 3개 + `animate-float` 카드 3장을 모두 지나야 첫 실질 발견(카테고리) 도달 — 매우 긴 스크롤 + 저사양 잰크 위험.
- **Riley (엣지):** (a) 쿼리 실패 → 은은한 안내 아닌 전체 404(P1). (b) 모집글 수백 → 홈 전량 렌더(P1). (c) study=null 유입 소지(P2).

## Minor Observations

- pending 라벨↔색 잠재 불일치: `getStudyStatusColor`엔 `pending`(앰버) 있으나 `studyStatusConversion`엔 없음(undefined). **단 study 도메인 상태는 recruiting/closed/completed뿐이라 홈에선 도달 불가** — latent 정리 대상.
- LatestSection 카피 "지금 모집 중"인데 쿼리는 `completed`(모집완료)도 포함 → 카피-목록 미세 불일치.
- 같은 블루를 primary/accent 다른 토큰명으로 호버(현재 동색이라 무해, 토큰 분기 시 위험).

## Questions to Consider

1. 홈에 로그인/비로그인 분기가 있어야 하는가? 지금 hero는 명백히 비로그인 마케팅용.
2. LatestSection은 프리뷰 6개가 의도인가(스켈레톤 6개), 전량이 의도인가?
3. `queryAllPosts` 실패 정책은 404인가 섹션 내 안내인가 — 코드와 주석이 충돌.
4. AI 추천 최하단 배치가 "AI는 거들 뿐" 구현인가, 가장 개인화된 가치를 묻는 것인가?
