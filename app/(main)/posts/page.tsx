import { PostsListSkeleton } from "@/shared/ui/skeleton";
import { RetryButton } from "@/shared/ui/RetryButton";
import { queryAllPosts } from "@/entities/post";
import { createClient } from "@/shared/api/supabase/server";
import { HeaderSection, MainSection } from "@/widgets/post";
import { FileQuestion } from "lucide-react";
import { Suspense } from "react";

export default async function PostsPage(
  {searchParams}: {searchParams: Promise<{ [key: string]: string | string[] | undefined }>}
) {
  const resolvedParams = await searchParams
  const search = resolvedParams.search
  const category = resolvedParams.category
  return (
      <div className="min-h-screen flex flex-col bg-paper">
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
  // 로드 실패는 "없음"(404)이 아니라 일시적 오류 — 제자리 인라인 안내 + 재시도로 처리.
  if (!allPosts.ok) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-paper-line py-16 text-center">
          <FileQuestion className="w-10 h-10 text-ink-soft" />
          <p className="text-ink-soft">
            스터디 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
          <RetryButton />
        </div>
      </section>
    )
  }
  return <MainSection allPosts={allPosts.value} search={search as string} initialCategory={category} />
}