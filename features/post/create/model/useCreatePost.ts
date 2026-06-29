import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { isRedirect } from "@/shared/lib/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPostAction } from "../api/createPostAction";

export function useCreatePost(onFieldError?: (field: string, message: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPostAction,
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
        toast.success("게시글을 생성했습니다.");
        return;
      }
      toast.error(error.message);
    },
  });
}