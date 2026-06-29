import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { isRedirect } from "@/shared/lib/format"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { signupAction } from "../api/signupAction"
export function useSignup(
    onFieldError?: (field: string, message: string) => void
) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: signupAction,
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error.message)
                if (response.error.field && onFieldError) {
                    onFieldError(response.error.field, response.error.message)
                }
            }
        },
        onError: (error: Error & { digest?: string }) => {
            if (isRedirect(error)) {
                toast.success('회원가입 되었습니다')
                queryClient.invalidateQueries({ queryKey: queryKeys.user })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.notifications,
                })
                return
            }
            toast.error('회원가입 중 오류가 발생했습니다')
        },
    })
}