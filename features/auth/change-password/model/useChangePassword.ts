import { isRedirect } from "@/shared/lib/format"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { changePasswordAction } from "../api/changePasswordAction"

export function useChangePassword(onFieldError?: (field: string, message: string) => void) {
    return useMutation({
        mutationFn: changePasswordAction,
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error.message)
                if (response.error.field && onFieldError) {
                    onFieldError(response.error.field, response.error.message)
                }
            } else {
                toast.success('비밀번호 변경 성공')
            }
        },
        onError: (error: Error) => {
            if (isRedirect(error)) {
                toast.success('비밀번호 변경 성공')
                return
            }
            toast.error(error.message)
        }
    })
}