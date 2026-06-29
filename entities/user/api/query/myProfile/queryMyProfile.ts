'use server'

import { ProfileRow } from "@/entities/user/model/Profile"
import { ProfileResponse } from "@/entities/user/model/types"
import { createClient } from "@/shared/api/supabase/server"
import { err, ok, Result } from "@/shared/kernel/Result"
import { CustomUserAuth } from "@/shared/lib/auth"
import { toProfileResponse } from "./toView"

export type QueryMyProfileError =
| { readonly kind: "Infra", readonly message: string }
| { readonly kind: "NotFound", readonly userId: string }
| { readonly kind: "Mapping", readonly cause: string }

export async function queryMyProfile(): Promise<Result<ProfileResponse, QueryMyProfileError>> {
    const supabase = await createClient()
    const { user } = await CustomUserAuth(supabase)
    const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

    if (error) {
        return err({ kind: 'Infra', message: error.message })
    }


    const profileResponse = toProfileResponse(data as ProfileRow)
    return ok(profileResponse)
}