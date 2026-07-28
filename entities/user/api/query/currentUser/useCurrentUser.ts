import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { queryCurrentUser } from "./queryCurrentUser";

export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: async () => {
            const supabase = createClient();
            const result = await queryCurrentUser(supabase);
            return result.ok ? result.value : null;
        },
    });
}