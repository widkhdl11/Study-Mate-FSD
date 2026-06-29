'use server'

import { findStudyById, updateStudy, Study, StudyError, StudyId, UpdateStudyCommand, studyUpdateSchema } from "@/entities/study";
import { UserId } from "@/entities/user";
import { parseFormData } from "@/shared/lib/parseFormData";
import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { CustomUserAuth } from "@/shared/lib/auth";
import { validateWithZod } from "@/shared/lib/validation";

export async function updateStudyAction(formData: FormData): Promise<ActionResponse> {

    // sb 생성
    // 로그인 상태 확인
    // 폼 데이터 인증
    // 폼 데이터 변환
    // 스터디 업데이트
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)

    if (!user) {
        return { success: false, error: { message: '로그인 상태가 아닙니다.' } }
    }

    const rawData = parseFormData(formData)
    const parseResult = validateWithZod(studyUpdateSchema, rawData)

    if (!parseResult.success) {
        return parseResult
    }
    const { id, title, studyCategory, region, maxParticipants, description, updatedAt } = parseResult.data as UpdateStudyCommand

    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유저 아이디가 올바르지 않습니다.' } }
    }

    const studyIdVO = StudyId.of(id)
    if (!studyIdVO.ok) {
        return { success: false, error: { message: '스터디 아이디가 올바르지 않습니다.' } }
    }

    const loadStudyVO = await findStudyById(supabase, studyIdVO.value)
    if (!loadStudyVO.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    // update용 vo 생성 (권한 체크는 createUpdate가 도메인에서 수행)
    const updateStudyVO = Study.createUpdate(loadStudyVO.value, userIdVO.value, {
        title,
        description,
        region,
        studyCategory,
        maxParticipants,
    })
    if (!updateStudyVO.ok) {
        return { success: false, error: { message: updateStudyErrorMessage(updateStudyVO.error.kind) } }
    }

    const studyResult = await updateStudy(supabase, updateStudyVO.value, updatedAt)

    if (!studyResult.ok) {
        console.error(studyResult.error)
        return { success: false, error: { message: '스터디 수정에 실패했습니다.' } }
    }

    return { success: true }
}

function updateStudyErrorMessage(kind: StudyError["kind"]): string {
    switch (kind) {
        case "NotHost": return '수정 권한이 없습니다.'
        case "EmptyTitle": return '제목을 입력해주세요.'
        case "EmptyDescription": return '설명을 입력해주세요.'
        case "EmptyRegion": return '지역을 선택해주세요.'
        case "EmptyStudyCategory": return '카테고리를 선택해주세요.'
        case "InvalidCapacity": return '참여 인원 설정이 올바르지 않습니다.'
        default: return '스터디 수정에 실패했습니다.'
    }
}