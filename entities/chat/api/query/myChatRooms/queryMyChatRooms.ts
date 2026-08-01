import { MyChatRoomView } from "@/entities/chat/model/types"
import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"

export type QueryMyChatRoomsError =
| { readonly kind: "Infra", readonly message: string }

/** 내가 참여 중인 채팅방 목록 (마지막 메시지 포함, 최신순) */
export async function queryMyChatRooms(
    supabase: SupabaseClient,
    userId: string,
): Promise<Result<MyChatRoomView[], QueryMyChatRoomsError>> {
    const { data, error } = await supabase
        .from("chat_participants")
        .select(`
            *,
            chat:chats(*),
            profile:profiles!chat_participants_user_id_fkey(username, avatar_url)
        `)
        .eq("user_id", userId)
        .order("chat(last_message_at)", { ascending: true })

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    return ok((data ?? []) as unknown as MyChatRoomView[])
}
