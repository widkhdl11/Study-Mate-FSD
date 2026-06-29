'use server'
import { findPostById, PostId, PostPolicy, PostPolicyError, updatePost, UpdatePostCommand, updatePostSchema } from "@/entities/post"
import { deletePostImages } from "@/entities/post/lib/deletePostImages"
import { uploadPostImages } from "@/entities/post/lib/uploadPostImages"
import { findStudyById, StudyId } from "@/entities/study"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { ActionResponse } from "@/shared/kernel/actionType"
import { CustomUserAuth } from "@/shared/lib/auth"
import { File } from "@/shared/lib/file"
import { validate } from "@/shared/lib/validate"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updatePostAction(values: UpdatePostCommand): Promise<ActionResponse> {
    const supabase = await createClient()   
    const { user } = await CustomUserAuth(supabase)

    const parseResult = validate(updatePostSchema, values)
    if (!parseResult.ok) {
        return { success: false, error: { message: parseResult.error.message } }
    }
    const { id, title, content, studyId, images } = parseResult.value as UpdatePostCommand

    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 사용자입니다.' } }
    }

    const studyIdVO = StudyId.of(studyId)
    if (!studyIdVO.ok) {
        return { success: false, error: { message: '스터디를 선택해주세요.' } }
    }
    const studyVO = await findStudyById(supabase, studyIdVO.value)
    if (!studyVO.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    const postIdVO = PostId.of(id)
    if (!postIdVO.ok) {
        return { success: false, error: { message: '게시글을 선택해주세요.' } }
    }

    const loadPostVO = await findPostById(supabase, postIdVO.value)
    if (!loadPostVO.ok) {
        return { success: false, error: { message: '게시글을 찾을 수 없습니다.' } }
    }

    // 기존 이미지와 다른 이미지인지 같은 이미지인지 체크
    const deletedImages = loadPostVO.value.imageUrl.filter(
        (savedImage: File) => !images?.some(
        (image) => image.name === savedImage.url
        )
    );

    await deletePostImages(supabase, deletedImages);

    const addedImages = images?.filter(
        (image) => !loadPostVO.value.imageUrl.some(
        (savedImage: File) => savedImage.url === image.name
        )
    );

    const addedImagesData = addedImages && addedImages.length > 0
    ? await uploadPostImages(supabase, addedImages)
    : [];


    // // selectPost.image_url에서 deletedImagesData 제거한 배열
    const existingImages = loadPostVO.value.imageUrl.filter(
        (savedImage: File) => !deletedImages.some(
        (deletedImage: File) => deletedImage.url === savedImage.url
        )
    );
    const newImages = [...existingImages, ...addedImagesData]

    const updatePostVO = PostPolicy.updatePostIntent(loadPostVO.value, studyVO.value, userIdVO.value, {
        id: postIdVO.value,
        authorId: userIdVO.value,
        studyId: studyIdVO.value,
        title,
        content,
        likesCount: loadPostVO.value.likesCount,
        commentsCount: loadPostVO.value.commentsCount,
        viewsCount: loadPostVO.value.viewsCount,
        createdAt: loadPostVO.value.createdAt,
        updatedAt: loadPostVO.value.updatedAt,
        imageUrl: newImages
    })

    if (!updatePostVO.ok) {
        return { success: false, error: { message: updatePostErrorMessage(updatePostVO.error) } }
    }

    const updatePostResult = await updatePost(supabase, updatePostVO.value)
    if (!updatePostResult.ok) {
        return { success: false, error: { message: updatePostResult.error.kind } }
    }
    revalidatePath("/posts", "layout");
    redirect(`/posts/${updatePostResult.value.id}`);
}

function updatePostErrorMessage(error: PostPolicyError): string {
    switch (error.kind) {
        case 'NotActiveStudy': return '스터디가 활성화 되어 있지 않습니다.'
        case 'NotAuthor': return '스터디 호스트가 아닙니다.'
        default: return '게시글 수정에 실패했습니다.'
    }
}