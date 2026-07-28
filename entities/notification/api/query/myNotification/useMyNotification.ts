'use client'

import { NotificationResponse } from "@/entities/notification/model/types"
import { CurrentUserResponse } from "@/entities/user/api/query/currentUser/types"
import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { createClient } from "@/shared/api/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { queryMyNotification } from "./queryMyNotification"


export function useMyNotification(user: CurrentUserResponse) {
    const queryClient = useQueryClient()
    const supabase = createClient()
    const query = useQuery({
        queryKey: queryKeys.notification(user?.id),
        queryFn: async () => {
            const result = await queryMyNotification(supabase, user.id)
            if (result.ok) {
                return result.value as unknown as NotificationResponse[]
            } else {
                throw new Error(
                    result.error.message ||
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
                    queryKeys.notification(user.id),
                    (old: NotificationResponse[] | undefined) => {
                        if (!old) return [newNotification]
                        return [newNotification, ...old]
                    },
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