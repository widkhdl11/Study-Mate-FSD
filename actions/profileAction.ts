'use server'

import { MyProfileCountResponse, ProfileResponse } from '@/entities/user'
import { createClient } from '@/shared/api/supabase/server'
import { ActionResponse } from '@/shared/kernel/actionType'
import { CustomUserAuth } from '@/shared/lib/auth'

export async function updateProfileImage(
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


// =================ssr ======================

export async function getMyProfilesCountSSR(): Promise<MyProfileCountResponse> {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError) {
        return {
            myPostsCount: 0,
            myParticipatedStudiesCount: 0,
            myParticipatedChatRoomsCount: 0
        }
    }
    const id = user.user.id
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            posts!posts_author_id_fkey(count),
            participants!participants_user_id_fkey(count),
            chat_participants!chat_participants_user_id_fkey(count)
        `)
        .eq('id', id)
        .single()
    if (error) {
        return {
            myPostsCount: 0,
            myParticipatedStudiesCount: 0,
            myParticipatedChatRoomsCount: 0
        }
    }
    return {
        myPostsCount: data.posts?.[0]?.count ?? 0,
        myParticipatedStudiesCount: data.participants?.[0]?.count ?? 0,
        myParticipatedChatRoomsCount: data.chat_participants?.[0]?.count ?? 0,
    }
}
