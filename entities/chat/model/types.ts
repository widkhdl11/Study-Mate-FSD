/** profiles 조인 브리프 (username + avatar) — 채팅 읽기 DTO 공통 조각 */
export interface ChatUserBrief {
    username: string
    avatar_url: string | null
}

/** chats 테이블 row 미러 (DB 스키마 그대로) */
export interface ChatRow {
    id: number
    study_id: number | null
    is_group: boolean
    name: string | null
    creator_id: string | null
    last_message: string | null
    last_message_at: string | null
    created_at: string | null
    updated_at: string | null
}

/** chat_messages row + 발신자 프로필 (queryChatMessages) */
export interface ChatMessage {
    id: number
    chat_id: number
    content: string
    sender_id: string | null
    created_at: string | null
    profile: ChatUserBrief
}

/** chat_participants row + 프로필 (queryChatParticipants) */
export interface ChatParticipant {
    id: number
    chat_id: number
    user_id: string
    created_at: string | null
    last_read_at: string | null
    profile: ChatUserBrief
}

/** 채팅방 상세: chats row + 생성자 프로필 (queryChatDetail) */
export interface ChatDetailView extends ChatRow {
    profile: ChatUserBrief
}

/** 내 채팅방 목록 항목: chat_participants row + 중첩 chat + 프로필 (queryMyChatRooms) */
export interface MyChatRoomView {
    id: number
    chat_id: number
    user_id: string
    created_at: string | null
    last_read_at: string | null
    chat: ChatRow
    profile: ChatUserBrief
    /** 내 last_read_at 이후 도착한, 내가 보내지 않은 메시지 수 (queryMyChatRooms가 방별로 집계) */
    unreadCount: number
}
