'use server'

import { findParticipantById, updateParticipant, ParticipantId, AcceptError, ParticipantPolicy } from "@/entities/participant"
import { findStudyById } from "@/entities/study"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { CustomUserAuth } from "@/shared/lib/auth"


// 신청자가 pending 상태여야 함
// 신청자가 존재하는지 체크
// 승낙은 해당 스터디의 호스트만 가능
// 스터디가 recruiting 상태여야 함
// 스터디 정원이 가득 찼는지 체크

/**
 * 
 * @param participantId number
 * 1. 로그인 유효 체크
 * 2. UserId VO 생성
 * 3. 
 */

export async function acceptParticipantAction(participantId: number) {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    if (!user) {
        return { success: false, error: { message: '로그인이 필요합니다.' } }
    }

    // 유저 ID VO 생성
    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 사용자입니다.' } }
    }

    // 참여자 ID VO 생성
    const participantIdVO = ParticipantId.of(participantId)
    if (!participantIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 참여자입니다.' } }
    }

    // 참여자 조회
    const loadParticipantVO = await findParticipantById(supabase, participantIdVO.value)
    if (!loadParticipantVO.ok) {
        return { success: false, error: { message: '참여자를 찾을 수 없습니다.' } }
    }

    // 참여자가 신청한 스터디 조회
    const loadStudyVO = await findStudyById(supabase, loadParticipantVO.value.studyId)
    if (!loadStudyVO.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    const acceptParticipantVO = ParticipantPolicy.hostAccept(loadStudyVO.value, loadParticipantVO.value, userIdVO.value)
    if (!acceptParticipantVO.ok) {
        return { success: false, error: { message : acceptErrorMessage(acceptParticipantVO.error.kind) } }
    }

    const updateParticipantVO = await updateParticipant(supabase, acceptParticipantVO.value)
    if (!updateParticipantVO.ok) {
        return { success: false, error: { message: '참여자를 수락할 수 없습니다.' } }
    }   


    return { success: true }
}

function acceptErrorMessage(kind: AcceptError["kind"]): string {
    switch (kind) {
        case "NotHost": return '스터디 호스트만 수락할 수 있습니다.'
        case "StudyNotActive": return '스터디가 활성화되어 있지 않습니다.'
        case "StudyNotAcceptable": return '스터디가 모집중이 아니거나 정원이 가득 찼습니다.'
        case "NotInStudy": return '참여자가 스터디에 속하지 않습니다.'
        case "NotCommonRole": return '일반 참여자만 수락 대상입니다.'
        case "HostMustBeAccepted": return '호스트는 수락 대상이 아닙니다.'
        case "InvalidTransition": return '대기 중인 신청만 수락할 수 있습니다.'
        default: return '참여자를 수락할 수 없습니다.'
    }
}
