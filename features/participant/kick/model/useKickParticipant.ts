'use client'

import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { isRedirect } from "@/shared/lib/format"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { kickParticipantAction } from "../api/kickParticipantAction"

export function useKickParticipant(studyId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId: number) => {
            return await kickParticipantAction(participantId)
        },
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error?.message || '강퇴에 실패했습니다')
                return
            }

            queryClient.invalidateQueries({
                queryKey: queryKeys.studyDetail(studyId),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.participantByStudy(studyId),
            })
            toast.success('멤버를 강퇴했습니다')
        },
        onError: (error: unknown) => {
            if (isRedirect(error as Error)) {
                toast.success('멤버가 스터디에서 나갔습니다.')
                queryClient.invalidateQueries({
                    queryKey: queryKeys.studyDetail(studyId),
                })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.participantByStudy(studyId),
                })
                return
            }

            const message = error instanceof Error ? error.message : '강퇴 중 오류가 발생했습니다'
            toast.error(message)
        },
    })
}
