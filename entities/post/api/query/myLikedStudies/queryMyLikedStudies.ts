import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";

/** 내가 좋아요한 글이 속한 스터디의 카테고리·지역 — 이차 관심 신호 */
export type MyLikedStudyView = {
    studyCategory: string;
    region: string;
};

export type QueryMyLikedStudiesError =
    | { readonly kind: "Infra"; readonly message: string };

/**
 * 내가 좋아요한 글 → 연결 스터디의 카테고리·지역만 얇게 조회.
 * 관심 신호 집계 전용이라 스터디 전체가 아닌 분류 필드만 가져온다.
 */
export async function queryMyLikedStudies(
    supabase: SupabaseClient,
    userId: string,
): Promise<Result<MyLikedStudyView[], QueryMyLikedStudiesError>> {
    const { data, error } = await supabase
        .from("likes")
        .select(
            `post:posts!likes_post_id_fkey ( study:studies!posts_study_id_fkey ( study_category, region ) )`,
        )
        .eq("user_id", userId);

    if (error) return err({ kind: "Infra", message: error.message });

    const rows = (data ?? []) as unknown as Array<{
        post: { study: { study_category: string; region: string } | null } | null;
    }>;

    return ok(
        rows
            .map((r) => r.post?.study)
            .filter((s): s is { study_category: string; region: string } => s != null)
            .map((s) => ({ studyCategory: s.study_category, region: s.region })),
    );
}
