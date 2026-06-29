"use client"

import { useChatScroll } from "@/hooks/use-chat-scroll"
import { ChatMessage } from "@/hooks/use-realtime-chat"
import { useGetChatMessages, useSendMessage } from "@/hooks/useChat"
import { useUser } from "@/hooks/useUser"
import { getProfileImageUrl } from "@/shared/api/supabase/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Button } from "@/shared/shadcn/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/shadcn/ui/sheet"
import { ChatParticipant, ChatRoom } from "@/entities/chat"
import { ArrowLeft, ImageIcon as ImageIconComponent, Menu, Send, Smile } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"


export default function ChatRoomUI({ chatParticipants, chatRoom }: 
  { chatParticipants: ChatParticipant[], chatRoom: ChatRoom }) {

    const { data: user } = useUser();
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: messages, isLoading } = useGetChatMessages(Number(chatRoom.id));
    const sendMessageMutation = useSendMessage(Number(chatRoom.id));    
    const [newMessage, setNewMessage] = useState("")
    // const messagesEndRef = useRef<HTMLDivElement>(null)
    const { containerRef, scrollToBottom } = useChatScroll()

  // 메시지가 추가되면 스크롤 이동
  useEffect(() => {
    scrollToBottom()
    inputRef.current?.focus()
  }, [messages, scrollToBottom])

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || sendMessageMutation.isPending) return
    sendMessageMutation.mutate(newMessage.trim());
    setNewMessage("");
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => { 
    if (!sendMessageMutation.isPending && inputRef.current) { 
      inputRef.current.focus(); 
    } 
  }, [sendMessageMutation.isPending]);
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  return (
  <div className="h-full flex flex-col max-w-2xl w-full mx-auto">
      {/* 채팅방 헤더 */}
      <div className="border-b border-border bg-background/95 backdrop-blur flex-shrink-0">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-foreground truncate">{chatRoom.name}</h1>
              <p className="text-xs text-muted-foreground">멤버 {chatParticipants.length}명</p>
            </div>
          </div>

          {/* 멤버 목록 시트 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>참여 멤버 ({chatParticipants.length}명)</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                {chatParticipants.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage 
                        src={getProfileImageUrl(member.profile?.avatar_url)}
                        alt={member.profile?.username || "사용자"} 
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {member.profile?.username?.substring(0, 2) || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.profile?.username || "알 수 없음"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-4" ref={containerRef}>
        {messages?.map((message: ChatMessage) => {
          const isMe = message.sender_id === user?.id;
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isMe && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage 
                    src={getProfileImageUrl(message.profile?.avatar_url)}
                    alt={message.profile?.username || "사용자"} 
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {message.profile?.username?.substring(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                {!isMe && (
                  <span className="text-xs text-muted-foreground mb-1">
                    {message.profile?.username || "알 수 없음"}
                  </span>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isMe ? "bg-blue-600 text-white" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(message.created_at || "").toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        {/* <div ref={messagesEndRef} /> */}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-border bg-background p-4 sm:p-6 flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="flex-shrink-0" disabled>
              <ImageIconComponent className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="flex-shrink-0" disabled>
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              autoFocus  
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground text-sm"
              // disabled={sendMessageMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 p-0 flex-shrink-0"
            disabled={newMessage.trim() === "" || sendMessageMutation.isPending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}