import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";

/** 내가 신청/참여한 스터디 한 건 — 관심 신호 + 활동 요약 재료 */
export type MyParticipationView = {
    studyId: number;
    title: string;
    studyCategory: string;
    region: string;
    status: string; // pending | accepted | rejected 등
};

export type QueryMyParticipationsError =
    | { readonly kind: "Infra"; readonly message: string };

/**
 * 내가 신청/참여한 스터디 목록 (스터디 카테고리·지역·내 참여 상태 포함).
 * 홈 개인화의 최강 관심 신호이자 "참여 중/대기" 활동 요약의 원천.
 */
export async function queryMyParticipations(
    supabase: SupabaseClient,
    userId: string,
): Promise<Result<MyParticipationView[], QueryMyParticipationsError>> {
    const { data, error } = await supabase
        .from("participants")
        .select(
            `status, study:studies!participants_study_id_fkey ( id, title, study_category, region )`,
        )
        .eq("user_id", userId);

    if (error) return err({ kind: "Infra", message: error.message });

    const rows = (data ?? []) as unknown as Array<{
        status: string | null;
        study: { id: number; title: string; study_category: string; region: string } | null;
    }>;

    return ok(
        rows
            .filter((r) => r.study != null)
            .map((r) => ({
                studyId: r.study!.id,
                title: r.study!.title,
                studyCategory: r.study!.study_category,
                region: r.study!.region,
                status: r.status ?? "unknown",
            })),
    );
}
