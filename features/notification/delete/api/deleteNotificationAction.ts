'use server'

import { deleteNotification, NotificationId } from '@/entities/notification'
import { createClient } from '@/shared/api/supabase/server'
import { ActionResponse } from '@/shared/kernel/actionType'
import { CustomUserAuth } from '@/shared/lib/auth'

export async function deleteNotificationAction(
    notificationId: number,
): Promise<ActionResponse<string>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    if (!user) {
        return { success: false, error: { message: '로그인이 필요합니다.' } }
    }

    const notificationIdVO = NotificationId.of(notificationId)
    if (!notificationIdVO.ok) {
        return { success: false, error: { message: notificationIdVO.error.kind } }
    }

    const response = await deleteNotification(supabase, notificationIdVO.value)
    if (!response.ok) {
        return { success: false, error: { message: response.error.kind } }
    }

    return { success: true, data: user.id }
}
