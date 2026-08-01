'use server';

import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";

// 메시지 전송
export async function sendMessageAction(chatId: number, content: string) {
  const supabase = await createClient();

  // 1. 로그인 확인
  const { user } = await CustomUserAuth(supabase);

  // 2. 참여자 검증
  const { data: participant } = await supabase
    .from("chat_participants")
    .select("id")
    .eq("chat_id", chatId)
    .eq("user_id", user.id)
    .single();

  if (!participant) {
    return { success: false, error: { message: "채팅방 접근 권한이 없습니다" } };
  }

  // 3. 메시지 저장
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: { message: "메시지 전송에 실패했습니다" } };
  }

  return { success: true, data };
}
