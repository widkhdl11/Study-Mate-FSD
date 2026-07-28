import { StudyFromRowError, StudyRow } from "@/entities/study/model/Study";
import { StudyResponse, toStudyView } from "@/entities/study/model/types";
import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";

export type QueryGetMyStudiesError =
| { readonly kind: "Mapping"; readonly cause: StudyFromRowError }
| { readonly kind: "Infra"; readonly message: string }
| { readonly kind: "InvalidData"; readonly message: string };

export async function queryMyStudies(supabase: SupabaseClient, userId: string): Promise<Result<StudyResponse[], QueryGetMyStudiesError>> {
    const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('creator_id', userId)

    if (error) {
        return err({ kind: "Infra", message: error.message });
    }
    return ok(((data ?? []) as StudyRow[]).map(toStudyView));
}