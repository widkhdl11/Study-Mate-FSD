'use client'

import {
    acceptParticipant,
    applyParticipant,
    checkParticipantStatus,
    rejectParticipant,
    removeParticipant,
} from '@/actions/participantAction'
import { queryKeys } from '@/lib/reactQuery/queryKeys'
import { ParticipantResponse } from '@/types/participantType'
import { isRedirect } from '@/utils/format'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from './useUser'

export function useParticipant(
    initialParticipant: ParticipantResponse | null,
    studyId: number
) {
    const { data: user } = useUser()
    return useQuery({
        queryKey: queryKeys.participant(studyId, user?.id),
        queryFn: async () => {
            const result = await checkParticipantStatus(studyId)
            if (result.success) {
                return result.data as unknown as ParticipantResponse
            } else {
                throw new Error(
                    result.error?.message ||
                        '참여 상태를 조회하는데 실패했습니다'
                )
            }
        },
        enabled: studyId > 0 && !!user?.id,
        throwOnError: true,
        initialData: initialParticipant,
        staleTime: 1000 * 30, // 30초
        refetchInterval: 1000 * 10, // 10초마다 폴링 (다른 사람이 수락할 수 있으므로)
    })
}

// 참가 신청
export function useApplyParticipant(studyId: number) {
    const queryClient = useQueryClient()
    const { data: user } = useUser()

    return useMutation({
        mutationFn: async () => {
            const cachedUser = queryClient.getQueryData(queryKeys.user)
            if (cachedUser === null) {
                throw new Error('로그인 후 참여 신청이 가능합니다')
            }
            return await applyParticipant(studyId)
        },
        onMutate: () => {
            if (!user?.id) {
                return { previousData: null }
            }
            const key = queryKeys.participant(studyId, user?.id)
            queryClient.cancelQueries({ queryKey: key })
            const previousData = queryClient.getQueryData(key)
            queryClient.setQueryData(key, (old: ParticipantResponse) => {
                return {
                    ...old,
                    status: 'pending',
                }
            })
            return { previousData }
        },
        onError: (error: any, variables, context) => {
            queryClient.setQueryData(
                queryKeys.participant(studyId, user?.id),
                context?.previousData
            )
            toast.error(error.message || '참여 신청 중 오류가 발생했습니다')
        },
        onSuccess: (response) => {
            if (response?.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.participant(studyId, user?.id),
                })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.studyDetail(studyId),
                })
                toast.success('참여 신청이 완료되었습니다!')
            } else {
                toast.error(response?.error?.message || '신청에 실패했습니다')
            }
        },
    })
}

// 참여자 수락
export function useAcceptParticipant(studyId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId: number) => {
            return await acceptParticipant(participantId)
        },

        onSuccess: (response) => {
            if (response?.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.studyDetail(studyId),
                })
                // 수락된 사람을 포함해 해당 스터디의 모든 participant 캐시 무효화
                queryClient.invalidateQueries({
                    queryKey: queryKeys.participantByStudy(studyId),
                })
                toast.success('참여자를 수락했습니다')
            }
            if (!response?.success) {
                toast.error(response?.error?.message || '수락에 실패했습니다')
            }
        },
        onError: (error: any) => {
            toast.error(error.message || '수락 중 오류가 발생했습니다')
        },
    })
}

// 참여자 거절
export function useRejectParticipant(studyId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId: number) => {
            return await rejectParticipant(participantId)
        },
        onSuccess: (response) => {
            if (response?.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.studyDetail(studyId),
                })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.participantByStudy(studyId),
                })
                toast.success('참여 신청을 거절했습니다')
            } else {
                toast.error(response?.error?.message || '거절에 실패했습니다')
            }
        },
        onError: (error: any) => {
            toast.error(error.message || '거절 중 오류가 발생했습니다')
        },
    })
}

// 참여자 강퇴 or 탈퇴
export function useRemoveParticipant(studyId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId: number) => {
            return await removeParticipant(participantId)
        },
        onSuccess: (response) => {
            if (response?.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.studyDetail(studyId),
                })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.participantByStudy(studyId),
                })
                toast.success('멤버를 강퇴했습니다')
            } else {
                toast.error(response?.error?.message || '강퇴에 실패했습니다')
            }
        },
        onError: (error: any) => {
            if (isRedirect(error)) {
                toast.success('멤버가 스터디에서 나갔습니다.')
                queryClient.invalidateQueries({
                    queryKey: queryKeys.studyDetail(studyId),
                })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.participantByStudy(studyId),
                })
                return
            }
            toast.error(error.message || '강퇴 중 오류가 발생했습니다')
        },
    })
}
