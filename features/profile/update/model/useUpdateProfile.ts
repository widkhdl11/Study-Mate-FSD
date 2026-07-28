import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileAction } from "../api/updateProfileAction";

export function useUpdateProfile(onFieldError?: (field: string, message: string) => void) {
  const router = useRouter();
  
  return useMutation({
    mutationFn: updateProfileAction,
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