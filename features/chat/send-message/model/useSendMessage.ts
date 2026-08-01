import type { ChatMessage } from "@/entities/chat";
import { useCurrentUser } from "@/entities/user";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendMessageAction } from "../api/sendMessageAction";

// 메시지 전송 훅
export const useSendMessage = (chatId: number) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: async (content: string) => {
      return await sendMessageAction(chatId, content);
    },
    // 낙관적 업데이트: 전송 즉시 UI에 추가
    onMutate: async (content) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: queryKeys.chatMessages(chatId) });

      // 이전 캐시 저장 (롤백용)
      const previousMessages = queryClient.getQueryData(queryKeys.chatMessages(chatId));

      // 임시 메시지 생성
      const tempMessage: ChatMessage = {
        id: Date.now(),  // 임시 ID
        chat_id: chatId,
        sender_id: user?.id || "",
        content,
        created_at: new Date().toISOString(),
        profile: {
          username: user?.username || "",
          avatar_url: user?.avatarUrl || "",
        },
      };

      // 캐시에 즉시 추가
      queryClient.setQueryData(
        queryKeys.chatMessages(chatId),
        (old: ChatMessage[] | undefined) => {
          if (!old) return [tempMessage];
          return [...old, tempMessage];
        }
      );

      return { previousMessages, tempMessage };
    },
    // 에러 시 롤백
    onError: (err, content, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.chatMessages(chatId),
          context.previousMessages
        );
      }
      toast.error("메시지 전송 중 오류가 발생했습니다");
    },
    onSuccess: (response) => {
      if (!response.success || response.error) {
        toast.error(response.error?.message || "메시지 전송 중 오류가 발생했습니다");
      }
    },
  });
};
