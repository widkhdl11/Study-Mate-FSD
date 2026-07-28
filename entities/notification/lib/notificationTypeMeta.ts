import type { NotificationType } from "../model/NotificationType";

// 알림 타입별 표시 메타(label/icon). 도메인 타입(NotificationType)에 의존하므로 shared 불가 → entities/notification/lib.
export const NOTIFICATION_TYPE_META: Record<NotificationType, { label: string; icon: string }> = {
  participant_request: { label: '참가 신청',  icon: '👋' },
  request_accepted:    { label: '참가 승인',  icon: '✅' },
  request_rejected:    { label: '참가 거절',  icon: '❌' },
  new_participant:     { label: '새 참여자',  icon: '👋' },
  participant_left:    { label: '참여자 탈퇴', icon: '👋' },
  participant_kicked:  { label: '강퇴',       icon: '🚫' },
}
