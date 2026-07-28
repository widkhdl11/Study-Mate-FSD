import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { ActionResponse } from "@/shared/kernel/actionType"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteStudyAction } from "../api/deleteStudyAction"

export function useDeleteStudy() {
    const queryClient = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: async (studyId: number) => {
            return await deleteStudyAction(studyId)
        },
        onSuccess: (result: ActionResponse) => {
            if (!result.success) {
                toast.error(result.error?.message || '스터디 삭제에 실패했습니다.')
                router.push('/profile')
            }
            queryClient.invalidateQueries({
                queryKey: queryKeys.myCreatedStudies,
            })
            toast.success('스터디를 삭제했습니다.')
            router.push('/profile')
        },
        onError: (error: Error) => {
            toast.error(error.message)
            router.push('/profile')
        },
    })
}