import PostImageSection from "@/components/common/PostImageSection";
import RelationSection from "@/components/posts/detail/RelationSection";
import { PostDetailMainSkeleton, PostDetailSidebarSkeleton } from "@/components/skeleton";
import { PostDetailView } from "@/entities/post/api/query/postDetail/view";
import { PostsResponse } from "@/entities/post/model/types";
import { Suspense } from "react";

interface PostDetailWidgetProps {
  postData: PostDetailView;
  relatedPosts: PostsResponse;
  MainSectionSlot: React.ReactNode;
  SidebarSectionSlot: React.ReactNode;
}

export default function PostDetailWidget({ postData, relatedPosts, MainSectionSlot, SidebarSectionSlot }: PostDetailWidgetProps) {
  return (
     <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PostImageSection postData={postData} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Suspense fallback={<PostDetailMainSkeleton />}>
              {MainSectionSlot}
            </Suspense>
            <Suspense fallback={<PostDetailSidebarSkeleton />}>
              {SidebarSectionSlot}
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
  )
}