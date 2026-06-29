"use client";

import {
  checkIsLiked,
  getAllPosts,
  getMyPosts,
  increaseViewCount,
  toggleLike
} from "@/actions/postAction";
import { PostDetailResponse, PostsResponse } from "@/entities/post/model/types";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { isRedirect } from "@/shared/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUser } from "./useUser";

export function useGetMyPosts() {
  return useQuery({
    queryKey: queryKeys.myPosts,
    queryFn: async () => {
      const response = await getMyPosts();
      if (response.success) {
        return response.data as unknown as PostsResponse;
      }
      throw new Error(response.error.message);
    },
  });
}



export function useGetAllPosts(initialData: PostsResponse[]) {
  const query = useQuery({
    queryKey: queryKeys.posts,
    queryFn: async () => {
      const response = await getAllPosts();
      if (response.success) {
        return response.data as unknown as PostsResponse[];
      }
      throw new Error(response.error.message);
    },
    initialData: initialData,
  });

  useEffect(() => {
    if (query.error) {
      const error = query.error as any;
      if (isRedirect(error)) {
        return;
      }
      toast.error(error.message || "게시글 목록을 불러오는데 실패했습니다.");
    }
  }, [query.error]);

  return query;
}

// 조회수 증가
export function useIncreaseViewCount(postId: number) {
  return useMutation({
    mutationFn: async () => {
      return await increaseViewCount(postId);
    },
  });
}

// 좋아요 여부 확인
export function useCheckIsLiked(postId: number) {
  const { data: userData } = useUser();
  const user = userData
  
  return useQuery({
    queryKey: queryKeys.like(postId),
    queryFn: async () => {
      const result = await checkIsLiked(postId);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error?.message || "좋아요 여부 확인에 실패했습니다.");
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}


// 좋아요 토글
export function useToggleLike(postId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await toggleLike(postId);
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


