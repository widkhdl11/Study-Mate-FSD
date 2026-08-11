"use client"

import { ChatDetailView, ChatMessage, ChatParticipant, useChatMessages } from "@/entities/chat"
import { useMarkChatRead } from "@/features/chat/mark-read"
import { useSendMessage } from "@/features/chat/send-message"
import { useCurrentUser } from "@/entities/user"
import { getProfileImageUrl } from "@/shared/api/supabase/storage"
import { useChatScroll } from "@/shared/lib/useChatScroll"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Button } from "@/shared/shadcn/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/shadcn/ui/sheet"
import { EmptyState } from "@/shared/ui/EmptyState"
import { format, isToday, isYesterday } from "date-fns"
import { ko } from "date-fns/locale"
import { ArrowLeft, Menu, MessageCircle, Send, Users } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"

const GROUP_GAP_MS = 5 * 60 * 1000 // 같은 사람 연속 메시지를 한 그룹으로 묶는 시간 간격

function dayLabel(iso: string) {
  const d = new Date(iso)
  if (isToday(d)) return "오늘"
  if (isYesterday(d)) return "어제"
  return format(d, "yyyy년 M월 d일 EEEE", { locale: ko })
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
}

export default function ChatRoomUI({ chatParticipants, chatRoom }:
  { chatParticipants: ChatParticipant[], chatRoom: ChatDetailView }) {

  const { data: user } = useCurrentUser();
  const inputRef = useRef<HTMLInputElement>(null);
  useMarkChatRead(Number(chatRoom.id)); // 진입 시 읽음 처리
  const { data: messages, isLoading } = useChatMessages(Number(chatRoom.id));
  const sendMessageMutation = useSendMessage(Number(chatRoom.id));
  const [newMessage, setNewMessage] = useState("")
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

  const list = messages ?? []

  return (
    <div className="flex h-full w-full max-w-2xl mx-auto flex-col">
      {/* 채팅방 헤더 */}
      <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/profile" aria-label="뒤로 가기">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-secondary text-primary font-bold">
                {chatRoom.name?.[0] ?? "#"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold text-foreground">{chatRoom.name ?? "채팅방"}</h1>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" aria-hidden="true" />
                멤버 {chatParticipants.length}명
              </p>
            </div>
          </div>

          {/* 멤버 목록 시트 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="참여 멤버 보기">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>참여 멤버 {chatParticipants.length}명</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                {chatParticipants.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={getProfileImageUrl(member.profile?.avatar_url)}
                        alt={member.profile?.username || "사용자"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.profile?.username?.substring(0, 2) || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {member.profile?.username || "알 수 없음"}
                    </p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-4" ref={containerRef}>
        {isLoading ? (
          <MessagesSkeleton />
        ) : list.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={MessageCircle}
              title="아직 메시지가 없어요"
              description="첫 메시지를 보내 대화를 시작해 보세요."
            />
          </div>
        ) : (
          list.map((message: ChatMessage, i) => {
            const isMe = message.sender_id === user?.id
            const created = message.created_at || ""
            const prev = list[i - 1]
            const next = list[i + 1]

            const newDay =
              !prev ||
              new Date(created).toDateString() !== new Date(prev.created_at || "").toDateString()

            const groupedWithPrev =
              !!prev &&
              !newDay &&
              prev.sender_id === message.sender_id &&
              new Date(created).getTime() - new Date(prev.created_at || "").getTime() < GROUP_GAP_MS

            const groupedWithNext =
              !!next &&
              next.sender_id === message.sender_id &&
              new Date(next.created_at || "").toDateString() === new Date(created).toDateString() &&
              new Date(next.created_at || "").getTime() - new Date(created).getTime() < GROUP_GAP_MS

            const isFirstOfGroup = !groupedWithPrev
            const isLastOfGroup = !groupedWithNext

            return (
              <React.Fragment key={message.id}>
                {newDay && (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      {dayLabel(created)}
                    </span>
                  </div>
                )}
                <div className={`flex gap-2 ${isFirstOfGroup ? "mt-4 first:mt-0" : "mt-0.5"} ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* 상대 아바타: 그룹 첫 메시지에만, 이어지는 메시지는 자리만 확보 */}
                  {!isMe && (
                    isFirstOfGroup ? (
                      <Avatar className="mt-5 h-8 w-8 flex-shrink-0 self-start">
                        <AvatarImage
                          src={getProfileImageUrl(message.profile?.avatar_url)}
                          alt={message.profile?.username || "사용자"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {message.profile?.username?.substring(0, 2) || "??"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 flex-shrink-0" aria-hidden="true" />
                    )
                  )}
                  <div className={`flex max-w-[75%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && isFirstOfGroup && (
                      <span className="mb-1 px-1 text-xs font-medium text-muted-foreground">
                        {message.profile?.username || "알 수 없음"}
                      </span>
                    )}
                    <div className="flex items-end gap-1.5">
                      {isMe && isLastOfGroup && created && (
                        <span className="mb-0.5 shrink-0 text-xs text-muted-foreground tabular-nums">
                          {timeLabel(created)}
                        </span>
                      )}
                      <div
                        className={`px-3.5 py-2 leading-relaxed ${
                          isMe
                            ? "rounded-2xl rounded-tr-md bg-primary text-primary-foreground"
                            : "rounded-2xl rounded-tl-md border border-border bg-card text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      {!isMe && isLastOfGroup && created && (
                        <span className="mb-0.5 shrink-0 text-xs text-muted-foreground tabular-nums">
                          {timeLabel(created)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )
          })
        )}
      </div>

      {/* 입력 영역 */}
      <div className="flex-shrink-0 border-t border-border bg-background px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-full border border-border bg-secondary px-4 py-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <input
              ref={inputRef}
              type="text"
              autoFocus
              placeholder="메시지를 입력하세요"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            aria-label="메시지 보내기"
            className="h-10 w-10 flex-shrink-0 rounded-full bg-primary p-0 transition-transform hover:bg-primary/90 active:scale-95"
            disabled={newMessage.trim() === "" || sendMessageMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// 로딩 스켈레톤 — 좌우 번갈아 배치한 버블 자리표시자로 실제 대화 레이아웃을 예고한다.
function MessagesSkeleton() {
  const rows = [
    { me: false, w: "w-40" },
    { me: false, w: "w-28" },
    { me: true, w: "w-44" },
    { me: false, w: "w-56" },
    { me: true, w: "w-32" },
  ]
  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <div key={i} className={`flex gap-2 ${r.me ? "flex-row-reverse" : "flex-row"}`}>
          {!r.me && <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-muted" />}
          <div className={`h-10 ${r.w} animate-pulse rounded-2xl bg-muted`} />
        </div>
      ))}
    </div>
  )
}
