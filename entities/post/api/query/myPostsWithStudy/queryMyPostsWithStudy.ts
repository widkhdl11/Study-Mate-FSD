import { PostFromRowError } from "@/entities/post/model/Post";
import { ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { MyPostWithStudyRow, MyPostWithStudyView } from "./types";

export type QueryPostsWithStudyError =
  | { readonly kind: "NotFound" }
  | { readonly kind: "Mapping"; readonly cause: PostFromRowError }
  | { readonly kind: "Infra"; readonly message: string };

function toPostsWithStudyView(rows: MyPostWithStudyRow[]): MyPostWithStudyView[] {
  return rows.map(row => ({
    id: row.id,
    studyId: row.study_id,
    authorId: row.author_id,
    title: row.title,
    content: row.content,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    viewsCount: row.views_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    imageUrl: row.image_url,
    study: {
      id: row.study.id,
      creatorId: row.study.creator_id,
      title: row.study.title,
      description: row.study.description,
      studyCategory: row.study.study_category,
      region: row.study.region,
      maxParticipants: row.study.max_participants,
      currentParticipants: row.study.current_participants,
      status: row.study.status,
      createdAt: row.study.created_at,
      updatedAt: row.study.updated_at,
    },
  }));
}

export async function queryMyPostsWithStudy(supabase: SupabaseClient, userId: string): Promise<Result<MyPostWithStudyView[], QueryPostsWithStudyError>> {
  const { data, error } = await supabase
  .from("posts")
  .select(`
    id,
    title,
    content,
    study_id,
    author_id,
    image_url,
    likes_count,
    views_count,
    comments_count,
    created_at,
    updated_at,
    
    study:study_id (
      id,
      title,
      study_category,
      region,
      status,
      max_participants,
      current_participants,
      description,
      creator:creator_id (
        id,
        username,
        email,
        avatar_url
      )
    )`)
  .eq("author_id", userId)
  .order("created_at", { ascending: false });

  if (error) {
    notFound();
  }

  if (!data || data.length === 0) {
    return ok([]);
  }
  const rows = data as unknown as MyPostWithStudyRow[];
  return ok(toPostsWithStudyView(rows));
}