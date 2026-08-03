import { queryPostDetail } from "@/entities/post";
import { queryMyStudies } from "@/entities/study";
import { PostUpdateForm } from "@/features/post/edit";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { Card } from "@/shared/shadcn/ui/card";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostEditPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient();
  const postDataResult = await queryPostDetail(supabase, Number(id));

  if (!postDataResult.ok) notFound();
  const postData = postDataResult.value;

  const { user } = await CustomUserAuth(supabase);
  const studiesPromise = queryMyStudies(supabase, user.id).then((res) => {
    if (!res.ok) notFound();
    return res.value;
  });

  return (
     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Study Mate</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">함께 성장하는 스터디 문화</p>
        </div>

        <Card className="p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">모집글 수정</h2>

          <PostUpdateForm postData={postData} studiesPromise={studiesPromise} />
        </Card>
      </div>
    </div>
  )
}
