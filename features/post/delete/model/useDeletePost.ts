import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { isRedirect } from "@/shared/lib/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePostAction } from "../api/deletePostAction";

// 게시글 삭제
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: number) => {
      return await deletePostAction(postId);
    },
    onSuccess: (response) => {
      if (!response.success) {
        // 삭제 실패
        toast.error(response.error.message);
      }
    },
    onError: (error: Error) => {
      if (isRedirect(error)) {
        toast.success("게시글을 삭제했습니다");
        queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
        queryClient.invalidateQueries({ queryKey: queryKeys.posts });
        return;
      }
      toast.error(error.message || "게시글 삭제 중 오류가 발생했습니다");
    },
  });
}
