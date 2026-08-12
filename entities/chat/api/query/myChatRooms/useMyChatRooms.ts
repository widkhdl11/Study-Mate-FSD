"use client";

import { useCurrentUser } from "@/entities/user";
import { queryKeys } from "@/shared/api/reactQuery/queryKeys";
import { createClient } from "@/shared/api/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { queryMyChatRooms } from "./queryMyChatRooms";

/**
 * 내 채팅방 목록 읽기 훅(사이드바용).
 * 레이아웃에 상주하는 목록은 방을 전환해도 리렌더되지 않으므로,
 * 활성 방 하이라이트·unread 갱신을 위해 클라이언트 캐시로 관리한다.
 */
export const useMyChatRooms = () => {
  const supabase = createClient();
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.myChatRooms,
    queryFn: async () => {
      const result = await queryMyChatRooms(supabase, user!.id);
      if (!result.ok) {
        throw new Error("채팅방 목록을 불러오지 못했습니다");
      }
      return result.value;
    },
    enabled: !!user?.id,
  });
};
