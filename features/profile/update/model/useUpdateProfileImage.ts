import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProfileImageAction } from "../api/updateProfileImageAction";

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfileImageAction,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("프로필 이미지를 변경했습니다");
        queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      } else {
        toast.error(response.error?.message || "이미지 업로드에 실패했습니다");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "이미지 업로드에 실패했습니다");
    }
  });
}