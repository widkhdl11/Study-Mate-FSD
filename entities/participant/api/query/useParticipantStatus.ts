'use client';

import type { ParticipantResponse } from "@/entities/participant/model/types";
import { useUser } from "@/hooks/useUser";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { getParticipantStatus } from "./getParticipantStatus";

export function useParticipantStatus(
  initialParticipant: ParticipantResponse | null,
  studyId: number
) {
  const { data: user } = useUser();

  return useQuery({
    queryKey: queryKeys.participant(studyId, user?.id),
    queryFn: async () => {
      const result = await getParticipantStatus(studyId);
      if (!result.success) {
        throw new Error(
          result.error?.message || "참여 상태를 조회하는데 실패했습니다"
        );
      }
      return result.data;
    },
    enabled: studyId > 0 && !!user?.id,
    throwOnError: true,
    initialData: initialParticipant,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 10,
  });
}

