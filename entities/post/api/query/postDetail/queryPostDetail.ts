'use server';

import { createClient } from "@/shared/api/supabase/server";
import { err, ok, Result } from "@/shared/kernel/Result";
import { PostDetailQueryRow } from "./row";
import { toPostDetailView } from "./toView";
import { PostDetailView } from "./view";


export type QueryPostDetailError =
  | { readonly kind: "NotFound" }
  | { readonly kind: "Infra"; readonly message: string };

export async function queryPostDetail(id: number): Promise<Result<PostDetailView, QueryPostDetailError>> {
  const supabase = await createClient();
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