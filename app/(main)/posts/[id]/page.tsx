import { queryStudyChatRoom } from "@/entities/chat";
import { queryParticipantStatus } from "@/entities/participant";
import { queryPostDetail, PostDetailView, PostWithRelationResponse } from "@/entities/post";
import { queryMyProfile } from "@/entities/user";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth, tryAuth } from "@/shared/lib/auth";
import { PostDetailWidget, SidebarSection, MainSection } from "@/widgets/post-detail";
import { notFound } from "next/navigation";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const postData = await queryPostDetail(supabase, Number(id));
  if (!postData.ok) {
    notFound()
  }
  const relatedPosts: PostWithRelationResponse[] = [];

  return (
     <PostDetailWidget 
        postData={postData.value} 
        relatedPosts={relatedPosts} 
        MainSectionSlot={<MainSectionLoader postData={postData.value} />} 
        SidebarSectionSlot={<SidebarSectionLoader postData={postData.value} />} 
     />
  );
}
async function MainSectionLoader({ postData }: { postData: PostDetailView }) {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);
  const profile = await queryMyProfile(supabase, user.id);

  return <MainSection postData={postData} user={profile.ok ? profile.value : null} />;
}
async function SidebarSectionLoader({ postData }: { postData: PostDetailView }) {
  const supabase = await createClient();
  const result = await queryParticipantStatus(supabase, postData.study.id);
  const participant = result.ok ? result.value : null;
  const auth = await tryAuth(supabase);
  const isOwner = auth.success && auth.user.id === postData.author?.id;

  // 승인된 참여자에게만 채팅방 입장 링크 제공 (스터디별 그룹챗 id 조회)
  let chatRoomId: number | null = null;
  if (participant?.status === "accepted") {
    const chatRes = await queryStudyChatRoom(supabase, postData.study.id);
    chatRoomId = chatRes.ok ? chatRes.value.id : null;
  }

  return <SidebarSection postData={postData} participant={participant} isOwner={isOwner} chatRoomId={chatRoomId} />;
}