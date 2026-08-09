'use server'

import { ProfileResponse } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { ActionResponse } from "@/shared/kernel/actionType"
import { CustomUserAuth } from "@/shared/lib/auth"

// 프로필 이미지를 기본값으로 되돌린다.
// avatar_url=null → getProfileImageUrl이 /default-profile.png를 반환.
export async function resetProfileImageAction(): Promise<ActionResponse<ProfileResponse>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)

    const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)
        .select()
        .single()

    if (error || !data) {
        throw new Error('기본 이미지로 되돌리지 못했습니다.')
    }
    return { success: true, data: data as unknown as ProfileResponse }
}
