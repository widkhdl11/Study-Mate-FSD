'use server'

import { ProfileResponse } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { ActionResponse } from "@/shared/kernel/actionType"
import { CustomUserAuth } from "@/shared/lib/auth"

export async function updateProfileImageAction(
    image: File
): Promise<ActionResponse<ProfileResponse>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const fileName = `${Date.now()}-${user.id}.${image.type.split('/')[1]}`
    const storage = await supabase.storage
        .from('profile-images')
        .upload(fileName, image)
    if (storage.error || !storage.data) {
        throw new Error('이미지 업로드에 실패했습니다.')
    }
    const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: storage.data?.path })
        .eq('id', user.id)
        .select()
        .single()

    if (error || !data) {
        throw new Error('이미지 업데이트에 실패했습니다.')
    }
    return { success: true, data: data as unknown as ProfileResponse }
}