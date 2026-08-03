import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"

export type QueryPostsCountError =
    | { readonly kind: "Infra"; readonly message: string }

// 전체 모집글 개수. 홈 히어로 스탯용.
export async function queryPostsCount(
    supabase: SupabaseClient,
): Promise<Result<number, QueryPostsCountError>> {
    const { count, error } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    return ok(count ?? 0)
}
