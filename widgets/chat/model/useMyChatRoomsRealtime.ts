"use client";

import { compareMyChatRooms, MyChatRoomView } from "@/entities/chat";
import { useCurrentUser } from "@/entities/user";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

/** 메시지가 멈춘 뒤 목록을 재정렬하기까지의 대기(디바운스) — 폭주 중엔 순서 고정. */
const RESORT_DELAY_MS = 1500;

/**
 * 채팅 목록 실시간 반영 + 디바운스 재정렬.
 * 내가 참여한 모든 방의 새 메시지를 구독해 미리보기·시각·안읽음을 **즉시 제자리 갱신**하되,
 * 순서(재정렬)는 메시지가 잠잠해진 뒤 RESORT_DELAY_MS 후 한 번만 수행한다.
 * → 여러 방이 동시에 활발해도 목록이 계속 튀지 않고, 끝나면 최신순으로 정착.
 * 내 메시지는 전송 훅(useSendMessage)이 즉시 처리하므로 여기선 건너뛴다.
 */
export function useMyChatRoomsRealtime(roomIds: number[], activeId: number | null) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const supabase = createClient(); // @supabase/ssr 브라우저 싱글턴

  const resortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId; // 재구독 없이 최신 활성 방을 핸들러가 참조
  }, [activeId]);

  // 방 집합이 바뀔 때만 재구독(개별 메시지 갱신으로는 재구독하지 않게 id 키로 고정).
  const roomIdsKey = roomIds.join(",");

  useEffect(() => {
    if (!user?.id || roomIds.length === 0) return;

    const scheduleResort = () => {
      if (resortTimerRef.current) clearTimeout(resortTimerRef.current);
      resortTimerRef.current = setTimeout(() => {
        queryClient.setQueryData<MyChatRoomView[]>(queryKeys.myChatRooms, (old) =>
          old ? [...old].sort(compareMyChatRooms) : old,
        );
      }, RESORT_DELAY_MS);
    };

    const channel = supabase.channel("my-chat-rooms");
    for (const id of roomIds) {
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `chat_id=eq.${id}` },
        (payload: {
          new: { chat_id: number; content: string; created_at: string | null; sender_id: string | null };
        }) => {
          const msg = payload.new;
          if (msg.sender_id === user.id) return; // 내 메시지는 전송 훅이 처리
          const isActive = msg.chat_id === activeIdRef.current;

          // 미리보기·시각·안읽음만 즉시 갱신(순서 유지). 재정렬은 디바운스로 미룬다.
          queryClient.setQueryData<MyChatRoomView[]>(queryKeys.myChatRooms, (old) => {
            if (!old) return old;
            return old.map((room) =>
              room.chat.id === msg.chat_id
                ? {
                    ...room,
                    chat: {
                      ...room.chat,
                      last_message: msg.content,
                      last_message_at: msg.created_at ?? room.chat.last_message_at,
                    },
                    // 열려 있는 방은 읽는 중이므로 안읽음 유지(0), 아니면 +1
                    unreadCount: isActive ? 0 : room.unreadCount + 1,
                  }
                : room,
            );
          });

          scheduleResort();
        },
      );
    }
    channel.subscribe();

    return () => {
      if (resortTimerRef.current) clearTimeout(resortTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [roomIdsKey, user?.id, queryClient, supabase]); // eslint-disable-line react-hooks/exhaustive-deps
}
