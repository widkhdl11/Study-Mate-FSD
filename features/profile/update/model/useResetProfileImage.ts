import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetProfileImageAction } from "../api/resetProfileImageAction";

export function useResetProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetProfileImageAction,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("기본 이미지로 되돌렸습니다");
        queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      } else {
        toast.error(response.error?.message || "기본 이미지로 되돌리지 못했습니다");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "기본 이미지로 되돌리지 못했습니다");
    },
  });
}
