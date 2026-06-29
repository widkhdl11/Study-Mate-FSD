import { UpdatePostCommand } from "@/entities/post";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { isRedirect } from "@/shared/lib/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updatePostAction } from "../api/updatePostAction";

export function useUpdatePost(onFieldError?: (field: string, message: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values : UpdatePostCommand) => {
      return await updatePostAction(values);
    },
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error.message);
        if (response.error.field && onFieldError) {
          onFieldError(response.error.field, response.error.message);
        }
      }
    },
    onError: (error: Error) => {
      if (isRedirect(error)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.myPosts });
        queryClient.invalidateQueries({ queryKey: queryKeys.posts });
        toast.success("게시글을 수정했습니다");
        return;
      }
      toast.error(error.message || "게시글 수정 중 오류가 발생했습니다");
    },
  });
}
