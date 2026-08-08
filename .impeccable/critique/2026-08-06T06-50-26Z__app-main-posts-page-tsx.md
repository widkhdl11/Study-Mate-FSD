---
target: 모집글 목록
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-06T06-50-26Z
slug: app-main-posts-page-tsx
---
# 모집글 목록 Critique (dual-agent, browser skipped)
Design Health: 24/40 (Acceptable).
## Priority Issues
- [P0] 상태 배지 전부 회색: getStatusColor(L47) 라벨분기 vs 값 전달 미스 → getStudyStatusColor 사용
- [P1] 정렬 기능 부재(최신/마감임박/인원)
- [P1] 결과 카운터 오정보("모집중" 고정, L350)
- [P2] 필터 URL 미반영(공유·뒤로가기 불가), 가짜 무한스크롤(L513), 1000건 클라이언트 필터 성능
- [P3] 필터 6셀렉트 과밀 + ⚡ 이모지
Detector: 2건 — bounce-easing(L513, 약한 오탐), design-system-font-size text-[10px](L457). 브라우저 SKIP.
Personas: Riley(전량로드·0/검색결과 구분X·maxParticipants=0 나눗셈 NaN), Casey(모바일 필터 상단 적재).
