import { ChatMessage } from "@/entities/chat/model/types"
import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"
import { checkChatParticipant } from "../checkChatParticipant"

export type QueryChatMessagesError =
| { readonly kind: "Forbidden", readonly chatId: number }
| { readonly kind: "Infra", readonly message: string }

/** 채팅방 메시지 목록 조회 (참여자만 접근 가능, 오래된 순) */
export async function queryChatMessages(
    supabase: SupabaseClient,
    chatId: number,
    userId: string,
): Promise<Result<ChatMessage[], QueryChatMessagesError>> {
    const isMember = await checkChatParticipant(supabase, chatId, userId)
    if (!isMember) {
        return err({ kind: "Forbidden", chatId })
    }

    const { data, error } = await supabase
        .from("chat_messages")
        .select(`*, profile:profiles!chat_messages_sender_id_fkey(username, avatar_url)`)
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    return ok((data ?? []) as unknown as ChatMessage[])
}
