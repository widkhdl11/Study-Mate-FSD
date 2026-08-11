'use client'

import { MyChatRoomView } from "@/entities/chat";
import { formatTimeAgo } from "@/shared/lib/date";
import { Avatar, AvatarFallback } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import { TabsContent } from "@/shared/shadcn/ui/tabs";
import { EmptyState } from "@/shared/ui/EmptyState";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function MyChatTab({ chatRooms }: {
    chatRooms: MyChatRoomView[]
}) {
    return (
        <TabsContent value="chats" className="space-y-2">
            {chatRooms.length === 0 ? (
                <EmptyState
                    icon={MessageCircle}
                    title="아직 참여 중인 채팅방이 없어요"
                    description="스터디에 참여하면 팀원들과 바로 대화할 수 있어요."
                    action={{ label: "스터디 찾아보기", href: "/posts" }}
                />
            ) : (
                chatRooms.map((room) => {
                    const unread = room.unreadCount > 0
                    const time = room.chat.last_message_at ?? room.created_at
                    return (
                        <Link key={room.chat.id} href={`/chats/${room.chat.id}`} className="block">
                            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30">
                                {/* 그룹 스터디 채팅 — 방 이니셜을 브랜드 틴트 원형으로(개인 아바타가 아니라 방 정체성) */}
                                <Avatar className="h-12 w-12 shrink-0">
                                    <AvatarFallback className="bg-secondary text-primary text-lg font-bold">
                                        {room.chat.name?.[0] ?? "#"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <h3 className={`truncate ${unread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                                            {room.chat.name ?? "채팅방"}
                                        </h3>
                                        {time && (
                                            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                                {formatTimeAgo(time)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <p className={`min-w-0 flex-1 truncate text-sm ${unread ? "text-foreground" : "text-muted-foreground"}`}>
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
                    )
                })
            )}
        </TabsContent>
    )
}
