import { ChatMessage } from "@/entities/chat/model/types"
import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"
import { checkChatParticipant } from "../checkChatParticipant"

export type QueryChatMessagesError =
| { readonly kind: "Forbidden", readonly chatId: number }
| { readonly kind: "Infra", readonly message: string }

/** 페이지네이션 옵션 — 최근 limit개만, before(ISO created_at) 이전 것만 */
export interface QueryChatMessagesOptions {
    limit?: number
    /** 이 시각(ISO)보다 오래된 메시지만 — 위로 스크롤해 이전 페이지를 가져올 때의 커서 */
    before?: string | null
}

/**
 * 채팅방 메시지 목록 조회 (참여자만 접근 가능).
 * limit이 있으면 최근 것부터 limit개를 가져와 **오래된 순으로 뒤집어** 반환한다(화면 표시 순서).
 * before가 있으면 그보다 오래된 메시지만(이전 페이지). 옵션이 없으면 전체를 오래된 순으로 반환.
 */
export async function queryChatMessages(
    supabase: SupabaseClient,
    chatId: number,
    userId: string,
    options?: QueryChatMessagesOptions,
): Promise<Result<ChatMessage[], QueryChatMessagesError>> {
    const isMember = await checkChatParticipant(supabase, chatId, userId)
    if (!isMember) {
        return err({ kind: "Forbidden", chatId })
    }

    // 페이지네이션을 위해 최신순으로 뽑고(created_at desc, id desc 타이브레이크) 마지막에 뒤집는다.
    let query = supabase
        .from("chat_messages")
        .select(`*, profile:profiles!chat_messages_sender_id_fkey(username, avatar_url)`)
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })

    if (options?.before) {
        query = query.lt("created_at", options.before)
    }
    if (options?.limit) {
        query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    // 최신순으로 받은 걸 화면 표시용(오래된→최신)으로 뒤집어 반환.
    const rows = (data ?? []) as unknown as ChatMessage[]
    return ok(rows.reverse())
}
