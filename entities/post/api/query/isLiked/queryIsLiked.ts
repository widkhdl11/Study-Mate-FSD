import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";

export type QueryIsLikedError =
    | { readonly kind: "Infra"; readonly message: string };

// 특정 유저가 특정 글에 좋아요를 눌렀는지 여부.
export async function queryIsLiked(
    supabase: SupabaseClient,
    postId: number,
    userId: string
): Promise<Result<boolean, QueryIsLikedError>> {
    const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        return err({ kind: "Infra", message: error.message });
    }
    return ok(!!data);
}
