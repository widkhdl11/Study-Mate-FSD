"use client";

import { ChatMessage } from "@/entities/chat/model/types";
import { useCurrentUser } from "@/entities/user";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { queryChatMessages } from "./queryChatMessages";

/** 한 번에 가져올 메시지 수 (초기 로드·이전 페이지 공통) */
const PAGE_SIZE = 30;

/**
 * 채팅방 메시지 읽기 훅: 최근 PAGE_SIZE개만 먼저 로드 + Realtime INSERT 구독.
 * 위로 스크롤하면 fetchOlder()로 이전 페이지를 prepend해 단계적으로 가져온다.
 * (전체를 한 번에 가져오지 않아 초기 렌더가 빠르다.)
 */
export const useChatMessages = (chatId: number) => {
  const queryClient = useQueryClient();
  const supabase = createClient(); // Realtime용
  const { data: user } = useCurrentUser();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  // 초기 메시지 로드 (최근 PAGE_SIZE개)
  const query = useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: async () => {
      const result = await queryChatMessages(supabase, chatId, user!.id, { limit: PAGE_SIZE });
      if (!result.ok) {
        throw new Error("메시지 로드 중 오류가 발생했습니다");
      }
      // 받은 개수가 PAGE_SIZE 미만이면 더 가져올 이전 메시지가 없다.
      setHasMore(result.value.length === PAGE_SIZE);
      return result.value;
    },
    enabled: chatId > 0 && !!user?.id,
    // 누적된 이전 페이지를 포커스 refetch가 날리지 않도록(새 메시지는 Realtime이 담당).
    refetchOnWindowFocus: false,
  });

  // 이전 페이지 로드 — 현재 가장 오래된 메시지보다 더 오래된 PAGE_SIZE개를 앞에 붙인다.
  const fetchOlder = useCallback(async () => {
    if (isLoadingOlder || !hasMore || !user?.id) return;
    const current = queryClient.getQueryData<ChatMessage[]>(queryKeys.chatMessages(chatId));
    if (!current || current.length === 0) return;

    const oldest = current[0];
    setIsLoadingOlder(true);
    try {
      const result = await queryChatMessages(supabase, chatId, user.id, {
        limit: PAGE_SIZE,
        before: oldest.created_at,
      });
      if (!result.ok) return;

      const older = result.value; // 오래된→최신 순
      setHasMore(older.length === PAGE_SIZE);
      if (older.length === 0) return;

      queryClient.setQueryData<ChatMessage[]>(queryKeys.chatMessages(chatId), (old) => {
        if (!old) return older;
        const existing = new Set(old.map((m) => m.id));
        const fresh = older.filter((m) => !existing.has(m.id));
        return [...fresh, ...old];
      });
    } finally {
      setIsLoadingOlder(false);
    }
  }, [chatId, hasMore, isLoadingOlder, queryClient, supabase, user?.id]);

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

  return { ...query, fetchOlder, hasMore, isLoadingOlder };
};
