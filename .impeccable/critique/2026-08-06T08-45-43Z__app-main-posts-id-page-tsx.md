---
target: 모집글 상세
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-06T08-45-43Z
slug: app-main-posts-id-page-tsx
---
# 모집글 상세 Critique (re-run, dual-agent, browser skipped)
Design Health: 27/40 (Acceptable). 이전 20/40 → P0 전부 해소.
Detector: 0건(clean).
## Remaining
- [P1] 모집 상태(모집중/마감) vs 개인 참여 상태를 배지 한 축에 혼동(SidebarSection:22). 정원/마감돼도 "모집중"+신청버튼.
- [P2] 수락 대기중 신청 취소/철회 경로 없음(ParticipantActionSlot).
- [P2] 거절 후 다음 행동(재신청/다른 스터디) 없음 — 막다른 길.
- [P3] 이중 상태 라벨 체계(participants.ts). 미사용 SidebarSkeleton.
## Strengths
- 상태색 규칙 교과서적, a11y(aria-pressed/progressbar), 승인 후 채팅 직링크로 원스톱 연결.
