'use client'

import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { acceptParticipantAction } from "../api/acceptParticipantAction"

export function useAcceptParticipant(studyId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId: number) => {
            return await acceptParticipantAction(participantId)
        },
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error?.message || '참여자 수락에 실패했습니다.')
                return
            }

            queryClient.invalidateQueries({
                queryKey: queryKeys.studyDetail(studyId),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.participantByStudy(studyId),
            })
            toast.success('참여자를 수락했습니다')
        },
        onError: (error: Error) => {
            toast.error(error.message || '참여자 수락 중 오류가 발생했습니다')
        },
    })
}
