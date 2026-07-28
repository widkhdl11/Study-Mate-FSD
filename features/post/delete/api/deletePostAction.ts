'use server'

import { deletePost, findPostById, PostId, PostPolicy, PostPolicyError, deletePostImages } from "@/entities/post"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { ActionResponse } from "@/shared/kernel/actionType"
import { CustomUserAuth } from "@/shared/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function deletePostAction(postId: number): Promise<ActionResponse> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    if (!user) {
        return { success: false, error: { message: '유저 정보를 찾을 수 없습니다.' } }
    }
    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유저 아이디가 올바르지 않습니다.' } }
    }
    const postIdVO = PostId.of(postId)
    if (!postIdVO.ok) {
        return { success: false, error: { message: '게시글 아이디가 올바르지 않습니다.' } }
    }
    const postVO = await findPostById(supabase, postIdVO.value)
    if (!postVO.ok) {
        return { success: false, error: { message: '게시글을 찾을 수 없습니다.' } }
    }
    
    await deletePostImages(supabase, postVO.value.imageUrl)

    const deletePostIntent = PostPolicy.deletePostIntent(postVO.value, userIdVO.value)
    if (!deletePostIntent.ok) {
        return { success: false, error: { message: deletePostErrorMessage(deletePostIntent.error.kind) } }
    }
    const deletePostResult = await deletePost(supabase, deletePostIntent.value)
    if (!deletePostResult.ok) {
        return { success: false, error: { message: '게시글 삭제 중 오류가 발생했습니다.' } }
    }
    revalidatePath("/posts", "layout");
    redirect("/profile?tab=posts");
}


function deletePostErrorMessage(kind: PostPolicyError["kind"]): string {
    switch (kind) {
        case "EmptyValue":
            return "게시글 제목이나 내용이 비어있습니다."
        case "InvalidValue":
            return "게시글 제목이나 내용이 올바르지 않습니다."
        default:
            return "게시글 삭제 중 오류가 발생했습니다."
    }
}