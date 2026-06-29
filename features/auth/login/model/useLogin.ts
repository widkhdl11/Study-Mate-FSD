import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { isRedirect } from "@/shared/lib/format"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { loginAction } from "../api/loginAction"

export function useLogin(
    onFieldError?: (field: string, message: string) => void
) {
    const queryClient = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: loginAction,
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error.message)
                if (response.error.field && onFieldError) {
                    onFieldError(response.error.field, response.error.message)
                }
            }
        },
        onError: (error: Error) => {
            if (isRedirect(error)) {
                queryClient.invalidateQueries({ queryKey: queryKeys.user })
                queryClient.invalidateQueries({ queryKey: queryKeys.myProfile })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.notifications,
                })
                router.refresh()
                toast.success('로그인 성공했습니다.')
                return
            }
            toast.error(error.message)
        },
    })
}