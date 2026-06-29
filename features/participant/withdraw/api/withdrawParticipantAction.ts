'use server'

import { deleteParticipant, findParticipantById, ParticipantId, ParticipantPolicy, WithdrawError } from "@/entities/participant"
import { findStudyById } from "@/entities/study"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { CustomUserAuth } from "@/shared/lib/auth"



/**
 * 
 * @param participantId 
 * @returns 
 * 신청 취소
 * 1. 신청 취소는 해당 스터디에 신청을 한 사용자만 취소할 수 있다.
 * 2. 참가자가 존재해야한다.
 * 3. 참가자의 상태가 대기 중이거나 참여중이어야 한다.
 * 4. 스터디가 존재해야한다.
 * 5. 스터디의 상태가 recruiting 또는 completed 상태여야 한다.
 * // status : pending(신청중), removed(강퇴), rejected(거절), accepted(참여중) 자진 취소나 탈퇴는 삭제되어야한다.
 */
export async function withdrawParticipantAction(participantId: number) {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)


    // UserId VO 생성
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

    // 스터디 조회
    const loadStudyVO = await findStudyById(supabase, loadParticipantVO.value.studyId)
    if (!loadStudyVO.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    // 참여자 자진 취소 VO생성(취소 가능한지 같이 체크)
    const selfWithdrawResult = ParticipantPolicy.selfWithdraw(loadStudyVO.value, loadParticipantVO.value, userIdVO.value)
    if (!selfWithdrawResult.ok) {
        return { success: false, error: { message: withdrawErrorMessage(selfWithdrawResult.error.kind) } }
    }

    const deleteParticipantVO = await deleteParticipant(supabase, selfWithdrawResult.value)
    if (!deleteParticipantVO.ok) {
        return { success: false, error: { message: '참여자를 탈퇴할 수 없습니다.' } }
    }

    return { success: true }
}

function withdrawErrorMessage(kind: WithdrawError["kind"]): string {
    switch (kind) {
        case "NotOwner": return '본인만 신청을 취소하거나 탈퇴할 수 있습니다.'
        case "StudyNotActive": return '스터디가 활성화되어 있지 않습니다.'
        case "NotWithdrawable": return '참여자가 탈퇴할 수 없는 상태입니다.'
        default:                   return '참여자를 탈퇴할 수 없습니다.'
    }
}