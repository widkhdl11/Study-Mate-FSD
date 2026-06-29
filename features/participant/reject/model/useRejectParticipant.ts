'use client'

import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { rejectParticipantAction } from "../api/rejectParticipantAction"

export function useRejectParticipant(studyId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId: number) => {
            return await rejectParticipantAction(participantId)
        },
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error?.message || '거절에 실패했습니다')
                return
            }

            queryClient.invalidateQueries({
                queryKey: queryKeys.studyDetail(studyId),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.participantByStudy(studyId),
            })
            toast.success('참여 신청을 거절했습니다')
        },
        onError: (error: Error) => {
            toast.error(error.message || '거절 중 오류가 발생했습니다')
        },
    })
}
