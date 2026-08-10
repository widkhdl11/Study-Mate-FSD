import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { markChatReadAction } from "../api/markChatReadAction";

/**
 * 채팅방 진입 시 읽음 처리. 마운트/방 전환 시 내 last_read_at을 갱신해
 * 프로필·홈의 안 읽은 배지/카운트가 다음 로드에서 0으로 반영되게 한다.
 */
export function useMarkChatRead(chatId: number) {
  const { mutate } = useMutation({
    mutationFn: () => markChatReadAction(chatId),
  });

  useEffect(() => {
    mutate();
  }, [chatId, mutate]);
}
