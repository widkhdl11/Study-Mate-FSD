import { toPostView } from "@/entities/post/model/types";
import { toUserSummaryView } from "@/entities/user/model/types";
import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import { PostDetailQueryRow, PostDetailView } from "./types";


export type QueryPostDetailError =
  | { readonly kind: "NotFound" }
  | { readonly kind: "Infra"; readonly message: string };

function toPostDetailView(row: PostDetailQueryRow): PostDetailView {
  return {
    ...toPostView(row),
    // study는 상세 전용 subset(creator_id/updated_at 미선택)이라 인라인 유지
    study: {
      id: row.study.id,
      title: row.study.title,
      description: row.study.description,
      studyCategory: row.study.study_category,
      region: row.study.region,
      maxParticipants: row.study.max_participants,
      currentParticipants: row.study.current_participants,
      status: row.study.status,
      createdAt: row.study.created_at,
    },
    author: toUserSummaryView(row.author),
  };
}

export async function queryPostDetail(supabase: SupabaseClient, id: number): Promise<Result<PostDetailView, QueryPostDetailError>> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey (
        id,
        email,
        username,
        avatar_url
      ),
      study:studies!posts_study_id_fkey (
        id,
        title,
        study_category,
        region,
        status,
        max_participants,
        current_participants,
        description,
        created_at
      )
    `)
    .eq("id", id)
    .single();

    if (error){
        if (error.code === "PGRST116") {
            return err({ kind: "NotFound" });
        }
        return err({ kind: "Infra", message: error.message });
    }

    const row = data as PostDetailQueryRow;
    return ok(toPostDetailView(row));
}