import { queryChatDetail, queryChatParticipants } from "@/entities/chat";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { notFound } from "next/navigation";
import ChatRoomUI from "./ui";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const chatId = Number(id);
    const supabase = await createClient();
    const { user } = await CustomUserAuth(supabase);

    const [participantsResult, chatResult] = await Promise.all([
        queryChatParticipants(supabase, chatId, user.id),
        queryChatDetail(supabase, chatId, user.id),
    ]);

    if (!participantsResult.ok || !chatResult.ok) {
        notFound();
    }

    return <ChatRoomUI chatParticipants={participantsResult.value} chatRoom={chatResult.value} />
}
