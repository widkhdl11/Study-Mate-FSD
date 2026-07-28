import { createClient } from "@/shared/api/supabase/server"
import { err, ok, Result } from "@/shared/kernel/Result"
import { CustomUserAuth } from "@/shared/lib/auth"
import { ProfileResponse } from "../model/types"

// 1. profiles 테이블의 로그인한 유저정보를 가져오는 함수
// 2. profiles 테이블에서 받은 userId를 통해 유저정보를 가져오는 함수

export type UserDetailError =
| { readonly kind: "DatabaseError", readonly message: string }
| { readonly kind: "NotFound", readonly userId: string }
| { readonly kind: "Mapping", readonly cause: string }



export async function getMyUserInfo(): Promise<Result<ProfileResponse, UserDetailError>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
    if (error) {
        return err({ kind: 'DatabaseError', message: error.message })
    }
    return ok(data)
}

export async function getUserInfoByUserId(userId: string): Promise<Result<ProfileResponse, UserDetailError>> {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

    if (error) {
        return err({ kind: 'DatabaseError', message: error.message })
    }
    return ok(data)
}

export async function updateUserInfo(userId: string, userInfo: ProfileResponse): Promise<Result<ProfileResponse, UserDetailError>> {
    const supabase = await createClient()
    await CustomUserAuth(supabase)
    const { data, error } = await supabase
    .from('profiles')
    .update(userInfo)
    .eq('id', userId)
    .single()
    
    if (error) {
        return err({ kind: 'DatabaseError', message: error.message })
    }
    return ok(data)
}