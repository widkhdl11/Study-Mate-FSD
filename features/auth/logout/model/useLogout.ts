import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { isRedirect } from "@/shared/lib/format"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { logoutAction } from "../api/logoutAction"

export function useLogout() {
    const queryClient = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: logoutAction,
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error.message)
            }
        },
        onError: (error: Error & { digest?: string }) => {
            if (isRedirect(error)) {
                toast.success('로그아웃되었습니다')
                // queryClient.invalidateQueries({ queryKey: queryKeys.user })
                // queryClient.invalidateQueries({
                //     queryKey: queryKeys.notifications,
                // })
                // invalidateQueries는 캐시를 "stale"로 표시하고 즉시 refetch를 트리거함
                // 로그아웃 직후 세션이 이미 없어서 refetch 시 500 에러 발생
                // setQueryData/removeQueries로 캐시만 업데이트하고 refetch 방지
                queryClient.setQueryData(queryKeys.user, null)
                queryClient.removeQueries({ queryKey: queryKeys.notifications })
                queryClient.removeQueries({ queryKey: queryKeys.myProfile })
                router.refresh()
                return
            }
            toast.error('로그아웃 중 오류가 발생했습니다')
        },
    })
}