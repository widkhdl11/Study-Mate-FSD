import { createChat, getChatMessages, getChatParticipants, getMyChatRooms, sendMessage } from "@/actions/chatAction";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { ChatParticipant, ChatRoom } from "@/entities/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "./use-realtime-chat";
import { useUser } from "./useUser";


// 채팅방 생성(아직 사용처 없음)
export const useCreateChat = () => {
    return useMutation({
        mutationFn: async (formData : FormData) => {
            const create_chat_response = await createChat(formData);
            return create_chat_response;
        },
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.error?.message || "채팅방 생성 중 오류가 발생했습니다");
            }
        },
        onError: (error) => {
            toast.error(error?.message || "채팅방 생성 중 오류가 발생했습니다");
        },
    })
}

// 채팅방 목록 불러오기
export const useGetMyChatRooms = () => {
    return useQuery({
        queryKey: queryKeys.myChatRooms,
        queryFn: async () => {
            const result = await getMyChatRooms();
            if (!result.success) {
                throw new Error(result.error?.message || "채팅방 목록 불러오기 중 오류가 발생했습니다");
            }
            return result.data as unknown as ChatRoom[];
        },
        throwOnError: true,
    });
}
// 메세지 보내기

// 메세지 불러오기
export const useGetChatMessages = (chatId : number) => {
  const queryClient = useQueryClient();
  const supabase = createClient();  // Realtime용
  const { data: user } = useUser();
  // 초기 메시지 로드 (Server Action)
  const query = useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: async () => {
      const result = await getChatMessages(chatId);
      if (!result.success) {
        throw new Error(result.error?.message || "메시지 로드 중 오류가 발생했습니다");
      }
      return result.data as unknown as ChatMessage[];
    },
  });

  // 실시간 구독 (클라이언트)
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },

        // 메세지 중복 출력 방지  
        async (payload: any) => {
           if (payload.new.sender_id === user?.id) {
            return;
        }
          // 새 메시지의 프로필 정보 가져오기
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();
          const newMessage: ChatMessage = {
            ...payload.new,
            profile: profile,
          } as ChatMessage;

          // 캐시에 새 메시지 추가
          queryClient.setQueryData(
            queryKeys.chatMessages(chatId),
            (old: ChatMessage[] | undefined) => {
              if (!old) return [newMessage];
              
              // 중복 방지
              const exists = old.some((msg) => msg.id === newMessage.id);
              if (exists) return old;
              
              return [...old, newMessage];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient, supabase,user?.id]);

  return query;
    
}
// 채팅방 참여자 불러오기
export const useGetChatParticipants = (chatId : number) => {
    return useQuery({
        queryKey: queryKeys.chatParticipants(chatId),
        queryFn: async () => {
            const result = await getChatParticipants(chatId);
            if (!result.success) {
                throw new Error(result.error?.message || "채팅방 참여자 불러오기 중 오류가 발생했습니다");
            }
            return result.data as unknown as ChatParticipant[];
        },
        enabled: chatId > 0
    });
}
// 채팅방 삭제(스터디 삭제시 같이 삭제되도록)


// 메시지 전송 훅
export const useSendMessage = (chatId: number) => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (content: string) => {
      return await sendMessage(chatId, content);
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
          avatar_url: user?.avatar_url || null,
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
}
