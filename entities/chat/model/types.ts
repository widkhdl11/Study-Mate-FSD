export interface ChatMessage {
    id: string | null
    chat_id: string
    user_id: string
    content: string
    created_at: string
    profile: {
        username: string
        avatar_url: string | null
    }
}

export interface ChatParticipant {
    id: string
    chat_id: string
    user_id: string
    created_at: string
    last_read_at: string

    profile: {
        username: string
        avatar_url: string | null
    }
}

export interface ChatRoom {
    id: number
    study_id: number
    is_group: boolean
    name: string
    profile: {
        username: string
        avatar_url: string | null
    }
    created_at: string
    last_message_at: string
    chat: {
        id: number
        name: string
        created_at: string
        creator_id: string
        study_id: number
        is_group: boolean
        last_message: string
        last_message_at: string
    }
}
