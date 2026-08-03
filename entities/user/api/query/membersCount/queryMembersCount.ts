import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"

export type QueryMembersCountError =
    | { readonly kind: "Infra"; readonly message: string }

// 전체 회원(프로필) 개수. 홈 히어로 스탯용.
export async function queryMembersCount(
    supabase: SupabaseClient,
): Promise<Result<number, QueryMembersCountError>> {
    const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    return ok(count ?? 0)
}
