'use server';

import { ChatMessage, ChatParticipant, ChatRoom } from "@/entities/chat";
import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { CustomUserAuth } from "@/shared/lib/auth";
import { notFound } from "next/navigation";


// 채팅방 생성
export async function createChat(formData : FormData): Promise<ActionResponse<ChatRoom>> {
    const supabase = await createClient();
    const { user } = await CustomUserAuth(supabase);
    const {data, error} = await supabase.from("chats").insert({study_id: formData.get("study_id")as string}).select();
    if (error) {
        throw new Error("채팅방 생성에 실패했습니다.");
    }
    return { success: true, data: data as unknown as ChatRoom };
}

// 참여중인 채팅방들 불러오기(마지막 메세지 포함)
export async function getMyChatRooms(): Promise<ActionResponse<ChatRoom[]>> {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);

  const { data, error } = await supabase
    .from("chat_participants")
    .select(`
      *,
      chat:chats(*),
      profile:profiles!chat_participants_user_id_fkey(username, avatar_url)
    `)
    .eq("user_id", user.id)
    .order("chat(last_message_at)", { ascending: false });

  if (error) {
    throw new Error("채팅방 목록 불러오기에 실패했습니다.");
  }
  
  return { success: true, data: data as unknown as ChatRoom[] };
}



// 채팅방 메시지 불러오기
export async function getChatMessages(chatId : number): Promise<ActionResponse<ChatMessage[]>> {
    const supabase = await createClient();
    const {user} = await CustomUserAuth(supabase);

    // 호출한 쪽에서 try/catch 필수
    const chatParticipant = await checkChatParticipant(chatId, user.id);
    if (!chatParticipant || chatParticipant.length === 0) {
        throw new Error("채팅방 참여자를 찾을 수 없습니다.");
    }

    const {data, error} = await supabase
    .from("chat_messages")
    .select(`*, 
        profile:profiles!chat_messages_sender_id_fkey(username, avatar_url)`)
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    if (error) {
        return {
            success: false,
            error: {
                message: error.message
            }
        };
    }
  return { success: true, data };
}

// 채팅방 참여자 불러오기
export async function getChatParticipants(chatId : number): Promise<ActionResponse<ChatParticipant[]>> {
    const supabase = await createClient();
    const {user} = await CustomUserAuth(supabase);
    const {data, error} = await supabase.from("chat_participants").select("*").eq("chat_id", chatId);
    if (error) {
        throw new Error("채팅방 참여자 불러오기에 실패했습니다.");
    }
    return { success: true, data: data as unknown as ChatParticipant[] };
}


// 해당 채팅방 참여 유저 확인
export async function checkChatParticipant(ChatId: number, userId: string): Promise<ChatParticipant[]> {
    const supabase = await createClient();
    const {data, error} = await supabase.from("chat_participants").select("*").eq("chat_id", ChatId).eq("user_id", userId);

    if (error) {
        throw new Error(error.message);
    }
    if (!data) {
        throw new Error("해당 채팅방에 참여하지 않은 유저입니다.");
    }
    return data;
}


// 메시지 전송
export async function sendMessage(chatId: number, content: string) {
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


// =============ssr================

// 채팅방 메시지 불러오기(ssr)
export async function getChatMessagesSSR(chatId : number) {
    const supabase = await createClient();  

    const {user} = await CustomUserAuth(supabase);
    const chatParticipant = await checkChatParticipant(chatId, user.id);
    if (!chatParticipant || chatParticipant.length === 0) {
        throw new Error("채팅방 참여자를 찾을 수 없습니다.");
    }
    const {data, error} = await supabase.from("chat_messages")
    .select(`*, profile:profiles!chat_messages_sender_id_fkey(username, avatar_url)`)
    .eq("chat_id", chatId).order("created_at", { ascending: true });
    if (error) {
        notFound();
    }
    return data;
}

// 채팅방 참여자 불러오기(ssr)
export async function getChatParticipantsSSR(ChatId : number) {
    const supabase = await createClient();
    const {user} = await CustomUserAuth(supabase);
    const chatParticipant = await checkChatParticipant(ChatId, user.id);
    if (!chatParticipant || chatParticipant.length === 0) {
        throw new Error("채팅방 참여자를 찾을 수 없습니다.");
    }
    const {data, error} = await supabase.from("chat_participants")
    .select(`*, profile:profiles!chat_participants_user_id_fkey(username, avatar_url)`).eq("chat_id",  ChatId);
    if (error || !data) {
        notFound();
    }
    return data;
}

// 채팅방 정보 불러오기(ssr)
export async function getChatSSR(ChatId : number) {
    const supabase = await createClient();
    const {user} = await CustomUserAuth(supabase);
    const chatParticipant = await checkChatParticipant(ChatId, user.id);
    if (!chatParticipant || chatParticipant.length === 0) {
        throw new Error("해당 채팅방에 참여하지 않은 유저입니다.");
    }
    const {data, error} = await supabase
    .from("chats")
    .select(`* , profile:profiles!chats_creator_id_fkey(username, avatar_url)`)
    .eq("id", ChatId)
    .maybeSingle();
    if (error || !data) {
        notFound();
    }
    return data;
}



// 참여중인 채팅방들 불러오기(마지막 메세지 포함)
export async function getMyChatRoomsSSR(): Promise<ChatRoom[]> {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);
  if (!user) {
    notFound();
  }
  
  const { data, error } = await supabase
    .from("chat_participants")
    .select(`
      *,
      chat:chats(*),
      profile:profiles!chat_participants_user_id_fkey(username, avatar_url)
    `)
    .eq("user_id", user.id)
    .order("chat(last_message_at)", { ascending: true });

  if (error) {
    notFound();
  }
  
  return data as unknown as ChatRoom[];
}
