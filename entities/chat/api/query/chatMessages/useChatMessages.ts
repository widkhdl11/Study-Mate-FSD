"use client";

import { ChatMessage } from "@/entities/chat/model/types";
import { useCurrentUser } from "@/entities/user";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryChatMessages } from "./queryChatMessages";

/** 채팅방 메시지 읽기 훅: 초기 로드 + Realtime INSERT 구독 */
export const useChatMessages = (chatId: number) => {
  const queryClient = useQueryClient();
  const supabase = createClient(); // Realtime용
  const { data: user } = useCurrentUser();

  // 초기 메시지 로드
  const query = useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: async () => {
      const result = await queryChatMessages(supabase, chatId, user!.id);
      if (!result.ok) {
        throw new Error("메시지 로드 중 오류가 발생했습니다");
      }
      return result.value;
    },
    enabled: chatId > 0 && !!user?.id,
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
        async (payload: { new: ChatMessage }) => {
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
  }, [chatId, queryClient, supabase, user?.id]);

  return query;
};
