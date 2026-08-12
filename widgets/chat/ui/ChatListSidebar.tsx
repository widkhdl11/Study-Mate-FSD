"use client";

import { useMyChatRooms } from "@/entities/chat";
import { formatTimeAgo } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMyChatRoomsRealtime } from "../model/useMyChatRoomsRealtime";

/**
 * 채팅 목록 사이드바 — (chat) 레이아웃에 상주한다.
 * 데스크톱: 좌측 고정 목록(방 전환해도 유지). 모바일: 방 미선택 시 전체화면 목록,
 * 방 진입 시 숨김(오른쪽 대화가 전체화면). react-query로 활성 방·unread를 라이브 반영.
 */
export function ChatListSidebar() {
  const pathname = usePathname();
  const { data: rooms, isLoading } = useMyChatRooms();

  const match = pathname?.match(/^\/chats\/(\d+)/);
  const activeId = match ? Number(match[1]) : null;
  const roomOpen = activeId !== null;

  // 다른 방의 새 메시지를 실시간 반영(미리보기·안읽음 즉시, 순서는 디바운스 후 최신순 정착)
  const roomIds = rooms?.map((r) => r.chat.id) ?? [];
  useMyChatRoomsRealtime(roomIds, activeId);

  return (
    <aside
      className={cn(
        "flex-col border-border bg-background md:flex md:w-80 md:shrink-0 md:border-r",
        roomOpen ? "hidden md:flex" : "flex w-full",
      )}
    >
      <div className="flex-shrink-0 border-b border-border px-4 py-4">
        <h2 className="text-lg font-bold text-foreground">채팅</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <SidebarSkeleton />
        ) : !rooms || rooms.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              아직 참여 중인 채팅방이 없어요.
            </p>
          </div>
        ) : (
          rooms.map((room) => {
            const unread = room.unreadCount > 0;
            const active = room.chat.id === activeId;
            const time = room.chat.last_message_at ?? room.created_at;
            return (
              <Link key={room.chat.id} href={`/chats/${room.chat.id}`} className="block">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                    active ? "bg-secondary" : "hover:bg-muted/50",
                  )}
                >
                  {/* 그룹 스터디 채팅 — 방 이니셜 원형(개인 아바타가 아니라 방 정체성) */}
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-secondary text-primary font-bold">
                      {room.chat.name?.[0] ?? "#"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3
                        className={cn(
                          "truncate",
                          unread ? "font-bold text-foreground" : "font-semibold text-foreground",
                        )}
                      >
                        {room.chat.name ?? "채팅방"}
                      </h3>
                      {time && (
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {formatTimeAgo(time)}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm",
                          unread ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {room.chat.last_message ?? "아직 메시지가 없어요"}
                      </p>
                      {unread && (
                        <Badge className="shrink-0 rounded-full bg-primary px-2 text-primary-foreground tabular-nums">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}

// 목록 로딩 스켈레톤 — 아바타 + 2줄 텍스트 자리표시자.
function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
