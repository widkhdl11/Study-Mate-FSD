'use server'

import { createStudyWithHost, Study, CreateStudyCommand, studyCreateSchema, StudyError } from "@/entities/study";
import { UserId } from "@/entities/user";
import { parseFormData } from "@/shared/lib/parseFormData";
import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { CustomUserAuth } from "@/shared/lib/auth";
import { validateWithZod } from "@/shared/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function createStudyAction(formData: FormData): Promise<ActionResponse> {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    const rawData = parseFormData(formData)
    const parseResult = validateWithZod(studyCreateSchema, rawData)
    if (!parseResult.success) {
        return parseResult
    }


    const { title, description, region, studyCategory, maxParticipants } =
        parseResult.data as CreateStudyCommand


    const userResult = UserId.of(user.id)

    if (!userResult.ok) {
        return { success: false, error: { message: '유효하지 않은 사용자입니다.' } }
    }

    // 생성용 study vo 생성
    const createStudyVO = Study.createNew({
        creatorId: userResult.value,
        title,
        description,
        region,
        studyCategory,
        maxParticipants,
    })

    
    if (!createStudyVO.ok) {
        return { success: false, error: { message: createStudyErrorMessage(createStudyVO.error.kind) } }
    }

    const repoResult = await createStudyWithHost(supabase, createStudyVO.value)
    if (!repoResult.ok) {
        return { success: false, error: { message: '스터디 생성에 실패했습니다.' } }
    }
    revalidatePath('/posts', 'layout')
    redirect('/posts')
}

function createStudyErrorMessage(kind: StudyError["kind"]): string {
    switch (kind) {
        case 'EmptyTitle': return '제목을 입력해주세요.'
        case 'EmptyDescription': return '설명을 입력해주세요.'
        case 'EmptyRegion': return '지역을 선택해주세요.'
        case 'EmptyStudyCategory': return '카테고리를 선택해주세요.'
        default: return '참여 인원 설정이 올바르지 않습니다.'
    }
}