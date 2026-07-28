'use client';

import type { ParticipantResponse } from "@/entities/participant/model/types";
import { useCurrentUser } from "@/entities/user/api/query/currentUser/useCurrentUser";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { queryParticipantStatus } from "./queryParticipantStatus";

export function useParticipantStatus(
  initialParticipant: ParticipantResponse | null,
  studyId: number
) {
  const { data: user } = useCurrentUser();
    
  return useQuery({
    queryKey: queryKeys.participant(studyId, user?.id),
    queryFn: async () => {
      const supabase = createClient();
      const result = await queryParticipantStatus(supabase, studyId);
      if (!result.ok) {
        throw new Error(
          result.error.message || "참여 상태를 조회하는데 실패했습니다"
        );
      }
      return result.value;
    },
    enabled: studyId > 0 && !!user?.id,
    throwOnError: true,
    initialData: initialParticipant,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 10,
  });
}

