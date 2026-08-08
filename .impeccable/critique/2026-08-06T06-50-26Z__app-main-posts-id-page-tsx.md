---
target: 모집글 상세
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-06T06-50-26Z
slug: app-main-posts-id-page-tsx
---
# 모집글 상세 Critique (dual-agent, browser skipped)
Design Health: 20/40 (Poor).
## Priority Issues
- [P0] rejected → "스터디 종료"/"모집 마감"으로 표시(participants.ts:29, ParticipantActionSlot:39) — 거절 불가시
- [P0] 승인 후 채팅 진입 버튼 주석 처리(ParticipantActionSlot:34-36) — 원스톱 마지막 단계 소실
- [P1] "참여중"이 앰버(대기색) 표시(SidebarSection:30 else)
- [P1] 소유자에게 "참여 신청" CTA 노출(자기 글 신청)
- [P2] 신청 실패 피드백 없음 + 진행바 bg-success(Status-Only 위반→primary) + 카드 shadow-md→sm
Detector: 0건(clean). 브라우저 SKIP.
Personas: Jordan(신청 결과 불명확), Sam(aria-live/aria-pressed/progressbar aria 부재).
