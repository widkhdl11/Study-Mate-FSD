import { NotificationType } from "../model/types";

// entities/notification/lib/notificationMessage.ts
export type NotificationContext = {
  senderName: string
  targetTitle: string   // 스터디 제목 등
}
export function notificationMessage(
  type: NotificationType,
  ctx: NotificationContext,
): { title: string; content: string } {
  switch (type) {
    case 'participant_request':
      return { title: '새로운 참가요청',
               content: `${ctx.senderName}님이 "${ctx.targetTitle}" 스터디에 참가 요청을 보내셨습니다.` }
    case 'request_accepted':
      return { title: '참가 승인',
               content: `"${ctx.targetTitle}" 스터디 참가가 승인되었습니다.` }
    case 'request_rejected':
      return { title: '참가 거절', content: `"${ctx.targetTitle}" 참가 요청이 거절되었습니다.` }
    case 'new_participant':
      return { title: '새 참여자', content: `${ctx.senderName}님이 "${ctx.targetTitle}"에 참여했습니다.` }
    case 'participant_left':
      return { title: '참여자 탈퇴', content: `${ctx.senderName}님이 "${ctx.targetTitle}"에서 탈퇴했습니다.` }
    case 'participant_kicked':
      return { title: '강퇴', content: `${ctx.senderName}님이 "${ctx.targetTitle}"에서 강퇴되었습니다.` }
  }
}
