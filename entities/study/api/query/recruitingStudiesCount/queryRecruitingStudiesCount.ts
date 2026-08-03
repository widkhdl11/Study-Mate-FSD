import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"

export type QueryRecruitingStudiesCountError =
    | { readonly kind: "Infra"; readonly message: string }

// 모집중(recruiting) 스터디 개수. 홈 히어로 스탯용.
export async function queryRecruitingStudiesCount(
    supabase: SupabaseClient,
): Promise<Result<number, QueryRecruitingStudiesCountError>> {
    const { count, error } = await supabase
        .from("studies")
        .select("*", { count: "exact", head: true })
        .eq("status", "recruiting")

    if (error) {
        return err({ kind: "Infra", message: error.message })
    }

    return ok(count ?? 0)
}
