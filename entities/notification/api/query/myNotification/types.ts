import { NotificationResponse, NotificationRow } from "@/entities/notification/model/types";
import { ProfileResponse, ProfileRow } from "@/entities/user";

// 조인 조회 Row (알람 + 보낸사람 프로필 일부)
type selectedProfileRow = Pick<ProfileRow, "username" | "avatar_url">
export type selectedNotificationRow = NotificationRow & {
    sender: selectedProfileRow
}

// 읽기 투영 DTO
type NotificationSenderView = Pick<ProfileResponse, "username" | "avatarUrl">
export type NotificationView = NotificationResponse & {
    sender: NotificationSenderView
}
