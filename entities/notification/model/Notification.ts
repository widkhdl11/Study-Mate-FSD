import { UserId, UserIdError } from "@/entities/user";
import { Brand } from "@/shared/kernel/Id";
import { ok, Result } from "@/shared/kernel/Result";
import { NotificationContext, notificationMessage } from "../lib/notificationMessage";
import { NotificationId, NotificationIdError } from "./NotificationId";
import { NotificationReference, NotificationReferenceError } from "./NotificationReference";
import type { NotificationType } from "./NotificationType";
import { NotificationInsert, NotificationInsertRow } from "./types";

// 알림 엔티티의 캐논(정본) 도메인 shape — camel.
//
// Study/Participant와 달리 behavior 모듈(fromRow/transition/Policy)이 없다:
//   생애주기가 발행 → is_read↑ → is_deleted↑ 뿐이고 전이 규칙이 빈약한
//   "read 위주" 엔티티라, 모델링할 도메인 규칙이 사실상 없다.
//   → 상태 토글은 features의 mutation(id로 flag update)이 담당하고,
//     여기서는 "정본 타입"만 정의한다.
//
// 파생 read DTO(NotificationView)는 이 타입에서 Pick으로 깎는다.
// Row(snake) → 이 shape 매핑은 api/query/.../toView 에서:
//   type   = isNotificationType(row.type) 로 걸러 fallback
//   reference = NotificationReference.parse(row.reference_type, row.reference_id)
export type Notification = Brand<
Readonly<{
  readonly id: NotificationId;
  readonly userId: UserId; 
  readonly type: NotificationType;
  readonly title: string;
  readonly content: string;
  readonly isRead: boolean;
  readonly isDeleted: boolean; // soft delete
  readonly reference: NotificationReference; 
  readonly senderId: UserId
  readonly createdAt: string;
}>, "Notification">;

export type NotificationError = 
| { readonly kind: 'InvalidUserId', readonly value: UserId }
| { readonly kind: 'InvalidNotificationType', readonly value: NotificationType }
| { readonly kind: 'InvalidNotificationReference', readonly value: NotificationReference }
| { readonly kind: 'InvalidNotificationContext', readonly value: NotificationContext }


type NotificationCreateProps = {
    userId: UserId;
    type: NotificationType;
    senderId: UserId;
    reference: NotificationReference;
    ctx: NotificationContext;        // { senderName, targetTitle }
}

export type NotificationFromRowError = {
    readonly kind: 'InvalidId';
    readonly cause: NotificationIdError;
} | {
    readonly kind: 'InvalidUserId';
    readonly cause: UserIdError;
} | {
    readonly kind: 'InvalidNotificationType';
    readonly value: string
} | {
    readonly kind: 'InvalidNotificationReference';
    readonly value: NotificationReferenceError;
}

export const Notification = {
    createNew: (props: NotificationCreateProps): Result<NotificationInsert, NotificationError> => {
        const { title, content } = notificationMessage(props.type, props.ctx);
        const { ctx, ...rest } = props;                    // ← ctx 분리

        return ok({ ...rest, title, content, isRead: false, isDeleted: false } as NotificationInsert);
    },
    toInsertRow: (notification: NotificationInsert): NotificationInsertRow => {
        
        return {
            user_id: notification.userId,
            title: notification.title,
            content: notification.content,
            type: notification.type,
            reference_type: notification.reference?.kind,
            reference_id: notification.reference?.id,
            sender_id: notification.senderId,
            is_read: false,
            is_deleted: false,
        }
    }
}
