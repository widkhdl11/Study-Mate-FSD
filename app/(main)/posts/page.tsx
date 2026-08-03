import { PostsListSkeleton } from "@/shared/ui/skeleton";
import { queryAllPosts } from "@/entities/post";
import { createClient } from "@/shared/api/supabase/server";
import { HeaderSection, MainSection } from "@/widgets/post";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function PostsPage(
  {searchParams}: {searchParams: Promise<{ [key: string]: string | string[] | undefined }>}
) {
  const resolvedParams = await searchParams
  const search = resolvedParams.search
  const category = resolvedParams.category
  return (
      <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeaderSection />
        <Suspense fallback={<PostsListSkeleton />}>
          <MainSectionLoader search={search as string} category={category as string} />
        </Suspense>
      </main>

    </div>
  );
}
async function MainSectionLoader({search, category}:
  {
    search: string
    category?: string
  }) {
  const supabase = await createClient()
  const allPosts = await queryAllPosts(supabase)
  if (!allPosts.ok) {
    notFound()
  }
  return <MainSection allPosts={allPosts.value} search={search as string} initialCategory={category} />
}