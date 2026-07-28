'use server'

import { NotificationId, readNotification } from "@/entities/notification"
import { createClient } from "@/shared/api/supabase/server"
import { ActionResponse } from "@/shared/kernel/actionType"
import { CustomUserAuth } from "@/shared/lib/auth"
export async function readNotificationAction(notificationId: number) : Promise<ActionResponse<string>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)


    const notificationIdVO = NotificationId.of(notificationId)
    if (!notificationIdVO.ok) {
        return { success: false, error: { message: notificationIdVO.error.kind } }
    }
    const response = await readNotification(supabase, notificationIdVO.value)
    if (!response.ok) {
        return { success: false, error: { message: response.error.kind } }
    }
    return { success: true , data: user.id }
}