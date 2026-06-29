'use server';
import { err, ok, type Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import type { StudyDetailQueryRow } from "./row";
import { toStudyDetailView } from "./toView";
import type { StudyDetailView } from "./view";

export type QueryStudyDetailError =
  | { readonly kind: "NotFound" }
  | { readonly kind: "Infra"; readonly message: string };

// select는 studyDetailQueryRow의 필드와 1:1 (ARCHITECTURE §5-c 불변식)
export async function queryStudyDetail(
  supabase: SupabaseClient,
  id: number
): Promise<Result<StudyDetailView, QueryStudyDetailError>> {
  const { data, error } = await supabase
    .from("studies")
    .select(
      `
      *,
      creator:profiles!studies_creator_id_fkey (
        id,
        username,
        email,
        avatar_url
      ),
      participants!participants_study_id_fkey (
        id,
        user_id,
        username,
        user_email,
        study_id,
        role,
        status,
        avatar_url,
        created_at,
        updated_at
      ),
      posts!posts_study_id_fkey (
        id,
        title,
        content,
        image_url,
        likes_count,
        views_count,
        created_at
      )
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return err({ kind: "NotFound" });
    }
    return err({ kind: "Infra", message: error.message });
  }

  // 읽기 경계: supabase 추론 ↔ 명명 row 타입 간 정당한 trust-boundary 캐스팅
  const row = data as unknown as StudyDetailQueryRow;
  if (row.participants?.length) {
    row.participants.sort((a, b) => a.id - b.id);
  }
  return ok(toStudyDetailView(row));
}
