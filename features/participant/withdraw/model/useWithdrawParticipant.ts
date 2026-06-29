'use client'

import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { withdrawParticipantAction } from "../api/withdrawParticipantAction"


export function useWithdrawParticipant(studyId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId: number) => {
            return await withdrawParticipantAction(participantId)
        },
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error?.message || '신청 취소에 실패했습니다')
                return
            }
            queryClient.invalidateQueries({
                queryKey: queryKeys.studyDetail(studyId)
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.participantByStudy(studyId),
            })
            toast.success('신청 취소가 완료되었습니다')
        },
        onError: (error: Error) => {
            toast.error(error.message || '신청 취소 중 오류가 발생했습니다')
        },
    })
}