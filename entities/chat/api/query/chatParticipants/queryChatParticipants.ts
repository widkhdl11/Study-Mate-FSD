import { ChatParticipant } from "@/entities/chat/model/types"
import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"
import { checkChatParticipant } from "../checkChatParticipant"

export type QueryChatParticipantsError =
| { readonly kind: "Forbidden", readonly chatId: number }
| { readonly kind: "Infra", readonly message: string }

/** 채팅방 참여자 목록 조회 (참여자만 접근 가능) */
export async function queryChatParticipants(
    supabase: SupabaseClient,
    chatId: number,
    userId: string,
): Promise<Result<ChatParticipant[], QueryChatParticipantsError>> {
    const isMember = await checkChatParticipant(supabase, chatId, userId)
    if (!isMember) {
        return err({ kind: "Forbidden", chatId })
    }

    const { data, error } = await supabase
        .from("chat_participants")
        .select(`*, profile:profiles!chat_participants_user_id_fkey(username, avatar_url)`)
        .eq("chat_id", chatId)

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    return ok((data ?? []) as unknown as ChatParticipant[])
}
