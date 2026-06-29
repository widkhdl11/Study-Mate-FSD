'use client'

import { updateMyProfile, updateProfileImage } from "@/actions/profileAction"
import { queryKeys } from "@/shared/api/reactQuery/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


export function useUpdateProfileImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfileImage,
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


export function useUpdateProfile(onFieldError?: (field: string, message: string) => void) {
  const router = useRouter();
  
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("프로필을 수정했습니다");
        router.refresh();
        router.push("/profile");
      } else {
        toast.error(response.error.message);
        if (response.error.field && onFieldError) {
          onFieldError(response.error.field, response.error.message);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "프로필 수정에 실패했습니다");
    }
  });
}