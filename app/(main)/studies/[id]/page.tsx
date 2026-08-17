import { StudyDetailSkeleton } from "@/shared/ui/skeleton";
import { queryStudyDetail } from "@/entities/study";
import { queryMyProfile } from "@/entities/user";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { HeaderSection, TabSection } from "@/widgets/study-detail";
import { notFound } from "next/navigation";
import { Suspense } from "react";


export default function StudyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<StudyDetailSkeleton />}>
      <StudyDetailLoader params={params} />
    </Suspense>
  );
}

async function StudyDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const result = await queryStudyDetail(supabase, Number(id)) 
  if (!result.ok) notFound()

  const study = result.value
  const { user: authUser } = await CustomUserAuth(supabase);
  const user = await queryMyProfile(supabase, authUser.id);
  if (!user.ok) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <main className="flex-1">
        <HeaderSection study={study} currentUserId={user.value.id} />
        <TabSection study={study} user={user.value} />
     </main>
    </div>
  )
}
