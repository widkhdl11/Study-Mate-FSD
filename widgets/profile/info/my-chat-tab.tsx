'use client'

import { getProfileImageUrl } from "@/shared/api/supabase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Card } from "@/shared/shadcn/ui/card";
import { TabsContent } from "@/shared/shadcn/ui/tabs";
import { MyChatRoomView } from "@/entities/chat";
import { formatTimeAgo } from "@/shared/lib/date";
import Link from "next/link";
export default function MyChatTab({chatRooms} : {
    chatRooms : MyChatRoomView[]
}) {
    return (<> {/* 채팅 탭 */}
        <TabsContent value="chats" className="space-y-4">
            <div className="space-y-3"> {
                chatRooms.map((room : MyChatRoomView) => (
                <Card key={room.chat.id}
                    className="group overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-0 gap-0 min-h-[100px]">
                    <Link href={`/chats/${room.chat.id}`}>
                    <div className="flex items-start gap-4 p-4">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={getProfileImageUrl(room.profile.avatar_url)} alt={room.chat.name ?? ""} />
                            <AvatarFallback className="bg-primary text-primary-foreground"> {room.chat.name || "??"} </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate"> {
                                    room.chat.name
                                } </h3>
                                {/* 읽지 않은 메세지 */}
                                {/* {
                                room.unreadCount > 0 && (<Badge className="bg-red-500 text-white"> {
                                    room.unreadCount
                                } </Badge>)
                            }  */}
                            </div>
                            <p className="text-sm text-muted-foreground truncate"> {
                                room.chat.last_message
                            } </p>
                            <p className="text-xs text-muted-foreground mt-1"> {
                                room.chat.last_message_at ? formatTimeAgo(room.chat.last_message_at) : room.created_at ? formatTimeAgo(room.created_at) : ""
                            } </p>
                        </div>
                    </div>
                    </Link>
                </Card>
                ))
            } </div>
        </TabsContent>
    </>);
}
