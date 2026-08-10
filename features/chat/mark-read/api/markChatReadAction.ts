'use server';

import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";

// 채팅방 읽음 처리 — 내 chat_participants.last_read_at을 현재 시각으로 갱신
export async function markChatReadAction(chatId: number) {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);

  const { error } = await supabase
    .from("chat_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: { message: "읽음 처리에 실패했습니다" } };
  }
  return { success: true };
}
