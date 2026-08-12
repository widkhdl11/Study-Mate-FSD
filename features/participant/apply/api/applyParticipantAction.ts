'use server'

import { createNotification, Notification } from "@/entities/notification"
import { ApplyError, findParticipantByStudyAndUser, ParticipantPolicy, upsertParticipant } from "@/entities/participant"
import { findStudyById, StudyId } from "@/entities/study"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { CustomUserAuth, getUserProfile } from "@/shared/lib/auth"
import { logError } from "@/shared/lib/logError"

// 신청 규칙(모집 가능 여부 / 본인 스터디 / 중복 신청 / 재신청 가능)은
// ParticipantPolicy.decideApply 에 모여 있다.
// 액션은 auth → load → policy → save 조립만 담당한다.

export async function applyParticipantAction(studyId: number) {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    if (!user) {
        return { success: false, error: { message: '로그인이 필요합니다.' } }
    }

    // 1. 입력 → 도메인 VO
    const userIdVO = UserId.of(user.id)
    if (!userIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 사용자입니다.' } }
    }

    const hostProfile = await getUserProfile(supabase, user.id)
    if (!hostProfile) {
        return { success: false, error: { message: '호스트 정보를 찾을 수 없습니다.' } }
    }
    const hostName = hostProfile.username ?? ''

    const studyIdVO = StudyId.of(studyId)
    if (!studyIdVO.ok) {
        return { success: false, error: { message: '유효하지 않은 스터디입니다.' } }
    }

    // 2. Load — 정책 판단에 필요한 Aggregate 적재
    const loadStudy = await findStudyById(supabase, studyIdVO.value)
    if (!loadStudy.ok) {
        return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
    }

    const loadExisting = await findParticipantByStudyAndUser(
        supabase,
        studyIdVO.value,
        userIdVO.value
    )
    if (!loadExisting.ok) {
        return { success: false, error: { message: '참여 상태를 확인할 수 없습니다.' } }
    }

    // 3. Policy — 신규 신청 / 재신청 분기 + 모든 비즈니스 규칙
    const decision = ParticipantPolicy.decideApply(
        loadStudy.value,
        userIdVO.value,
        loadExisting.value
    )
    if (!decision.ok) {
        return { success: false, error: { message: applyErrorMessage(decision.error.kind) } }
    }

    const upsertParticipantVO = await upsertParticipant(supabase, decision.value)
    if (!upsertParticipantVO.ok) {
        return { success: false, error: { message: '재신청에 실패했습니다.' } }
    }

    const createNotificationVO = Notification.createNew({
        userId: loadStudy.value.creatorId,        // 수신자: 스터디장
        type: "participant_request",              // 참가 "요청" 알림 (승인 아님)
        senderId: userIdVO.value,                 // 발신자: 신청자
        reference: { kind: "study", id: studyId },
        // senderName(hostName)은 실제로는 신청자 이름 — "○○님이 참가 요청을 보내셨습니다"에 쓰인다.
        ctx: { senderName: hostName, targetTitle: loadStudy.value.title },
    })

    
    if (!createNotificationVO.ok) {
        logError('applyParticipantAction', createNotificationVO.error)
        return { success: false, error: { message: '알람을 생성할 수 없습니다.' } }
    }

    await createNotification(supabase, createNotificationVO.value)


    return { success: true }
}

// ApplyError.kind → 사용자 메시지 (boundary 변환)
function applyErrorMessage(kind: ApplyError["kind"]): string {
    switch (kind) {
        case "StudyNotAcceptable": return '모집중이 아니거나 정원이 가득 찼습니다.'
        case "SelfApply":          return '본인의 스터디에는 신청할 수 없습니다.'
        case "AlreadyPending":     return '이미 신청했습니다.'
        case "AlreadyAccepted":    return '이미 참여중입니다.'
        case "CannotReapply":      return '재신청할 수 없습니다.'
        default:                   return '참여 신청을 처리할 수 없습니다.'
    }
}
