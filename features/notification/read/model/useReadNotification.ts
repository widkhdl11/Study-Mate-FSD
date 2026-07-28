import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { readNotificationAction } from "../api/readNotificationAction"

// 메세지 읽기
export function useReadNotification() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (notificationId: number) => {
            return await readNotificationAction(notificationId)
        },
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.notification(response.data),
                })
            }
        },
        onError: (error: Error) => {
            console.log("읽기 실패 : ",error)
            toast.error(error.message)
        },
    })
}