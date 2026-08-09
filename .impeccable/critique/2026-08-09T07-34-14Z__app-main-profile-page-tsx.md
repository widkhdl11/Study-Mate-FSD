---
target: 내 프로필 화면
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-09T07-34-14Z
slug: app-main-profile-page-tsx
---
Method: dual-agent (A: design-review · B: detector+browser)

# Critique — 내 프로필 화면 (`app/(main)/profile/page.tsx` + `widgets/profile`)

성격: **Operate** (조회·수정·내 콘텐츠 관리)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:---:|-----------|
| 1 | Visibility of System Status | 1 | 이미지 업로드에 진행/성공/실패 표시 전무(`ProfileSection.tsx:23-29`), 삭제도 로딩 없음 |
| 2 | Match System / Real World | 2 | `points` 숫자만 노출(라벨/단위 없음, `ProfileSection.tsx:86`), birthDate 미포맷 |
| 3 | User Control and Freedom | 1 | 삭제 undo 없음, 업로드 취소/롤백 없음, 탭 전환 replaceState라 뒤로가기가 프로필 밖으로 |
| 4 | Consistency and Standards | 2 | 채팅 아바타 fallback이 방 이름 전체(`my-chat-tab.tsx:33`) vs 헤더는 이니셜; 삭제만 네이티브 confirm |
| 5 | Error Prevention | 2 | 삭제 confirm은 있음(+), 업로드는 크기/실패 방어·확인단계 없이 즉시 커밋 |
| 6 | Recognition Rather Than Recall | 3 | 탭 아이콘+라벨+카운트로 위치·물량 인지 — 강점 |
| 7 | Flexibility and Efficiency | 2 | 내 글/스터디 많아질 때 검색·정렬·필터·일괄삭제·페이지네이션 없음 |
| 8 | Aesthetic and Minimalist | 3 | 평면+얇은 테두리+둥근 톤 일관, 소음 적음 |
| 9 | Error Recovery | 1 | 카운트 실패를 조용히 0으로(`page.tsx:45-52`), 업로드/삭제 실패 UI 없음 |
| 10 | Help and Documentation | 2 | 빈 상태 CTA가 최소 안내, 고위험 작업(비번/업로드) 설명 0 |
| **Total** | | **19/40** | **Poor (경계 상단, 48%)** |

정보 구조(6·8)는 탄탄하나 **상태 가시성·에러 회복·사용자 통제(1·3·9)**가 점수를 끌어내림.

## Design Specificity Verdict — Authored (조건부)

- **LLM 평가:** 뼈대는 authored — 상태색을 의미 토큰에만 묶고(`tabBadgeColors.ts`), 카테고리 배지는 중립 블루로 통일(One Blue), hover는 그림자가 아니라 `hover:border-primary/50`(Border-First), 스터디 카드 참여 진행바는 "판단을 돕는 정보 설계" 구현. **그러나 상호작용 마감이 category-default로 되돌아감**: 네이티브 `window.confirm`, 정체불명 숫자 배지, "관리" 죽은 라벨.
- **결정적 스캔(디텍터):** `detect.mjs` → **exit 0, finding 0건**. 프로젝트 전체·불량 HTML 주입으로 엔진 정상 작동 교차검증됨. 즉 프로필 문제는 결정적 안티패턴이 아니라 **상태/에러/통제 로직** 층위.
- **브라우저 오버레이:** 확장 미연결 fallback.

## Overall Impression

"내 공간"이라는 소속감(큰 아바타+블루 링)과 정직한 빈 상태(EmptyState)로 감정선의 뼈대는 좋다. 하지만 **고위험 상호작용(이미지 업로드·삭제)에 상태·안전망이 없어** 조회는 쾌적하나 조작은 불안하다. 가장 큰 기회: 업로드/삭제의 상태·피드백·롤백을 채워 Operate 화면답게 만들기.

## What's Working

1. **디자인 토큰 규율** — 상태색=상태 의미만, 카테고리=중립 블루, hover=Border-First. One Blue/Status-Only를 코드로 강제(`tabBadgeColors.ts`).
2. **공용 빈 상태의 일관성·정직함** — 3개 탭이 동일 `EmptyState`(icon+title+desc+CTA), 없는 실적 안 꾸미고 다음 행동 제안.
3. **판단을 돕는 정보 밀도** — 스터디 카드 참여 진행바 + 탭 카운트로 "내가 뭘 얼마나 가졌나" 한눈에.

## Priority Issues

**[P0] 이미지 업로드에 상태·실패·롤백이 없다** — 검증됨
- `handleImageChange`(`ProfileSection.tsx:23-29`)가 프리뷰 세팅 후 `mutate(file)`만, `isPending`/`onError` 미사용. 실패해도 낙관적 프리뷰가 남아 성공으로 오인 → 새로고침 시 배신. Fix: pending 동안 카메라 버튼 스피너·비활성, 성공 토스트, `onError`에서 원래 avatarUrl로 프리뷰 롤백 + 안내. (훅 `useUpdateProfileImage` 내부 정책도 확인)

**[P1] 정체불명 `points` 배지 (+ 0일 때 빈 배지 버그)** — 검증됨
- `{currentUser?.points || ''}`(`ProfileSection.tsx:86`): 라벨/단위 없어 의미 불명 + `points===0`이면 `0 || ''`→**빈 배지 렌더**. 내 정보 탭 "회원 등급"도 raw 숫자. Fix: "N 포인트"/등급명으로 라벨링, `points ?? 0`. 데모에 의미 없으면 배지 제거(정직한 데모).

**[P1] 삭제가 네이티브 `window.confirm` + 되돌리기 없음**
- `my-post-tab.tsx`의 `window.confirm` — 브랜드 톤 단절, 파괴적인데 안전망 없음. Fix: shadcn AlertDialog로 교체(삭제 대상 제목 명시), 삭제 중 카드 비활성, 가능하면 undo 토스트.

**[P2] 채팅 아바타 fallback이 방 이름 전체 출력** — 검증됨
- `{room.chat.name || "??"}`(`my-chat-tab.tsx:33`)가 이니셜이 아니라 긴 이름을 48px 원에 → 넘침/찌그러짐, 헤더 이니셜 패턴과 불일치. Fix: `room.chat.name?.[0] ?? "?"`.

**[P2] 카운트 조회 실패의 조용한 0 폴백** — 검증됨(주석상 의도)
- `page.tsx:45-52`가 실패 시 전부 0, 탭은 "(0)"으로 정상처럼. 로드 실패↔진짜 0 구분 불가. Fix: 미확정 시 숫자 생략 또는 실제 배열 길이로 표시.

## Persona Red Flags (Operate)

- **Alex (파워유저):** 내 글·스터디 수십 개 시 검색·정렬·필터·일괄삭제·페이지네이션 없어 관리 불가.
- **Sam (접근성):** 삭제/수정 드롭다운 트리거가 아이콘만(`MoreVertical`) aria-label 없음 → "button"으로만 읽힘. (카메라 업로드는 sr-only 라벨 잘 갖춤 — 편차)
- **Riley (엣지):** `points===0` 빈 배지; `bio` 빈 값 시 빈 문단(`ProfileSection.tsx:90-92`); 긴 username/chat.name 오버플로 미검증; 채팅 last_message 없을 때 빈 줄.

## Minor Observations

- `my-studies-tab.tsx` meetingDate 주석 죽은 코드, "관리" 죽은 라벨.
- 채팅 unreadCount 배지 주석 처리 → **읽지 않음 표시 전무**(원스톱 대화 흐름에서 아쉬움).
- 상태 배지 매핑이 모집중/마감 2종만, 그 외(대기중 앰버 등)는 muted로 흘러 상태 투명성 누락.
- 헤더 아바타 `ring-4`는 Border-First 대비 약간 무거움(블루라 규칙 위반은 아님).

## Questions to Consider

1. `points`는 등급인가 적립 포인트인가? 데모에 의미 없으면 노출 근거는?
2. 탭 전환 `replaceState`는 의도(뒤로가기 오염 방지)인가 관성인가? 딥링크 기대 동작은?
3. 내 글/스터디 목록 상한·페이지네이션이 로드맵에 있는가(Alex)?
4. 채팅 unread 표시는 백엔드 미구현이라 주석인가, 스코프 아웃인가?
5. 이미지 업로드 실패 롤백 정책이 `useUpdateProfileImage` 훅 내부에 있는가, 전무인가?
