'use server'

import { deleteStudy, findStudyById, Study, StudyError, StudyId } from "@/entities/study"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { ActionResponse } from "@/shared/kernel/actionType"
import { CustomUserAuth } from "@/shared/lib/auth"


// 스터디 삭제
// 호스트만 삭제 가능

export async function deleteStudyAction(studyId: number): Promise<ActionResponse> {

    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    
    if (!user) {
        return { success: false, error: { message: '유저 정보를 찾을 수 없습니다.' } }
    }

    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유저 아이디가 올바르지 않습니다.' } }
    }

    const studyIdVO = StudyId.of(studyId)
    if (!studyIdVO.ok) {
        return { success: false, error: { message: '스터디 아이디가 올바르지 않습니다.' } }
    }
    const studyVO = await findStudyById(supabase, studyIdVO.value)
    if (!studyVO.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    const deleteStudyVO = Study.deleteStudy(studyVO.value , userIdVO.value)
    if (!deleteStudyVO.ok) {
        return { success: false, error: { message: deleteStudyErrorMessage(deleteStudyVO.error.kind) } }
    }

    const result = await deleteStudy(supabase, deleteStudyVO.value)
    if (!result.ok) {
        return { success: false, error: { message: '스터디 삭제에 실패했습니다.' } }
    }

    return { success: true }
}

function deleteStudyErrorMessage(kind: StudyError["kind"]): string {  
    switch (kind) {
        case "NotHost": return '스터디 호스트만 삭제할 수 있습니다.'
        default: return '스터디 삭제에 실패했습니다.'
    }
}