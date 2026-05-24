'use server'

import { verifyHostAndGetStudy } from '@/lib/participants/verifyHostAndGetStudy'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types/actionType'
import {
    ParticipantResponse,
    ParticipantWithStudyResponse,
} from '@/types/participantType'
import { CustomUserAuth, getUserProfile, tryAuth } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { addNotification } from './notificationAction'

// export async function getParticipant(studyId: number) {
//   const supabase = await createClient();

//   const {user} = await CustomUserAuth(supabase);
//   const { data, error } = await supabase
//     .from("participants")
//     .select("*")
//     .eq("study_id", studyId)
//     .single();

//   if (error) {
//     return { success: false, error: { message: error.message } };
//   }

//   return { success: true, data };
// }

// 참가 신청
export async function applyParticipant(
    studyId: number
): Promise<ActionResponse> {
    const supabase = await createClient()
    
    const result = await tryAuth(supabase);
        if (!result.success) return result;
    const { user } = result;

    // 신청자 정보 조회
    const userProfile = await getUserProfile(supabase, user.id)

    // 신청자 정보 조회
    // 중복 신청 체크
    // 참여 상태 확인
    // 스터디 상태와 정원 체크
    // 본인 스터디에 신청 방지
    // 신청

    // 스터디 정보 조회 (생성자 ID, 제목)
    const { data: study, error: studyError } = await supabase
        .from('studies')
        .select('creator_id, title, current_participants, max_participants, status')
        .eq('id', studyId)
        .single()

    
    if (studyError || !study) {
        throw new Error('스터디를 찾을 수 없습니다')
    }

    // 정원 체크 추가
    if (study.status === 'completed' || study.current_participants >= study.max_participants) {
        return { success: false, error: { message: '정원이 마감되었습니다' } };
    }

    // 본인 스터디에 신청 방지
    if (study.creator_id === user.id) {
        return {
            success: false,
            error: { message: '본인의 스터디에는 신청할 수 없습니다' },
        }
    }

    // 중복 신청 체크
    const { data: existing } = await supabase
        .from('participants')
        .select('status')
        .eq('study_id', studyId)
        .eq('user_id', user.id)
        .single()

    if (existing) {
        if (existing.status === 'pending') {
            return { success: false, error: { message: '이미 신청했습니다' } }
        }
        if (existing.status === 'accepted') {
            return { success: false, error: { message: '이미 참여중입니다' } }
        }
        // rejected는 통과 → 아래 upsert가 status를 'pending'으로 갱신 (재신청 허용
    }

    // 신청
    const { data, error } = await supabase
        .from('participants')
        .upsert(
            {
                study_id: studyId,
                user_id: user.id,
                status: 'pending',
                username: userProfile?.username,
                user_email: userProfile?.email,
            },
            {
                onConflict: 'study_id,user_id',
                ignoreDuplicates: false,
            }
        )
        .select()
        .single()

    if (error) {
        throw new Error('참가 신청에 실패했습니다')
    }

    // 스터디장에게 알림 생성
    await addNotification({
        user_id: study.creator_id,
        type: 'participant_request',
        title: '새로운 참가 요청',
        content: `${userProfile.username}님이 "${study.title}" 스터디에 참가 요청했습니다`,
        reference_type: 'study',
        reference_id: studyId,
        sender_id: user.id,
        is_read: false,
        is_deleted: false,
    })
    return { success: true, data }
}

// 참여 상태 확인
export async function checkParticipantStatus(
    studyId: number
): Promise<ActionResponse> {
    const supabase = await createClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
        throw new Error('인증 확인에 실패했습니다')
    }
    if (!user) {
        return { success: true }
    }

    // 참여 상태 확인
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('study_id', studyId)
        .eq('user_id', user.id)
        .in('status', ['accepted', 'pending'])
        .maybeSingle()

    if (error) {
        throw new Error('참여 상태를 찾을 수 없습니다')
    }
    return { success: true, data }
}

// 참여자 수락

// 1.참여 수락 -> 스터디와 참여자
// 2. 참여자 신청 상태 확인, 참여자 신청 여부 확인
// 3. 스터디 현재인원과 정원 체크
// 4. 스터디 상태 체크
// 6. 참여자 수락
// 7. 스터디 현재인원 증가
export async function acceptParticipant(
    participantId: number
): Promise<ActionResponse<ParticipantWithStudyResponse>> {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    const userProfile = await getUserProfile(supabase, user.id)

    const { studyId, study: studyCapacity } = await verifyHostAndGetStudy(supabase, participantId, user.id)

    // 정원 체크
    if (studyCapacity.current_participants >= studyCapacity.max_participants) {
        return { success: false, error: { message: '정원이 마감되었습니다' } }
    }

    const { data, error } = await supabase
        .from('participants')
        .update({ status: 'accepted' })
        .eq('id', participantId)
        .select(
            `
            user_id,
            study:studies!participants_study_id_fkey (
                id,
                title
                )
            `
        )
        .single()

    if (error || !data) {
        throw new Error('참가 요청 승인에 실패했습니다')
    }
    const study = data.study as unknown as { id: number; title: string }

    await addNotification({
        user_id: data?.user_id,
        type: 'request_accepted',
        title: '참가 요청 승인',
        content: `${userProfile.username}님이 "${study.title}" 스터디에 참가 요청을 승인했습니다`,
        reference_type: 'study',
        reference_id: study.id,
        sender_id: user.id,
        is_read: false,
        is_deleted: false,
    })
    revalidatePath('/studies', 'layout')
    return {
        success: true,
        data: data as unknown as ParticipantWithStudyResponse,
    }
}

// 참여자 거절
export async function rejectParticipant(
    participantId: number
): Promise<ActionResponse<ParticipantWithStudyResponse>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const userProfile = await getUserProfile(supabase, user.id)

    // 로그인 유저의 권한 체크
    const { studyId, study: studyCapacity } = await verifyHostAndGetStudy(supabase, participantId, user.id)
    
    // 참가 신청 거절
    const { data, error } = await supabase
        .from('participants')
        .update({ status: 'rejected' })
        .eq('id', participantId)
        .eq('status', 'pending')
        .select(
            `
            user_id,
            study:studies!participants_study_id_fkey (
                id,
                title
                )
            `
        )
        .single()

    if (error) {
        throw new Error('참가 요청 거절에 실패했습니다')
    }

    if (!data) {
        throw new Error('참가 신청을 찾을 수 없습니다')
    }
    const study = data.study as unknown as { id: number; title: string }

    await addNotification({
        user_id: data.user_id,
        type: 'request_rejected',
        title: '참가 요청 거절',
        content: `${userProfile.username}님이 "${study.title}" 스터디에 참가 요청을 거절했습니다`,
        reference_type: 'study',
        reference_id: study.id,
        sender_id: user.id,
        is_read: false,
        is_deleted: false,
    })

    revalidatePath('/studies', 'layout')
    return {
        success: true,
        data: data as unknown as ParticipantWithStudyResponse,
    }
}

// 사용되는 테이블 : participants, studies, users
// 사용되는 컬럼 : 
// - participants(id, study_id, status, role )
// - studies(id, status, current_participants, max_participants)
// - users(id)



// 참여자 탈퇴 or 강퇴
export async function removeParticipant(
    participantId: number
): Promise<ActionResponse> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)

    // 1. 참여자 정보 조회 (스터디 정보 포함)
    const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select(
            `
            *,
            study:study_id (
                id,
                title,
                creator_id
            )
            `
        )
        .eq('id', participantId)
        .single()

    if (participantError || !participant) {
        throw new Error('참여자를 찾을 수 없습니다')
    }

    const isOwner = participant.study.creator_id === user.id // 호스트 여부
    const isSelf = participant.user_id === user.id // 본인 여부

    // 2. 권한 체크
    if (!isOwner && !isSelf) {
        throw new Error('권한이 없습니다')
    }

    // 3. 호스트는 본인 탈퇴 불가 (스터디 삭제로 처리해야 함)
    if (isOwner && isSelf) {
        return {
            success: false,
            error: {
                message: '호스트는 탈퇴할 수 없습니다. 스터디를 삭제해주세요.',
            },
        }
    }

    // 4. 삭제 실행
    const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId)

    if (error) {
        throw new Error('참여자 탈퇴에 실패했습니다')
    }

    // 5. 알림 생성
    if (isSelf) {
        // 본인 탈퇴 → 호스트에게 알림
        await addNotification({
            user_id: participant.study.creator_id,
            type: 'participant_left',
            title: '참여자 탈퇴',
            content: `${participant.username}님이 "${participant.study.title}" 스터디에서 탈퇴했습니다`,
            reference_type: 'study',
            reference_id: participant.study.id,
            sender_id: user.id,
            is_read: false,
            is_deleted: false,
        })
    } else {
        // 강퇴 → 강퇴당한 사람에게 알림
        await addNotification({
            user_id: participant.user_id,
            type: 'participant_kicked',
            title: '스터디 강퇴',
            content: `"${participant.study.title}" 스터디에서 강퇴되었습니다`,
            reference_type: 'study',
            reference_id: participant.study.id,
            sender_id: user.id,
            is_read: false,
            is_deleted: false,
        })
    }
    revalidatePath('/profile', 'layout')
    redirect(`/profile?tab=studies`)
}

// 참여 상태 확인
export async function checkParticipantStatusSSR(
    studyId: number
): Promise<ParticipantResponse | null> {
    const supabase = await createClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError) {
        return null
    }
    if (!user) {
        return null
    }

    // 참여 상태 확인
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('study_id', studyId)
        .eq('user_id', user.id)
        .in('status', ['accepted', 'pending'])
        .maybeSingle()

    if (error) {
        notFound()
    }
    return data as unknown as ParticipantResponse
}
