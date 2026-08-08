---
target: 모집글 목록
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-06T08-45-43Z
slug: app-main-posts-page-tsx
---
# 모집글 목록 Critique (re-run, dual-agent, browser skipped)
Design Health: 26/40 (Acceptable). 이전 24/40. 상태색 P0 해소, 정렬·페이지네이션 추가.
Detector: 0건(clean) — 이전 2건(bounce-easing, text-[10px]) 모두 사라짐.
## Remaining (일부 신규 발견)
- [P1] fetch 실패 시 notFound()로 전체 404(page.tsx) — 인라인 에러+재시도 권장.
- [P1] 필터 URL 미동기화(의도적 보류 — 사용자 학습용).
- [P1] 카드 제목 line-clamp-1 → 긴 제목 구분 불가, line-clamp-2 권장.
- [P2] ⚡ 이모지(필터 헤더) 톤/One Blue 이탈, lucide 아이콘 교체.
- [P2] 사이드바 6-select 밀도, 검색 무디바운스(매 입력 전건 재계산).
- [P3] sentinel 문자열 불일치, 카드 제목 <h1> 다중(시맨틱).
## Strengths
- getStudyStatusColor 중앙화(Status-Only), Border-First 카드(hover:border), 더보기+정렬+정직 카운터+filterSignature 리셋.
