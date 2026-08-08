import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"

export type QueryStudyChatRoomError =
    | { readonly kind: "NotFound", readonly studyId: number }
    | { readonly kind: "Infra", readonly message: string }

/** 스터디의 그룹 채팅방 id 조회 (chats.study_id, 스터디별 그룹챗 1:1) */
export async function queryStudyChatRoom(
    supabase: SupabaseClient,
    studyId: number,
): Promise<Result<{ id: number }, QueryStudyChatRoomError>> {
    const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("study_id", studyId)
        .eq("is_group", true)
        .maybeSingle()

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }
    if (!data) {
        return err({ kind: "NotFound", studyId })
    }

    return ok(data as { id: number })
}
