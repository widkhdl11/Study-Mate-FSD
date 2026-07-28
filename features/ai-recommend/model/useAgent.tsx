"use client";

import { getAIRecommendedPosts, getAIRecommendedStudies } from "@/actions/geminiAgentAction";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useAIRecommendedStudies() {
  return useQuery({
    queryKey: queryKeys.aiRecommendedStudies,
    queryFn: async () => {
      const result = await getAIRecommendedStudies();
      if (!result.success) {
        throw new Error(result.error?.message);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 10,  // 10분간 캐시 (API 비용 절약)
    retry: 1,  // 실패 시 1번만 재시도
  });
}


export function useAIRecommendedPosts() {
  return useQuery({
    queryKey: queryKeys.aiRecommendedPosts,
    queryFn: async () => {
      const result = await getAIRecommendedPosts();
      if (!result.success) {
        throw new Error(result.error?.message);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 10,  // 10분간 캐시 (API 비용 절약)
    retry: 1,  // 실패 시 1번만 재시도
  });
}
