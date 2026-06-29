'use server'

// import { createClient } from "@/shared/api/supabase/server"
// import { CustomUserAuth } from "@/shared/lib/auth"

// export async function applyParticipantAction(studyId: number) {
//     const supabase = await createClient()
//     const { user } = await CustomUserAuth(supabase)

//     const userIdVO = UserId.of(user.id)
//     if (!userIdVO.ok) {
//         return { success: false, error: { message: '유효하지 않은 사용자입니다.' } }
//     }

//     const studyIdVO = StudyId.of(studyId)
//     if (!studyIdVO.ok) {
//         return { success: false, error: { message: '유효하지 않은 스터디입니다.' } }
//     }

//     const loadStudyVO = await findStudyById(studyIdVO.value)
//     if (!loadStudyVO.ok) {
//         return { success: false, error: { message: '스터디를 찾을 수 없습니다.' } }
//     }

//     if (!Study.isAcceptable(loadStudyVO.value)) {
//         return { success: false, error: { message: '스터디는 모집중이 아니거나 정원이 가득 찼습니다.' } }
//     }

//     if (loadStudyVO.value.creatorId === userIdVO.value) {
//         return { success: false, error: { message: '본인의 스터디에는 신청할 수 없습니다' } }
//     }

//     const existingResult = await findParticipantByStudyAndUser(
//         supabase,
//         studyIdVO.value,
//         userIdVO.value
//     )
//     if (!existingResult.ok) {
//         return { success: false, error: { message: '참여 상태를 확인할 수 없습니다.' } }
//     }

//     const existing = existingResult.value
//     if (existing) {
//         if (ParticipantStatus.isPending(existing.status)) {
//             return { success: false, error: { message: '이미 신청했습니다' } }
//         }
//         if (ParticipantStatus.isAccepted(existing.status)) {
//             return { success: false, error: { message: '이미 참여중입니다' } }
//         }

//         const applyVO = Participant.apply(existing)
//         if (!applyVO.ok) {
//             return { success: false, error: { message: '재신청할 수 없습니다.' } }
//         }

//         const updateResult = await updateParticipant(
//             supabase,
//             applyVO.value,
//         )
//         if (!updateResult.ok) {
//             return { success: false, error: { message: '재신청에 실패했습니다.' } }
//         }

//         return { success: true }
//     }

//     const createParticipantVO = Participant.createNew({
//         studyId: studyIdVO.value,
//         userId: userIdVO.value,
//         role: ParticipantRole.common(),
//     })

//     const insertResult = await insertParticipant(supabase, createParticipantVO)
//     if (!insertResult.ok) {
//         return { success: false, error: { message: '참가자를 생성할 수 없습니다.' } }
//     }

    

//     return { success: true }
// }

import { findParticipantByStudyAndUser, upsertParticipant, ApplyError, ParticipantPolicy } from "@/entities/participant"
import { findStudyById, StudyId } from "@/entities/study"
import { UserId } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { CustomUserAuth } from "@/shared/lib/auth"

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
