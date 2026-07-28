import { ProfileRow } from "@/entities/user/model/Profile"
import { ProfileResponse } from "@/entities/user/model/types"
import { err, ok, Result } from "@/shared/kernel/Result"
import { SupabaseClient } from "@supabase/supabase-js"

export type QueryMyProfileError =
| { readonly kind: "Infra", readonly message: string }
| { readonly kind: "NotFound", readonly userId: string }
| { readonly kind: "Mapping", readonly cause: string }

function toProfileResponse(profile: ProfileRow): ProfileResponse {
    return {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        birthDate: profile.birth_date,
        gender: profile.gender,
        bio: profile.bio,
        points: profile.points,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
    }
}

export async function queryMyProfile(
    supabase: SupabaseClient,
    userId: string,
): Promise<Result<ProfileResponse, QueryMyProfileError>> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        return err({ kind: 'Infra', message: error.message })
    }
    if (!data) {
        return err({ kind: 'NotFound', userId })
    }

    return ok(toProfileResponse(data as ProfileRow))
}