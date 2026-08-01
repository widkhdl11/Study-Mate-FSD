import { MyProfileCountResponse } from "@/entities/user/model/types"
import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"

export type QueryMyProfileCountError =
| { readonly kind: "Infra", readonly message: string }

export async function queryMyProfileCount(
    supabase: SupabaseClient,
    userId: string,
): Promise<Result<MyProfileCountResponse, QueryMyProfileCountError>> {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            posts!posts_author_id_fkey(count),
            participants!participants_user_id_fkey(count),
            chat_participants!chat_participants_user_id_fkey(count)
        `)
        .eq('id', userId)
        .single()

    if (error) {
        return err({ kind: 'Infra', message: error.message })
    }

    return ok({
        myPostsCount: data.posts?.[0]?.count ?? 0,
        myParticipatedStudiesCount: data.participants?.[0]?.count ?? 0,
        myParticipatedChatRoomsCount: data.chat_participants?.[0]?.count ?? 0,
    })
}
