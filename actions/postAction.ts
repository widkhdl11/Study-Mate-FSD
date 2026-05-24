"use server";

import { parseFormData } from "@/lib/parseFormData";
import { buildPostInsert } from "@/lib/posts/buildPostInsert";
import { deletePostImages } from "@/lib/posts/deletePostImages";
import { uploadPostImages } from "@/lib/posts/uploadPostImages";
import { createClient } from "@/lib/supabase/server";
import { PostFormValues, postSchema, UpdatePostFormValues, updatePostSchema } from "@/lib/zod/schemas/postSchema";
import { ActionResponse } from "@/types/actionType";
import { FileMetadata } from "@/types/file";
import { PostDetailResponse, PostsResponse } from "@/types/postType";
import { CustomUserAuth } from "@/utils/auth";
import { validateWithZod } from "@/utils/validation";
import console from "console";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

// 게시글 상세 조회
export async function getPostDetail(id: number): Promise<ActionResponse<PostDetailResponse>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:author_id (
        id,
        email,
        username,
        avatar_url
      ),
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
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("게시글을 찾을 수 없습니다");
  }

  return { success: true, data: data as unknown as PostDetailResponse };
}
// 게시글 생성
export async function createPost(
  formData: FormData
): Promise<ActionResponse | never> {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);

  const rawData = parseFormData(formData, { arrayKeys: ["images"] });
  const parseResult = validateWithZod(postSchema, rawData);
  if (!parseResult.success) {
    return parseResult;
  }
 const validatedData = parseResult.data as PostFormValues; 
 const imageData = validatedData.images && validatedData.images.length > 0
  ? await uploadPostImages(supabase, validatedData.images)
  : [];
 
 const insertData = buildPostInsert(validatedData, user.id, imageData);
 const { data, error } = await supabase.from("posts").insert(insertData).select().single();

  if (error) {
    await supabase.storage.from("post-images").remove(imageData.map(d => d.url));
    throw new Error("게시글 생성에 실패했습니다.");
  }
  revalidatePath("/posts", "layout");
  redirect(`/posts/${data.id}`);
}

// 내 게시글들 가져오기
export async function getMyPosts(): Promise<ActionResponse<PostsResponse[]>> {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      image_url,
      author_id,
      likes_count,
      views_count,
      created_at,
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
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("내 게시글들 가져오기에 실패했습니다.");
  }
  return { success: true, data: data as unknown as PostsResponse[] };
}


// 모든 게시글 가져오기
export async function getAllPosts(): Promise<
  ActionResponse<PostsResponse[]> | never
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      content,
      image_url,
      author_id,
      likes_count,
      views_count,
      created_at,
      study:study_id (
        id,
        title,
        description,
        study_category,
        region,
        max_participants,
        current_participants,
        status
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
    throw new Error(error.message);
  }
  return { success: true, data: data as unknown as PostsResponse[] };
}

// 조회수 증가

export async function increaseViewCount(postId: number): Promise<ActionResponse> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('increment_post_views', {
    post_id: postId
  });
  
  if (error) {
    throw new Error(error.message);
  }
  return { success: true };
}

// 좋아요 토글 (RPC 사용)
export async function toggleLike(postId: number): Promise<ActionResponse<{ liked: boolean, newCount: number }>> {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);
  // RPC 함수 호출
  const { data, error } = await supabase.rpc('toggle_post_like', {
    p_post_id: postId,
    p_user_id: user.id
  });
  
  if (error) {
    throw new Error("좋아요 처리에 실패했습니다.");
  }
  
  // data[0] = { liked: true/false, new_count: 10 }

  return { 
    success: true,
    data: {
      liked: data[0]?.liked,
      newCount: data[0]?.new_count
    }
  };
}

// 좋아요 여부 확인
export async function checkIsLiked(postId: number): Promise<ActionResponse<boolean>> {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  
  if (error) {
    throw new Error("좋아요 여부 확인에 실패했습니다.");
  }

  return { success: true, data: !!data };
}

// 게시글 삭제
  export async function deletePost(postId: number): Promise<ActionResponse> {
    const supabase = await createClient();
    const { user } = await CustomUserAuth(supabase);

    const {data : selectPost, error : selectPostError} = await supabase.from("posts")
    .select("image_url")
    .eq("id", postId)
    .eq("author_id", user.id)
    .single();

    if (selectPostError) {
      throw new Error("게시글을 찾을 수 없거나 권한이 없습니다");
    }

    const { error } = await supabase.from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", user.id)
    
    if (error) {
      throw new Error("게시글을 찾을 수 없거나 권한이 없습니다");
    }
    const images = (selectPost.image_url ?? []) as FileMetadata[];
    if (images.length > 0) {
      const imageUrls = images.map(img => img.url);
      const { error: deleteError } = await supabase.storage.from("post-images").remove(imageUrls);
      if (deleteError) {
        console.error("Storage 삭제 실패:", deleteError);
      }
    }
    revalidatePath("/posts", "layout");
    redirect(`/posts`);
  }

// 게시글 수정
export async function updatePost(formData: FormData): Promise<ActionResponse<PostsResponse>> {
  const supabase = await createClient();

  const { user } = await CustomUserAuth(supabase);

  const rawData = parseFormData(formData, { arrayKeys: ["images"] });
  const parseResult = validateWithZod(updatePostSchema, rawData);
  if (!parseResult.success) {
    return parseResult;
  }
  const { id, title, content, studyId, images } = parseResult.data as UpdatePostFormValues;
  const { data: selectPost, error: postError } = await supabase
  .from("posts")
  .select("*")
  .eq("id", id)
  .eq("author_id", user.id)
  .single();
  
  if (postError) {
    throw new Error("게시글을 찾을 수 없거나 권한이 없습니다");
  }
  // 클라이언트는 기존 이미지를 0바이트 File에 url을 name으로 담아 전송
  const deletedImages = selectPost.image_url.filter(
    (savedImage: FileMetadata) => !images?.some(
      (image) => image.name === savedImage.url
    )
  );

  await deletePostImages(supabase, deletedImages);
  const addedImages = images?.filter(
    (image) => !selectPost.image_url.some(
      (savedImage: FileMetadata) => savedImage.url === image.name
    )
  );

  const addedImagesData = addedImages && addedImages.length > 0
  ? await uploadPostImages(supabase, addedImages)
  : [];


  // // selectPost.image_url에서 deletedImagesData 제거한 배열
  const existingImages = selectPost.image_url.filter(
    (savedImage: FileMetadata) => !deletedImages.some(
      (deletedImage: FileMetadata) => deletedImage.url === savedImage.url
    )
  );


  const { data, error } = await supabase.from("posts").update({
    title,
    content,
    study_id: studyId,
    image_url: [...existingImages, ...addedImagesData]
  }).eq("id", id)
  .select()
  .single();

  if (error) {
    throw new Error("게시글을 찾을 수 없거나 권한이 없습니다");  
  }
  revalidatePath("/posts", "layout");
  redirect(`/posts/${data.id}`);
}

// =================ssr ======================

export async function getMyPostsSSR(): Promise<PostsResponse> {
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
    image_url,
    author_id,
    likes_count,
    views_count,
    created_at,
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
  return data as unknown as PostsResponse;
}

export async function getPostDetailSSR(id: number): Promise<PostDetailResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:author_id (
        id,
        email,
        username,
        avatar_url
      ),
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
      )
    `
    )
    .eq("id", id)
    .single();
  if (error) {
    notFound();
  }
  return data as unknown as PostDetailResponse;
}

export async function getAllPostsSSR(): Promise<
  PostsResponse | never
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      content,
      image_url,
      author_id,
      likes_count,
      views_count,
      created_at,
      study:study_id (
        id,
        title,
        description,
        study_category,
        region,
        max_participants,
        current_participants,
        status
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
    notFound();
  }
  return data as unknown as PostsResponse;
}
