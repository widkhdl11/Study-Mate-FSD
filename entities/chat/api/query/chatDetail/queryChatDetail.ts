import { ChatRoom } from "@/entities/chat/model/types"
import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"
import { checkChatParticipant } from "../checkChatParticipant"

export type QueryChatDetailError =
| { readonly kind: "Forbidden", readonly chatId: number }
| { readonly kind: "NotFound", readonly chatId: number }
| { readonly kind: "Infra", readonly message: string }

/** 채팅방 정보 조회 (참여자만 접근 가능) */
export async function queryChatDetail(
    supabase: SupabaseClient,
    chatId: number,
    userId: string,
): Promise<Result<ChatRoom, QueryChatDetailError>> {
    const isMember = await checkChatParticipant(supabase, chatId, userId)
    if (!isMember) {
        return err({ kind: "Forbidden", chatId })
    }

    const { data, error } = await supabase
        .from("chats")
        .select(`*, profile:profiles!chats_creator_id_fkey(username, avatar_url)`)
        .eq("id", chatId)
        .maybeSingle()

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }
    if (!data) {
        return err({ kind: "NotFound", chatId })
    }

    return ok(data as unknown as ChatRoom)
}
