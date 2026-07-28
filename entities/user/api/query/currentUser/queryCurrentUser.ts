import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"
import { CurrentUserResponse, CurrentUserRow } from "./types"

export type QueryCurrentUserError =
| { readonly kind: "Infra", readonly message: string }

function toCurrentUserResponse(row: CurrentUserRow): CurrentUserResponse {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        avatarUrl: row.avatar_url,
    }
}

// 비로그인은 정상 상태(ok(null)), DB 조회 실패만 err(Infra).
export async function queryCurrentUser(supabase: SupabaseClient): Promise<Result<CurrentUserResponse | null, QueryCurrentUserError>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ok(null)
    }
    const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    return ok(toCurrentUserResponse(data as CurrentUserRow))
}