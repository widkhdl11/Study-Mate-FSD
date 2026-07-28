// entities/notification/model/NotificationType.ts — 순수 도메인 분류 (이모지/라벨 없음)
export const NOTIFICATION_TYPES = [
  'participant_request',
  'request_accepted',
  'request_rejected',
  'new_participant',
  'participant_left',
  'participant_kicked',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

// 경계 변환: DB의 자유 text → 아는 타입인지 (모르면 false → UI에서 fallback)
export const isNotificationType = (s: string): s is NotificationType =>
  (NOTIFICATION_TYPES as readonly string[]).includes(s)
