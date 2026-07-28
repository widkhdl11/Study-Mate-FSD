import type { ParticipantResponse } from "@/entities/participant/model/types";
import { toUserSummaryView } from "@/entities/user/model/types";
import { err, ok, type Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import type { StudyDetailParticipantRow, StudyDetailQueryRow, StudyDetailView } from "./types";

export type QueryStudyDetailError =
  | { readonly kind: "NotFound" }
  | { readonly kind: "Infra"; readonly message: string };

// row(snake, DB 거울) → view(camel, 화면용). 읽기 경계의 유일한 snake→camel 변환 지점.
function toStudyDetailView(row: StudyDetailQueryRow): StudyDetailView {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    studyCategory: row.study_category,
    region: row.region,
    maxParticipants: row.max_participants,
    currentParticipants: row.current_participants,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participants: row.participants.map(toParticipantResponse),
    posts: row.posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      imageUrl: p.image_url,
      likesCount: p.likes_count,
      viewsCount: p.views_count,
      createdAt: p.created_at,
    })),
    creator: toUserSummaryView(row.creator),
  };
}

function toParticipantResponse(p: StudyDetailParticipantRow): ParticipantResponse {
  return {
    id: p.id,
    userId: p.user_id,
    studyId: p.study_id,
    userEmail: p.user_email,
    status: p.status,
    role: p.role,
    username: p.username,
    avatarUrl: p.avatar_url,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

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
