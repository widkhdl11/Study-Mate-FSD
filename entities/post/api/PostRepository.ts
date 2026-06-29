import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import { DeletePostIntent, Post, PostFromRowError, PostInsert } from "../model/Post";
import { PostId } from "../model/PostId";



export type PostRepositoryError =
| { readonly kind : "NotFound", readonly id : PostId }
| { readonly kind : "Infra", readonly message : string }
| { readonly kind : "Mapping", readonly cause : PostFromRowError }


export async function findPostById(supabase: SupabaseClient, id: PostId): Promise<Result<Post, PostRepositoryError>> {
    
    const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

    if (error) {
        if (error.code === "PGRST116") {
            return err({ kind: "NotFound", id });
        }
        return err({ kind: "Infra", message: error.message });
    }
    const postResult = Post.fromRow(data)
    if (!postResult.ok) {
        return err({ kind: "Mapping", cause: postResult.error });
    }
    return postResult;
}


export async function createPost(supabase: SupabaseClient, post: PostInsert): Promise<Result<Post, PostRepositoryError>> {


    const postInsertRow = Post.toInsertRow(post)

    const { data, error } = await supabase
    .from("posts")
    .insert(postInsertRow)
    .select()
    .single();

    if (error) {
        return err({ kind: "Infra", message: error.message });
    }
    const postResult = Post.fromRow(data)
    if (!postResult.ok) {
        return err({ kind: "Mapping", cause: postResult.error });
    }
    return postResult;
}

export async function updatePost(supabase: SupabaseClient, post: Post): Promise<Result<Post, PostRepositoryError>> {


    const postRow = Post.toRow(post)

    console.log("postRow : ", postRow)
    const { data, error } = await supabase
    .from("posts")
    .update(postRow)
    .eq("id", post.id)
    .select()
    .single();
    if (error) {
        if (error.code === "PGRST116") {
            return err({ kind: "NotFound", id: post.id });
        }
        return err({ kind: "Infra", message: error.message });
    }
    const postResult = Post.fromRow(data)
    if (!postResult.ok) {
        return err({ kind: "Mapping", cause: postResult.error });
    }
    return postResult;
}

export async function deletePost(supabase: SupabaseClient, deletePostIntent: DeletePostIntent): Promise<Result<void, PostRepositoryError>> {
    const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", deletePostIntent.id);
    if (error) {
        return err({ kind: "Infra", message: error.message });
    }
    return ok(undefined);
}

