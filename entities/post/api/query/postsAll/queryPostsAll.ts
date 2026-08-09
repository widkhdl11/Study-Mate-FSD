import { PostFromRowError } from "@/entities/post/model/Post";
import { toPostView } from "@/entities/post/model/types";
import { toStudyView } from "@/entities/study/model/types";
import { toUserSummaryView } from "@/entities/user/model/types";
import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import { PostWithStudyRow, PostWithStudyView } from "./types";

// post + study + creator 조립 (필드 매핑은 각 엔티티 canonical 매퍼 소유).
function toPostsAllView(rows: PostWithStudyRow[]): PostWithStudyView[] {
  return rows.map((row) => ({
    ...toPostView(row),
    study: {
      ...toStudyView(row.study),
    },
    author: toUserSummaryView(row.author),
  }));
}

type QueryPostsAllError = {
  readonly kind: "Infra";
  readonly message: string;
} | {
  readonly kind: "Mapping";
  readonly cause: PostFromRowError;
};

export async function queryAllPosts(supabase: SupabaseClient): Promise<Result<PostWithStudyView[], QueryPostsAllError>> {
  const { data, error } = await supabase
  .from("posts")
  .select(
      `
      id,
      author_id,
      study_id,
      title,
      content,
      image_url,
      likes_count,
      views_count,
      comments_count,
      created_at,
      updated_at,
      study:study_id!inner (
        id,
        creator_id,
        title,
        description,
        study_category,
        region,
        max_participants,
        current_participants,
        status,
        created_at,
        updated_at
      ),
      author:author_id (
        id,
        username,
        email,
        avatar_url
      )
    `
    )
    .in("study.status", ["recruiting", "completed"])
    .order("created_at", { ascending: false });


  if (error) {
    return err({ kind: "Infra", message: error.message });
  }
  const postsResult = data as unknown as PostWithStudyRow[];
  const postsViewResult = toPostsAllView(postsResult);

  return ok(postsViewResult);
}