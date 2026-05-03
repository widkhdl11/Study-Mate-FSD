import { checkParticipantStatusSSR } from "@/actions/participantAction";
import { getPostDetailSSR } from "@/actions/postAction";
import { getMyProfileSSR } from "@/actions/profileAction";
import PostImageSection from "@/components/common/PostImageSection";
import MainSection from "@/components/posts/detail/MainSection";
import RelationSection from "@/components/posts/detail/RelationSection";
import SidebarSection from "@/components/posts/detail/SidebarSection";
import { PostDetailMainSkeleton, PostDetailSidebarSkeleton } from "@/components/skeleton";
import { PostDetailResponse, PostsResponse } from "@/types/postType";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const postData = await getPostDetailSSR(Number(id));
  if (!postData) {
    notFound()
  }
  const relatedPosts: PostsResponse = [];
  
  return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PostImageSection postData={postData} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Suspense fallback={<PostDetailMainSkeleton />}>
              <MainSectionLoader postData={postData} />
            </Suspense>
            <Suspense fallback={<PostDetailSidebarSkeleton />}>
              <SidebarSectionLoader postData={postData} />
            </Suspense>
          </div>
          <Suspense fallback={null}>  
          {relatedPosts.length > 0 && (
            <RelationSection relatedPosts={relatedPosts} />
          )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
async function MainSectionLoader({ postData }: { postData: PostDetailResponse }) {
  const user = await getMyProfileSSR();
  return <MainSection postData={postData} user={user} />;
}
async function SidebarSectionLoader({ postData }: { postData: PostDetailResponse }) {
  const participant = await checkParticipantStatusSSR(postData.study.id);
  return <SidebarSection postData={postData} participant={participant} />;
}