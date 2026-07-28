import { UserId } from "@/entities/user";
import { NotificationReference } from "./NotificationReference";

export type NotificationResponse = {
    id: number;
    userId: string;
    createdAt: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    isDeleted: boolean;
    referenceType: string;
    referenceId: number;
    senderId: string;
}


export type NotificationRow = {
  id: number;
  user_id: string;
  type: string;
  title: string;
  content: string;
  reference_type: string;
  reference_id: number;
  sender_id: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
}

export type NotificationInsertRow = {
  user_id: string
  type: string
  title: string
  content: string
  reference_type: string
  reference_id: number
  sender_id: string
  is_read: boolean
  is_deleted: boolean
}

export type NotificationInsert = {
    userId: UserId;
    type: NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    isDeleted: boolean;
    reference: NotificationReference;
    senderId: UserId;
}

export type NotificationType =
  | 'participant_request' // 참가 신청
  | 'request_accepted' // 참가 승인
  | 'request_rejected' // 참가 거절
  | 'new_participant' // 새로운 참여자
  | 'participant_left'     // 참여자 탈퇴
  | 'participant_kicked';  // 강퇴

