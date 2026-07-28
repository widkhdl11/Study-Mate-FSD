import { PostsListSkeleton } from "@/components/skeleton";
import { queryAllPosts } from "@/entities/post";
import { createClient } from "@/shared/api/supabase/server";
import { HeaderSection, MainSection } from "@/widgets/post";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function PostsPage(
  {searchParams}: {searchParams: Promise<{ [key: string]: string | string[] | undefined }>}
) {
  const search = (await searchParams).search
  return (
      <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeaderSection />
        <Suspense fallback={<PostsListSkeleton />}>
          <MainSectionLoader search={search as string} />
        </Suspense>
      </main>
    
    </div>
  );
}
async function MainSectionLoader({search}: 
  {
    search: string
  }) {
  const supabase = await createClient()
  const allPosts = await queryAllPosts(supabase)
  if (!allPosts.ok) {
    notFound()
  }
  return <MainSection allPosts={allPosts.value} search={search as string} />
}