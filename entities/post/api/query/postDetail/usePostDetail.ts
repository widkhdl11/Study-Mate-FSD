import { createClient } from "@/shared/api/supabase/client";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { queryPostDetail } from "./queryPostDetail";
import { PostDetailView } from "./types";

// 게시글 상세 조회, 서버->리액트 쿼리 캐시등록
export function usePostDetail(initialPost: PostDetailView) {
  return useQuery({
    queryKey: queryKeys.post(initialPost.id),
    queryFn: async () => {
      const supabase = createClient();
      const result = await queryPostDetail(supabase, initialPost.id);
      if (result.ok) return result.value;
      else throw new Error(result.error.kind);
    },
    initialData: initialPost,
    staleTime: 1000 * 60 * 5,  // 5분간 refetch 안 함
  });
}

