---
name: Study Mate
description: 함께 뛰는 러닝메이트 — 밝고 친근한 스터디 매칭 서비스
colors:
  primary: "#2f58e0"
  primary-foreground: "#ffffff"
  foreground: "#1f2933"
  background: "oklch(0.99 0 0)"
  card: "oklch(1 0 0)"
  secondary: "#f0f4f9"
  muted-foreground: "#7b8794"
  border: "#e5eaf1"
  ring: "#2f58e0"
  success: "oklch(0.5 0.15 145)"
  danger: "oklch(0.55 0.2 25)"
  warning: "oklch(0.65 0.15 55)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  body:
    fontFamily: "Pretendard Variable, Geist, -apple-system, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  heading:
    fontFamily: "Pretendard Variable, Geist, -apple-system, system-ui, sans-serif"
    fontWeight: 700
  label:
    fontFamily: "Pretendard Variable, Geist, -apple-system, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  sm: "0.5rem"
  md: "0.625rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.5rem 1rem"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  badge-status-open:
    backgroundColor: "{colors.success}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
  input:
    rounded: "{rounded.md}"
    height: "2.25rem"
---

# Design System: Study Mate

## Overview

**Creative North Star: "함께 뛰는 러닝메이트"**

Study Mate는 스터디를 함께할 사람을 찾아 주는, 옆에서 페이스를 맞춰 뛰어 주는 러닝메이트 같은
서비스다. 그래서 화면은 조용한 학습 도구가 아니라 **밝고 활기차게** 옆에서 밀어 주는 느낌을
지향한다. 지배색인 코발트 러닝 블루가 이 활기를 이끌고, 나머지는 그 블루가 도드라지도록
차분한 흰 바탕과 쿨한 블루그레이 중립으로 받쳐 준다.

밀도는 과하지 않다. 카드와 배지로 정보를 또렷하게 끊어 주되, 면은 거의 평평하게 두고 얇은
테두리로 구획한다. 부피감 있는 그림자로 무겁게 만들지 않는다. 형태는 둥근 모서리(0.75rem
기준)로 **부드럽고 친근하게** — 20대 학습자가 부담 없이 다가오도록.

이 시스템은 케빈스룸(kevinsroom.co.kr)의 디자인 언어에서 출발했다(같은 블루 #2F58E0, 슬레이트
텍스트, Pretendard 17px/1.7). 다만 커스텀 굿즈 커머스였던 원본의 3D 캐릭터·풀블리드 히어로
문법은 **차용하지 않는다.** Study Mate는 스터디를 빠르게 판단하고 신청·대화로 넘어가는
매칭 서비스이므로, 표현보다 카드의 명료함과 상태의 투명함이 앞선다.

**Key Characteristics:**
- 단일 지배 블루(코발트 러닝 블루)가 활기를 이끈다.
- 거의 평평한 면 + 얇은 테두리. 그림자는 최소.
- 둥근 모서리로 부드럽고 친근하게.
- 모집 상태(모집중·마감·대기중)를 색으로 즉시 읽힌다.
- 한글 본문 17px / 행간 1.7로 편안한 가독성.

## Colors

지배색인 블루 하나가 브랜드를 이끌고, 흰 바탕과 쿨한 블루그레이가 이를 받치며, 초록·빨강·노랑은
오직 모집 상태의 의미로만 등장하는 팔레트다.

### Primary
- **코발트 러닝 블루** (#2f58e0): 브랜드의 유일한 지배색. 주요 CTA(신청·생성 버튼), 활성 탭·pill,
  포커스 링, 링크, 로고에 쓴다. accent 토큰도 이 블루로 통일돼 있어 "포인트 색"이 따로 없다.
  다크 모드에서는 대비를 위해 밝은 변주 (#5b7cf0) 를 쓴다.

### Neutral
- **슬레이트 잉크** (#1f2933): 기본 텍스트색. 제목·본문 모두 이 색.
- **라이트 페이퍼** (oklch(0.99 0 0)): 페이지 바탕. 카드는 순백 (oklch(1 0 0)).
- **블루그레이 미스트** (#f0f4f9): secondary·muted 표면. 보조 배지 배경, 섹션 구분 면.
- **뮤트 슬레이트** (#7b8794): 보조 텍스트·플레이스홀더·메타 정보.
- **쿨 보더** (#e5eaf1): 테두리·구분선·입력창 경계. 이 시스템의 주 구획 수단.

### 상태색 (Semantic, 모집 상태 전용)
- **모집중 그린** (oklch(0.5 0.15 145)): 모집 중인 스터디. 단색 채움 + 흰 글자.
- **마감 레드** (oklch(0.55 0.2 25)): 모집 마감. 단색 채움 + 흰 글자.
- **대기중 앰버** (oklch(0.65 0.15 55)): 신청 대기 상태. 단색 채움 + 흰 글자.

### Named Rules
**The One Blue Rule.** 포인트 색은 코발트 러닝 블루 하나뿐이다. 새 강조색을 만들지 않는다 —
강조가 필요하면 이 블루를 쓴다.

**The Status-Only Color Rule.** 초록·빨강·노랑은 **모집 상태의 의미**로만 쓴다. 장식이나
일반 강조로 상태색을 끌어오지 않는다. 브랜드 강조는 언제나 블루의 몫이다.

## Typography

**Body Font:** Pretendard Variable (폴백: Geist → -apple-system → system-ui → sans-serif)
**Label/Mono Font:** Geist Mono (코드·수치 등 극히 일부)

**Character:** 한글에 최적화된 Pretendard 단일 서체로 제목부터 본문까지 일관되게 간다. 굵기
대비(400 본문 ↔ 600–700 제목)로 위계를 만들고, 별도 장식 서체는 쓰지 않는다.

### Hierarchy
- **Body** (weight 400, 17px(1.0625rem), line-height 1.7): 기본 텍스트. 명시적 `text-*` 지정이
  없는 모든 문단의 기준값이며, 한글 가독성을 위해 넉넉한 행간을 고정으로 둔다.
- **Heading** (weight 600–700, Tailwind 스케일: text-xl~text-3xl): 페이지·섹션·카드 제목.
  크기는 Pretendard + Tailwind 기본 스케일을 그대로 쓰고 굵기로 위계를 잡는다.
- **Label** (weight 500, 12px(text-xs)): 배지·태그·메타 라벨.

### Named Rules
**The 17/1.7 Rule.** 본문 기준은 17px / 행간 1.7로 고정이다. 한글 가독성을 위한 값이므로 임의로
줄이지 않는다.

## Layout

중앙 정렬된 컨테이너 안에 카드 그리드로 정보를 배치한다. 스터디·모집글은 카드 리스트/그리드로
훑어보게 하고, 상세는 본문 + 우측 사이드바(상태·참여 액션) 구조를 쓴다. 간격은 Tailwind 기본
스페이싱 스케일을 따르며 별도 커스텀 스페이싱 토큰은 없다. 반응형은 모바일 단일 열 → 넓은 화면
다열 그리드로 확장한다(정확한 브레이크포인트는 Tailwind 기본값 기준).

## Elevation & Depth

**거의 평평한 시스템이다.** 깊이는 그림자가 아니라 **얇은 테두리(쿨 보더 #e5eaf1)** 와 면 색
차이로 만든다. 카드에 아주 옅은 `shadow-sm`, 입력창·아웃라인 버튼에 `shadow-xs`가 붙지만
이는 미세한 분리감일 뿐 떠 있는 인상을 주지 않는다.

### Named Rules
**The Border-First Rule.** 요소를 구분할 땐 그림자보다 테두리를 먼저 쓴다. 그림자를 키워
카드를 띄우지 않는다 — 이 시스템의 깊이는 선(線)으로 만든다.

## Shapes

둥근 모서리가 형태 언어의 핵심이다. 기준 반경은 0.75rem(12px)이고 여기서 파생된 스케일을 쓴다:
버튼·입력창은 md(0.625rem/10px), 카드는 xl(1rem/16px), 배지·상태 pill은 완전한 라운드(full).
날카로운 직각은 쓰지 않는다 — 친근함이 이 서비스의 톤이다.

## Components

전반 성격: **부드럽고 친근하게.** 또렷하되 공격적이지 않고, 둥근 모서리와 넉넉한 여백으로
편안하게.

### Buttons
- **Shape:** 둥근 모서리 md (0.625rem / `rounded-md`). 기본 높이 h-9 (2.25rem), 패딩 px-4 py-2.
- **Primary:** 코발트 러닝 블루 채움 + 흰 글자. hover 시 블루 90% 불투명도로 살짝 가라앉음.
  주요 행동(신청·생성·저장)에 쓴다.
- **Secondary:** 블루그레이 미스트(#f0f4f9) 배경 + 슬레이트 글자. 보조 행동.
- **Outline:** 흰 배경 + 쿨 보더 + `shadow-xs`, hover 시 accent 배경. 중립적 행동.
- **Ghost / Link:** 배경 없음(hover 시 accent 면) / 블루 텍스트 밑줄. 최소 강조.
- **상태 버튼:** 모집·참여 액션은 상태색 채움(모집중=그린, 대기=앰버 등) + 흰 글자.
- **Focus:** 3px 링(ring/50) — 키보드 포커스를 뚜렷이.

### Badges / 상태 pill
- **Shape:** 완전한 라운드(`rounded-full`), px-2 py-0.5, text-xs(12px) weight 500.
- **기본:** 블루 채움 + 흰 글자(브랜드), 또는 블루그레이 미스트(보조).
- **상태:** 모집중=그린 / 마감=레드 / 대기중=앰버, 모두 단색 채움 + 흰 글자.

### Cards / Containers
- **Corner:** xl (1rem / `rounded-xl`).
- **Background:** 순백 카드(oklch(1 0 0)).
- **Border:** 쿨 보더 1px가 주 구획 수단.
- **Shadow:** `shadow-sm` (아주 옅게) — Elevation의 Border-First Rule을 따른다.
- **Padding:** 넉넉하게(py-6 / px-6, 내부 간격 gap-6).

### Inputs / Fields
- **Style:** 투명 배경 + 쿨 보더, 둥근 모서리 md, 높이 h-9(2.25rem), `shadow-xs`.
- **Focus:** 블루 링 3px + 테두리 블루로 전환.
- **Error:** aria-invalid 시 destructive 링·테두리.

### Navigation (Header)
- 상단 고정 헤더 + 브랜드 블루 로고. 활성 항목은 블루로 표시. 모바일은 시트/드롭다운으로 접는다.

## Do's and Don'ts

### Do:
- **Do** 강조가 필요하면 코발트 러닝 블루(#2f58e0)를 쓴다 — 포인트 색은 이 블루 하나다.
- **Do** 요소 구분은 얇은 테두리(#e5eaf1)로 먼저 한다. 면은 평평하게 둔다.
- **Do** 모집 상태는 그린/레드/앰버 단색 채움 + 흰 글자로 즉시 읽히게 한다.
- **Do** 본문은 17px / 행간 1.7을 유지한다.
- **Do** 모서리는 둥글게(버튼 10px, 카드 16px, 배지 full) — 친근한 톤을 지킨다.

### Don't:
- **Don't** 블루 말고 새 강조색을 만들지 않는다.
- **Don't** 초록·빨강·노랑을 상태 의미 밖의 장식·일반 강조로 쓰지 않는다.
- **Don't** 그림자를 키워 카드를 띄우지 않는다(Border-First).
- **Don't** 날카로운 직각 모서리를 쓰지 않는다.
- **Don't** 케빈스룸 원본의 3D 캐릭터·풀블리드 히어로·MOQ 커머스 문법을 가져오지 않는다 —
  참고한 것은 색·타이포 토큰까지다.
