import { getMyProfileSSR } from "@/actions/profileAction";
import { StudyDetailSkeleton } from "@/components/skeleton";
import { queryStudyDetail } from "@/entities/study";
import { createClient } from "@/shared/api/supabase/server";
import HeaderSection from "@/widgets/study/detail/header/ui/HeaderSection";
import TabSection from "@/widgets/study/detail/tabs/ui/TabSection";
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
  
  const user = await getMyProfileSSR();

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeaderSection study={study} currentUserId={user.id} />
        <TabSection study={study} user={user} />
     </main>
    </div>
  )
}
