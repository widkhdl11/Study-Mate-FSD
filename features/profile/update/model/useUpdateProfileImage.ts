"use client";

import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileImageAction } from "../api/updateProfileImageAction";

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: updateProfileImageAction,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("프로필 이미지를 변경했습니다");
        queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
        // 헤더 아바타는 SSR prop이라 react-query 무효화가 닿지 않음 → 서버 컴포넌트 재실행으로 갱신
        router.refresh();
      } else {
        toast.error(response.error?.message || "이미지 업로드에 실패했습니다");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "이미지 업로드에 실패했습니다");
    }
  });
}