'use client'

import { useUser } from "@/hooks/useUser"
import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { ParticipantResponse } from "@/entities/participant"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { applyParticipantAction } from "../api/applyParticipantAction"


export function useApplyParticipant(studyId: number) {
    const queryClient = useQueryClient()
    const { data: user } = useUser()

    return useMutation({
        mutationFn: async () => {
            return await applyParticipantAction(studyId)
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
            // 실패시 reactQuery에 모집중으로 표시되던 캐시 복구
      
            toast.error(error.message || '참여 신청 중 오류가 발생했습니다')
        },
        onSuccess: (response, variables, context) => {
            if (response?.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.participant(studyId, user?.id),
                })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.studyDetail(studyId),
                })
                toast.success('참여 신청이 완료되었습니다!')
            } else {
                queryClient.setQueryData(
                    queryKeys.participant(studyId, user?.id),
                    context?.previousData
                )
                toast.error(response?.error?.message || '신청에 실패했습니다')
            }
        },
    })
}