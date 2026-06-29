'use server'

import { PostFromRowError } from "@/entities/post/model/Post";
import { createClient } from "@/shared/api/supabase/server";
import { ok, Result } from "@/shared/kernel/Result";
import { notFound } from "next/navigation";
import { PostsWithStudyRow } from "./row";
import { toPostsWithStudyView } from "./toView";
import { PostsWithStudyView } from "./view";

export type QueryPostsWithStudyError =
  | { readonly kind: "NotFound" }
  | { readonly kind: "Mapping"; readonly cause: PostFromRowError }
  | { readonly kind: "Infra"; readonly message: string };

export async function queryMyPostsWithStudy(): Promise<Result<PostsWithStudyView, QueryPostsWithStudyError>> {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }
  const id = user.user.id;
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
  .eq("author_id", id)
  .order("created_at", { ascending: false });

  if (error) {
    notFound();
  }

  if (!data || data.length === 0) {
    return ok([]);
  }
  const rows = data as unknown as PostsWithStudyRow;
  return ok(toPostsWithStudyView(rows));
}