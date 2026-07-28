import { NotificationResponse } from '@/entities/notification'
import { queryKeys } from '@/shared/api/reactQuery/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteNotificationAction } from '../api/deleteNotificationAction'

export function useDeleteNotification(userId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteNotificationAction,
        onMutate: async (notificationId: number) => {
            await queryClient.cancelQueries({
                queryKey: queryKeys.notification(userId),
            })

            const previousNotifications = queryClient.getQueryData<NotificationResponse[]>(
                queryKeys.notification(userId),
            )

            queryClient.setQueryData(
                queryKeys.notification(userId),
                (old: NotificationResponse[] | undefined) => {
                    if (!old) return old
                    return old.filter((notification) => notification.id !== notificationId)
                },
            )

            return { previousNotifications }
        },
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.notification(response.data),
                })
                return
            }
            toast.error(response.error.message)
        },
        onError: (error, _variables, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    queryKeys.notification(userId),
                    context.previousNotifications,
                )
            }
            toast.error(error.message)
        },
    })
}
