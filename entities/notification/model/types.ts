export type NotificationResponse = {
    id: number;
    user_id: string;
    created_at: string;
    type: string;
    title: string;
    content: string;
    is_read: boolean;
    is_deleted: boolean;
    reference_type: string | null;
    reference_id: number | null;
    sender_id: string | null;
}

export type NotificationInsert = {
    user_id: string;
    type: string;
    title: string;
    content: string;
    is_read: boolean;
    is_deleted: boolean;
    reference_type: string | null;
    reference_id: number | null;
    sender_id: string | null;
}

export type NotificationType =
  | 'participant_request' // 참가 신청
  | 'request_accepted' // 참가 승인
  | 'request_rejected' // 참가 거절
  | 'new_participant' // 새로운 참여자
  | 'participant_left'     // 참여자 탈퇴
  | 'participant_kicked';  // 강퇴
