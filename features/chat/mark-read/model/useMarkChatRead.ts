import type { MyChatRoomView } from "@/entities/chat";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { markChatReadAction } from "../api/markChatReadAction";

/**
 * 채팅방 진입 시 읽음 처리. 마운트/방 전환 시 내 last_read_at을 갱신해
 * 프로필·홈의 안 읽은 배지/카운트가 다음 로드에서 0으로 반영되게 한다.
 *
 * 성공 시 목록을 refetch하지 않고, 열어본 방의 unreadCount만 캐시에서 0으로 낮춘다.
 * (매 클릭 refetch는 방별 count N+1로 느리고, 동점 정렬을 물리적 순서로 재정렬해
 *  클릭한 방이 맨 아래로 튀는 원인이 된다.)
 */
export function useMarkChatRead(chatId: number) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => markChatReadAction(chatId),
    onSuccess: () => {
      queryClient.setQueryData<MyChatRoomView[]>(queryKeys.myChatRooms, (old) =>
        old?.map((room) =>
          room.chat.id === chatId ? { ...room, unreadCount: 0 } : room,
        ),
      );
    },
  });

  useEffect(() => {
    mutate();
  }, [chatId, mutate]);
}
