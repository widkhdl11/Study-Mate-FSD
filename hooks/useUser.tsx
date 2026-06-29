'use client'

import { getMyProfile, getUser } from '@/actions/profileAction'
import { queryKeys } from '@/shared/api/reactQuery/queryKeys'
import { ProfileResponse } from '@/entities/user/model/types'
import { convertUser } from '@/shared/lib/conversion/user'
import { User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'

export function useUser() {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: async () => {
            const result = await getUser()
            if (result?.success && result.data) {
                return convertUser(result.data as User) // user만 전달
            }
            return null
        },
    })
}

export function useGetMyProfile() {
    const { data: user } = useUser()
    return useQuery({
        queryKey: queryKeys.myProfile,
        queryFn: async () => {
            const profile = await getMyProfile()
            if (profile?.success && profile.data) {
                return profile.data as ProfileResponse
            }
            return null
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    })
}
