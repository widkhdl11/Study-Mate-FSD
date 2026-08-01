
import { PostDetailMainSkeleton, PostDetailSidebarSkeleton } from "@/shared/ui/skeleton";
import { PostDetailView, PostWithRelationResponse, PostImageSection } from "@/entities/post";
import { Suspense } from "react";
import RelationSection from "./RelationSection";

interface PostDetailWidgetProps {
  postData: PostDetailView;
  relatedPosts: PostWithRelationResponse[];
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