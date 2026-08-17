---
name: Study Mate
description: 스터디 플래너 — 찾는 스터디는 이번 주 내가 채울 다음 칸이다
colors:
  paper: "#f9f7f3"
  paper-line: "#ebe6dd"
  ink: "#262019"
  ink-soft: "#6f6656"
  hl-yellow: "#ffe24d"
  hl-mint: "#5fe0bd"
  hl-coral: "#ff8f7a"
  hl-lavender: "#c3b4ff"
  hl-sky: "#86c5ff"
  hl-orange: "#ffb45c"
  hl-lime: "#b8e06a"
  hl-pink: "#ff9ec4"
typography:
  body:
    fontFamily: "Pretendard Variable, Geist, -apple-system, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  heading:
    fontFamily: "Jua, Pretendard Variable, Geist, -apple-system, system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Pretendard Variable, Geist, -apple-system, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
rounded:
  sm: "0.5rem"
  md: "0.625rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    border: "2px {colors.ink}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.paper}"
    border: "2px rgba(38,32,25,0.15)"
    rounded: "{rounded.xl}"
  status-recruiting:
    backgroundColor: "{colors.hl-mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
---

# Design System: Study Mate — 스터디 플래너 월드

## Overview

**Creative North Star: "살아있는 스터디 플래너"**

Study Mate의 홈은 조용한 디렉터리가 아니라 **한 권의 스터디 플래너**다. 찾는 스터디는
목록의 한 줄이 아니라 *이번 주 내가 채울 다음 칸*이다. 방문자는 스터디를 '이번 주를 채울
블록'으로 보고, 계획의 리듬을 느끼며, 찾고 신청한다.

이 월드는 이전의 "옅고 평평한 SaaS(단일 블루 틴트 + 흰 바탕 + 카드 그리드)"를 **폐기**하고
그 자리를 대체한다. 밋밋함의 원인은 완성도가 아니라 **룰 자체**였다 — 색을 옅은 틴트로만
쓰고, 표현을 카드 그리드로만 풀었다. 새 룰은 **따뜻한 종이 바탕 + 형광펜 색면 + 먹빛 잉크**로
색과 촉감을 되찾는다.

한국 20대 학습자(취준·자격증·어학·전공)가 매일 쓰는 물건 = 스터디 플래너/다이어리에서 왔다.
D-day, 체크리스트, 형광펜 카테고리 코딩, 좌석(참여 인원) 블록이 이 세계의 어휘다.

**Key Characteristics:**
- 따뜻한 종이 바탕(플레인) — 전면 그리드/모눈은 제너릭 시그니처라 **쓰지 않는다**.
- 형광펜 8색이 카테고리·상태를 코딩하는 **색면/액센트**(장식 아님, 의미다).
- 먹빛 잉크 텍스트 + 2px 잉크 테두리로 구획(선이 곧 구조).
- D-day·체크리스트·좌석·"빈 칸 채우기" 등 플래너 어휘로 제품을 표현.
- 굵기 대비(700 제목/라벨 ↔ 400 본문)와 형광펜 밑줄(`hl-mark`)로 강조.

## Colors

종이·잉크·형광펜의 3층 팔레트. 브랜드 색은 옅은 블루 하나가 아니라 **잉크(먹) + 형광펜 세트**다.

### Ground / Ink
- **종이(paper #f9f7f3)**: 모든 면의 바탕. 흰색이 아닌 따뜻한 종이 톤이지만 누런기는 낮춘 라이트 크림.
- **괘선(paper-line #ebe6dd)**: 구분선·점선 테두리·스켈레톤. 종이 위 옅은 선.
- **잉크(ink #262019)**: 텍스트, 2px 테두리, **주 CTA 채움**, 마커 밴드. 브랜드의 지배 다크.
- **약한 잉크(ink-soft #6f6656)**: 보조 텍스트·메타.
- 잉크 알파(`ink/5·/10·/15·/40`)로 미세 면·테두리·진행 트랙을 만든다.

### Highlighters (형광펜 — 카테고리·상태 코딩 전용)
옐로 `#ffe24d` · 민트 `#5fe0bd` · 코랄 `#ff8f7a` · 라벤더 `#c3b4ff` · 스카이 `#86c5ff` ·
오렌지 `#ffb45c` · 라임 `#b8e06a` · 핑크 `#ff9ec4`. 글자는 항상 잉크(먹)를 얹어 대비를 확보한다.
**대분류 8종은 서로 겹치지 않는 8개 고유 형광색을 갖는다**(같은 색 반복 금지). 모집 상태는
민트(모집중)·코랄(마감)으로 코딩.

### Named Rules
**The Highlighter-Coding Rule.** 형광펜 8색은 **카테고리와 모집 상태의 의미**로 쓴다
(카테고리 탭·좌석 바·상태 태그). 일반 강조는 형광펜이 아니라 **굵기 + `hl-mark` 밑줄**로 한다.

**The Ink-Action Rule.** 주 행동(찾기·만들기·시작)은 **잉크 채움 버튼**(먹빛+종이 글자)이다.
옅은 블루 틴트로 강조하던 옛 룰은 폐기한다 — 강조의 무게중심은 잉크다.

**No Blueprint Grid.** 종이 느낌을 낸다고 전면에 하이라인 그리드/모눈을 깔지 않는다(생성형 UI의
흔한 tell). 종이는 플레인, 괘선/바인딩 같은 구체적 플래너 시그니처는 **카드 국소**로만.

## Typography

**Display/Heading:** **배민 주아체(Jua)** — 손으로 쓴 다이어리/플래너 글씨의 둥근 톤. 자가호스팅,
`font-display: swap`, 한글/라틴 서브셋 unicode-range 분리. 유틸 `font-heading`으로 **대형 헤딩에만**
적용(히어로·섹션 제목·페이지 제목). 주아체는 단일 굵기(400)라 그 자체가 무게감을 낸다 — 굵게 겹치지 않는다.

**Body:** Pretendard Variable (폴백 Geist → system). 한글 17px / 행간 1.7 고정(The 17/1.7 Rule).

**Named Rule — The Jua-for-Display Rule.** 주아체는 **읽는 텍스트가 아니라 보는 텍스트**(type for a
moment)에만 쓴다: 히어로 헤드라인·섹션 제목·페이지 제목. 카드 제목·라벨·본문·폼 텍스트는 **Pretendard**
(작은 크기 가독성·굵기 대비 확보). 강조는 여전히 형광펜 밑줄(`hl-mark`) + Pretendard 굵기로.

- **Display/Heading** (`font-heading` = Jua 400, text-2xl~6xl): 히어로·섹션·페이지 제목. 키워드에 `hl-mark`.
- **Card title** (Pretendard 700, text-base~xl): 카드·리스트 제목. 작은 크기라 Pretendard.
- **Body** (Pretendard 400, 17px/1.7): 본문·설명.
- **Label** (Pretendard 700, text-xs): 상태 태그·좌석 수·메타. 굵게.
- 수치(좌석·D-day·스탯)는 `tabular-nums`.

## Layout

중앙 정렬 `max-w-7xl` 컨테이너. 섹션은 `bg-paper` 위에 세로로 쌓이고, 헤더(굵은 잉크 제목 +
`ink-soft` 부제)로 구획한다. 히어로는 좌(카피+체크리스트+CTA+스탯) / 우(주간 플래너 카드)
2열. 카드 그리드는 모바일 1열 → 넓은 화면 2~4열.

## Elevation & Depth

깊이는 **2px 잉크 테두리 + 종이가 책상에서 살짝 뜬 소프트 섀도우**(`shadow-soft`, hover
`shadow-lift`)로 만든다. hover 시 `-translate-y-1`로 집어 올리는 느낌. 그림자는 슬레이트 틴트의
낮은 알파(순검정 아님).

### Named Rule
**The Border-First (2px) Rule.** 구분은 그림자보다 **2px 잉크 테두리**가 먼저. 카드·버튼·태그의
윤곽선이 이 세계의 주 구조다(마커로 그린 칸).

## Shapes

둥근 모서리(카드 `rounded-xl`, 버튼/태그 `rounded-md`, 좌석 바 `rounded-full`). 히어로 플래너
카드는 `rotate-1`로 손으로 놓은 듯한 미세한 기울기. 날카로운 직각은 쓰지 않는다.

## Components

### Buttons
- **Primary(잉크):** `bg-ink text-paper`, hover `ink/90`, `active:scale-[0.97]`. 주 행동.
- **Outline(잉크):** 투명 배경 + `border-2 border-ink text-ink`, hover `ink/5`. 중립 행동.
- **On-ink(잉크 밴드 위):** 종이 채움(`bg-paper text-ink`) + 종이 아웃라인.

### Cards
- **종이 카드:** `bg-paper` + `border-2 border-ink/15` + `rounded-xl` + `shadow-soft`.
  hover `-translate-y-1 border-ink/40 shadow-lift`. 내부 구분은 **점선 괘선**(`border-dashed
  border-paper-line`).

### Tags / 상태·좌석
- **상태:** 모집중=`hl-mint`, 마감=`hl-coral`, 그 외=`ink/10 ink-soft`. `rounded-md`, 굵게, 잉크 글자.
- **카테고리:** 카테고리 탭/칩은 형광펜 색으로 코딩(홈 CategorySection = 대분류별 형광 탭).
- **좌석(참여):** "n/m석" + 형광(`hl-coral`) 진행 바 on `ink/10` 트랙.

### Category Tabs (관심 분야)
차분한 종이 카드: 상단 **카테고리 고유 형광색 8% 워시 밴드 위에 카테고리별 스티커 일러스트 PNG**
(`public/categories/{value 소문자}.png`, 투명 배경, 8종), 아래 굵은 잉크 라벨 + 화살표. 밴드 워시는
카드마다 형광색이 달라 구분되지만 **`/8` 저채도라 색면이 아닌 은은한 배경**(쨍한 색면은 종이 세계와
부딪혀 폐기했던 결정 유지) — 균일한 회색 밴드가 스티커와 안 어울려 밋밋하다는 피드백으로 도입.
카테고리 색 코딩은 밴드 워시 + 좌측 세로 형광 바 + 라벨 옆 형광 점, 3곳에서 일관되게. 대분류별 고정 형광색.

### Hero Planner Card
주간 플래너 카드: 헤더(제목 + D-day 잉크 pill) + 스터디 블록 행(형광 카테고리 바 + 제목 +
일정 + 좌석) + **"빈 칸 채우기" 점선 CTA 행**. 스터디 = 이번 주 채울 칸이라는 THESIS의 증명.

## Do's and Don'ts

### Do
- **Do** 바탕은 종이(paper), 텍스트·테두리·주 버튼은 잉크(ink).
- **Do** 카테고리·상태는 형광펜 8색으로 코딩(의미, 대분류별 고유색), 글자는 잉크.
- **Do** 구분은 2px 잉크 테두리 + 점선 괘선으로 먼저.
- **Do** 강조는 굵기 + `hl-mark` 형광 밑줄로.
- **Do** 플래너 어휘(D-day·좌석·체크리스트·빈 칸 채우기)로 제품을 말한다.

### Don't
- **Don't** 옛 룰(옅은 단일 블루 틴트·흰 바탕·평평)로 되돌아가지 않는다.
- **Don't** 형광펜을 의미(카테고리/상태) 밖의 일반 장식으로 흩뿌리지 않는다.
- **Don't** 전면 그리드/모눈 배경을 깔지 않는다(제너릭 시그니처).
- **Don't** 순검정 그림자로 카드를 띄우지 않는다(슬레이트 틴트 소프트 섀도우).
- **Don't** 날카로운 직각.

## 마이그레이션 상태

- **완료(전면):** 앱 전체가 플래너 월드로 전환됨.
  - 홈(`widgets/home/*`, `entities/post/ui/PostCard`, `features/ai-recommend/ui/*`)
  - 전역 크로므: 헤더/검색/드롭다운(`widgets/header/*`), 푸터(`widgets/footer/*`), 전역 로딩/에러(`app/loading.tsx`·`app/error.tsx`)
  - 목록(`/posts` + `widgets/post/*`), 상세(`/posts/[id]` = `widgets/post-detail/*`, `/studies/[id]` = `widgets/study-detail/*`)
  - 프로필(`widgets/profile/*`), 채팅(`app/(chat)/*`, `widgets/chat/*`), 작성·수정·인증 폼(`features/*/ui`, `widgets/auth/*`)
  - 공유 원자: `shared/ui/EmptyState`, `shared/ui/skeleton/*`, `entities/study/ui/*`,
    `entities/participant/ui/MembersRow`, `entities/post/ui/PostListItem`, 상태색 헬퍼 `shared/lib/conversion/study#getStudyStatusColor`(형광 코딩).
- **타이포:** 디스플레이 서체 **주아체(Jua)** 자가호스팅(`app/globals.css` @font-face + `--font-heading`),
  대형 헤딩에 `font-heading`(히어로·섹션·페이지 제목). 본문 Pretendard. The Jua-for-Display Rule 참조.
- **구 블루 토큰 상태:** `--primary/--primary-deep` 등은 코드에서 미사용(0). 전역 shadcn 프리미티브(`shared/shadcn/ui/*`)는
  기본값에 구 토큰이 남아 있으나 각 사용처에서 잉크 클래스로 오버라이드됨 — 필요 시 프리미티브 자체 통일은 후속 과제.
- **에셋:** 관심 분야 카테고리 탭 이미지 8종 투입 완료(`public/categories/{value 소문자}.png`, 투명 PNG).
