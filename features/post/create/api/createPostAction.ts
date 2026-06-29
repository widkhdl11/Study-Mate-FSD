'use server'

import { createPost, CreatePostCommand, createPostSchema, PostPolicy, PostPolicyError } from "@/entities/post";
import { findStudyById, StudyId } from "@/entities/study";
import { UserId } from "@/entities/user";
import { uploadPostImages } from "@/entities/post/lib/uploadPostImages";
import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { validate } from "@/shared/lib/validate";
import { CustomUserAuth } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function createPostAction(values: CreatePostCommand): Promise<ActionResponse> {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    // const rawData = parseFormData(formData)
    // const parseResult = validateWithZod(postSchema, values)
    const parseResult = validate(createPostSchema, values)
    if (!parseResult.ok) {
        return { success: false, error: { message: parseResult.error.message } }
    }

    const { title, content, studyId ,images} =
        parseResult.value as CreatePostCommand


    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 사용자입니다.' } }
    }

    const studyIdVO = StudyId.of(studyId)
    if (!studyIdVO.ok) {
        return { success: false, error: { message: '스터디를 선택해주세요.' } }
    }

    // 스터디 조회
    const studyVO = await findStudyById(supabase, studyIdVO.value)
    if (!studyVO.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    const uploadedImages = await uploadPostImages(supabase, images)   // File[] → ImageUrl[] (storage)


    // 게시글 생성
    const createPostParams = {
        authorId: userIdVO.value,
        studyId: studyIdVO.value,
        title: title,
        content: content,
        imageUrl: uploadedImages ?? [],   // zod로 검증된 ImageUrl[], 없으면 []
    }


    const createPostVO = PostPolicy.createPostIntent(createPostParams, studyVO.value)

    if (!createPostVO.ok) {
        return { success: false, error: { message: createPostErrorMessage(createPostVO.error) } }
    }

    const createPostResult = await createPost(supabase, createPostVO.value)
    if (!createPostResult.ok) {
        return { success: false, error: { message: '게시글 생성에 실패했습니다.' } }
    }
    revalidatePath('/posts', 'layout')
    redirect('/posts')
}

function createPostErrorMessage(error: PostPolicyError): string {
    switch (error.kind) {
        case 'NotActiveStudy': return '스터디가 활성화 되어 있지 않습니다.'
        case 'NotAuthor': return '스터디 호스트가 아닙니다.'
        default: return '게시글 생성에 실패했습니다.'
    }
}