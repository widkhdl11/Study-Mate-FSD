import { SupabaseClient } from "@supabase/supabase-js"

/**
 * 해당 유저가 채팅방 참여자인지 확인 (읽기 가드).
 * 채팅방 상세/메시지/참여자 조회 전 접근 권한 체크에 사용.
 */
export async function checkChatParticipant(
    supabase: SupabaseClient,
    chatId: number,
    userId: string,
): Promise<boolean> {
    const { data, error } = await supabase
        .from("chat_participants")
        .select("id")
        .eq("chat_id", chatId)
        .eq("user_id", userId)

    if (error) {
        return false
    }
    return !!data && data.length > 0
}
