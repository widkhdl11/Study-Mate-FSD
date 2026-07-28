import { PostDetailResponse } from "@/entities/post";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleLikeAction } from "../api/toggleLikeAction";

export function useToggleLike(postId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await toggleLikeAction(postId);
    },
    onMutate: async () => {

    await queryClient.cancelQueries({ queryKey: queryKeys.like(postId) });
    await queryClient.cancelQueries({ queryKey: queryKeys.post(postId) });
  
    const previousLike = queryClient.getQueryData<boolean>(queryKeys.like(postId));
    const previousPost = queryClient.getQueryData<PostDetailResponse>(queryKeys.post(postId));
  
    // 좋아요 토글
    queryClient.setQueryData(queryKeys.like(postId), !previousLike);
    
    // 좋아요 수 업데이트
    queryClient.setQueryData(queryKeys.post(postId), (old: PostDetailResponse | undefined) => {
      if (!old) return old;
      return {
        ...old,
        likes_count: previousLike ? old.likes_count - 1 : old.likes_count + 1
      };
    });
  
    return { previousLike, previousPost };
    },
    
    onSuccess: (response) => {
      if (response?.success) {
        // 서버 데이터로 동기화
        queryClient.invalidateQueries({ queryKey: queryKeys.like(postId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      } else {
        toast.error("좋아요 처리에 실패했습니다");
      }
    },
    
    onError: (error, variables, context) => {
      // 롤백
      if (context?.previousLike) {
        queryClient.setQueryData(queryKeys.like(postId), context.previousLike);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.post(postId), context.previousPost);
      }
      toast.error("좋아요 처리 중 오류가 발생했습니다");
    },
  });
}
