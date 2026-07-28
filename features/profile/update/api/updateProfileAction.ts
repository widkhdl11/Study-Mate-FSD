'use server'

import { profileEditSchema, ProfileResponse, UpdateProfileCommand } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"
import { ActionResponse } from "@/shared/kernel/actionType"
import { CustomUserAuth } from "@/shared/lib/auth"
import { validateWithZod } from "@/shared/lib/validation"
import { revalidatePath } from "next/cache"


export async function updateProfileAction(
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