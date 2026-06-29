import { getMyProfileSSR } from "@/actions/profileAction";
import MainSection from "@/components/posts/detail/MainSection";
import { getParticipantStatus } from "@/entities/participant/api/query/getParticipantStatus";
import { queryPostDetail } from "@/entities/post/api/query/postDetail/queryPostDetail";
import { PostDetailView } from "@/entities/post/api/query/postDetail/view";
import { PostsResponse } from "@/entities/post/model/types";
import PostDetailWidget from "@/widgets/post/detail/PostDetailWidget";
import SidebarSection from "@/widgets/post/detail/sidebar/ui/SidebarSection";
import { notFound } from "next/navigation";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const postData = await queryPostDetail(Number(id));
  if (!postData.ok) {
    notFound()
  }
  const relatedPosts: PostsResponse = [];

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
  const user = await getMyProfileSSR();
  return <MainSection postData={postData} user={user} />;
}
async function SidebarSectionLoader({ postData }: { postData: PostDetailView }) {
  const result = await getParticipantStatus(postData.study.id);
  const participant = result.success ? result.data ?? null : null;
  return <SidebarSection postData={postData} participant={participant} />;
}