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

    // unreadCount는 방마다 count 쿼리로 집계(마이그레이션 없이) — 방 수가 적어 N+1 부담 미미.
    // last_read_at 이후 도착한, 내가 보내지 않은 메시지 수.
    const rooms = (data ?? []) as unknown as Omit<MyChatRoomView, "unreadCount">[]
    const withUnread = await Promise.all(
        rooms.map(async (room) => {
            let countQuery = supabase
                .from("chat_messages")
                .select("id", { count: "exact", head: true })
                .eq("chat_id", room.chat.id)
                .neq("sender_id", userId)
            if (room.last_read_at) {
                countQuery = countQuery.gt("created_at", room.last_read_at)
            }
            const { count } = await countQuery
            return { ...room, unreadCount: count ?? 0 }
        }),
    )

    return ok(withUnread)
}
