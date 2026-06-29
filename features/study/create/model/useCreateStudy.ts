import { queryClient } from "@/shared/api/reactQuery/ReactQueryClientProvider"
import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { isRedirect } from "@/shared/lib/format"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { createStudyAction } from "../api/createStudyAction"


export const useCreateStudy=(
    onFieldError?: (field: string, message: string) => void
)=>{

    return useMutation({
        mutationFn : createStudyAction,
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error.message)
                if (response.error.field && onFieldError) {
                    onFieldError(response.error.field, response.error.message)
                }
            }
        },
        onError: (error: any) => {
            if (isRedirect(error)) {
                queryClient.invalidateQueries({ queryKey: queryKeys.myStudies })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.myCreatedStudies,
                })
                toast.success('스터디를 생성했습니다.')
                return
            } else {
                toast.error(error.message)
            }
        },
    })
}