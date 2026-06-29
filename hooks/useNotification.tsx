import {
    allReadNotification,
    getNotifications,
    readNotification,
} from '@/actions/notificationAction'
import { NotificationResponse } from '@/entities/notification'
import { ProfileResponse } from '@/entities/user/model/types'
import { queryKeys } from '@/shared/api/reactQuery/queryKeys'
import { createClient } from '@/shared/api/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

// is_deleted = false 인것 가져오기
export function useGetNotifications(user: ProfileResponse) {
    const queryClient = useQueryClient()
    const supabase = createClient()
    const query = useQuery({
        queryKey: [queryKeys.notifications, user?.id],
        queryFn: async () => {
            const result = await getNotifications()
            if (result.success) {
                return result.data as unknown as NotificationResponse[]
            } else {
                throw new Error(
                    result.error?.message ||
                        '알람 가져오기 중 오류가 발생했습니다'
                )
            }
        },
        enabled: !!user?.id,
    })

    useEffect(() => {
        if (!user?.id) return

        const channel = supabase.channel('notifications').on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user?.id}`,
            },
            async (payload) => {
                const newNotification = payload.new as NotificationResponse

                // 캐시에 추가
                queryClient.setQueryData(
                    queryKeys.notifications,
                    (old: Notification[] | undefined) => {
                        if (!old) return [newNotification]
                        return [newNotification, ...old] // 최신이 맨 위
                    }
                )
            }
        )
        channel.subscribe()
        // cleanup
        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id, queryClient, supabase])

    return query
}

// 메세지 읽기
export function useReadNotification() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (notificationId: number) => {
            return await readNotification(notificationId)
        },
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.notifications,
                })
            }
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })
}

export function useAllReadNotification() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            return await allReadNotification()
        },
        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: queryKeys.notifications,
            })
            const previousNotifications = queryClient.getQueryData<
                NotificationResponse[]
            >(queryKeys.notifications)
            queryClient.setQueryData(
                queryKeys.notifications,
                (old: NotificationResponse[] | undefined) => {
                    if (!old) return old
                    return old.map((notification) => ({
                        ...notification,
                        is_read: true,
                    }))
                }
            )
            return { previousNotifications }
        },
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.notifications,
                })
            }
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })
}
