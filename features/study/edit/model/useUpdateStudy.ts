import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { isRedirect } from "@/shared/lib/format"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateStudyAction } from "../api/updateStudyAction"



export function useUpdateStudy(
    onFieldError?: (field: string, message: string) => void
) {
    const queryClient = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: async (formData: FormData) => {
            return await updateStudyAction(formData)
        },
        onSuccess: (response,variables) => {
            if (!response.success) {
                toast.error(
                    response.error?.message || '스터디 수정에 실패했습니다.'
                )
                if (response.error?.field && onFieldError) {
                    onFieldError(response.error.field, response.error.message)
                }
                return
            }
            queryClient.invalidateQueries({
                queryKey: queryKeys.myCreatedStudies,
            })
            toast.success('스터디를 수정했습니다.')
            const studyId = variables.get('id')
            router.push(`/studies/${studyId}`)
        },
        onError: (error: any) => {
            if (isRedirect(error)) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.myCreatedStudies,
                })
                toast.success('스터디를 수정했습니다.')
                return
            } else {
                toast.error(error.message)
            }
        },
    })
}
