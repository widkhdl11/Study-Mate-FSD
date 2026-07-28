'use server'

import { allReadNotification } from '@/entities/notification'
import { createClient } from '@/shared/api/supabase/server'
import { ActionResponse } from '@/shared/kernel/actionType'
import { CustomUserAuth } from '@/shared/lib/auth'

export async function allReadNotificationAction(): Promise<ActionResponse<string>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    if (!user) {
        return { success: false, error: { message: '로그인이 필요합니다.' } }
    }

    const response = await allReadNotification(supabase)
    if (!response.ok) {
        return { success: false, error: { message: response.error.kind } }
    }

    return { success: true, data: user.id }
}
