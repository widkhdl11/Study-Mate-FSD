'use client'

import { useCurrentUser } from "@/entities/user/api/query/currentUser/useCurrentUser";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { queryIsLiked } from "./queryIsLiked";

export function useIsLiked(postId: number) {
    const { data: user } = useCurrentUser();

    return useQuery({
        queryKey: queryKeys.like(postId),
        queryFn: async () => {
            const supabase = createClient();
            const result = await queryIsLiked(supabase, postId, user!.id);
            if (!result.ok) {
                throw new Error(result.error.message || "좋아요 여부 확인에 실패했습니다.");
            }
            return result.value;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });
}
