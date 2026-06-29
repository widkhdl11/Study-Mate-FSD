'use server'

import { findParticipantById, updateParticipant, ParticipantId, ParticipantPolicy, RejectError } from "@/entities/participant"
import { findStudyById } from "@/entities/study"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { CustomUserAuth } from "@/shared/lib/auth"


// 참여 신청 거절
export async function rejectParticipantAction(participantId: number) {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)

    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 사용자입니다.' } }
    }

    const participantIdVO = ParticipantId.of(participantId)
    if (!participantIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 참여자입니다.' } }
    }

    const loadParticipantVO = await findParticipantById(supabase, participantIdVO.value)
    if (!loadParticipantVO.ok) {
        return { success: false, error: { message: '참여자를 찾을 수 없습니다.' } }
    }

    const loadStudyVO = await findStudyById(supabase, loadParticipantVO.value.studyId)
    if (!loadStudyVO.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    const rejectedParticipantVO = ParticipantPolicy.hostReject(loadStudyVO.value, loadParticipantVO.value, userIdVO.value)
    if (!rejectedParticipantVO.ok) {
        return { success: false, error: { message: rejectErrorMessage(rejectedParticipantVO.error.kind) } }
    }

    const updateParticipantVO = await updateParticipant(supabase, rejectedParticipantVO.value)
    if (!updateParticipantVO.ok) {
        return { success: false, error: { message: '참여자를 거절할 수 없습니다.' } }
    }

    return { success: true }
}

function rejectErrorMessage(kind: RejectError["kind"]): string {
    switch (kind) {
        case "NotHost": return '스터디 호스트만 거절할 수 있습니다.'
        case "StudyNotActive": return '스터디가 활성화되어 있지 않습니다.'
        case "NotInStudy": return '참여자가 스터디에 속하지 않습니다.'
        case "InvalidTransition": return '참여자 상태를 거절할 수 없습니다.'
        default:                   return '참여자를 거절할 수 없습니다.'
    }
}