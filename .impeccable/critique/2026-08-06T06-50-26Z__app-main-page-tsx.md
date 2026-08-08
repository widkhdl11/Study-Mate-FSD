---
target: 홈
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-06T06-50-26Z
slug: app-main-page-tsx
---
# 홈 Critique (dual-agent, browser skipped)
Design Health: 26/40 (Acceptable). 구체성: category-interchangeable.
## Priority Issues
- [P1] AIRecommendedStudies text-yellow-500 (One Blue 위반) → text-primary
- [P1] 신규/무프로필 유저에 AI error 카드 첫 노출 → 숨김/온보딩
- [P1] 히어로 CTA 우선순위 역전(만들기>찾기) → 교체
- [P2] PostCard 정보 과밀 + raw study.createdAt(L103) 중복
- [P2] 풀블리드 히어로/animate-float/shadow-lg (DESIGN 금지 문법 + Border-First 위반)
Detector: 0건(clean). 브라우저 SKIP.
Personas: Jordan(첫화면 죽은 AI섹션·만들기 우선), Casey(초대형 여백·상시 모션·reduced-motion 미가드).
