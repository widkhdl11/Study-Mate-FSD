'use server'

import { MyProfileCountResponse, ProfileResponse } from '@/entities/user'
import profileEditSchema, {
    UpdateProfileCommand,
} from '@/entities/user/model/profileFormSchema'
import { createClient } from '@/shared/api/supabase/server'
import { ActionResponse } from '@/shared/kernel/actionType'
import { CustomUserAuth } from '@/shared/lib/auth'
import { validateWithZod } from '@/shared/lib/validation'
import { User } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

export async function getUser(): Promise<ActionResponse<User> | null> {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError) {
        return null
    }
    return { success: true, data: user.user }
}

export async function getMyProfile(): Promise<ActionResponse<ProfileResponse>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error || !data) {
        throw new Error('사용자 정보를 찾을 수 없습니다.')
    }
    return { success: true, data: data as unknown as ProfileResponse }
}

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

export async function updateMyProfile(
    formData: FormData
): Promise<ActionResponse<ProfileResponse>> {
    const supabase = await createClient()

    const { user } = await CustomUserAuth(supabase)
    const rawData = {
        username: formData.get('username') as string,
        bio: formData.get('bio') as string,
        birthDate: formData.get('birthDate') as string,
        gender: formData.get('gender') as string,
    }

    const parseResult = validateWithZod(profileEditSchema, rawData)
    if (!parseResult.success) {
        return parseResult
    }
    const { username, bio, birthDate, gender } =
        parseResult.data as UpdateProfileCommand

    // birthDate를 date 타입(YYYY-MM-DD에서 Date)으로 변환
    const birthDateObj = new Date(birthDate)
    if (isNaN(birthDateObj.getTime())) {
        throw new Error('유효하지 않은 생년월일입니다.')
    }
    const { data, error } = await supabase
        .from('profiles')
        .update({
            username: username,
            bio: bio,
            birth_date: birthDateObj,
            gender: gender,
        })
        .eq('id', user.id)

    if (error) {
        throw new Error('사용자 정보 수정에 실패했습니다.')
    }

    // 안넣어도 되긴함
    revalidatePath('/profile', 'layout')
    return { success: true, data: data as unknown as ProfileResponse }
}

// =================ssr ======================

export const getMyProfileSSR = cache(async (): Promise<ProfileResponse | null> => {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError) {
        return null
    }
    const id = user.user.id
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return null
    }
    return data as unknown as ProfileResponse
})

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
