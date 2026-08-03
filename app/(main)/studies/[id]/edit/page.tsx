import { FormSkeleton } from "@/shared/ui/skeleton";
import { queryStudyEditView } from "@/entities/study";
import { StudyEditFormValues, StudyEditForm } from "@/features/study/edit";
import { createClient } from "@/shared/api/supabase/server";
import { getRegionPathByValue } from "@/shared/config/region";
import { getCategoryPathByValue } from "@/shared/config/study-category";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function StudyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <StudyEditLoader params={params} />
    </Suspense>
  );
}
async function StudyEditLoader({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;
  const supabase = await createClient();
  const result = await queryStudyEditView(supabase, Number(id));
  if (!result.ok) notFound();

  const study = result.value;

  const categoryPath = getCategoryPathByValue(study.studyCategory);
  const [mainCategory, subCategory, detailCategory] = categoryPath.values;

  let detailRegion = "";
  let mainRegion = "";

  if (study.region === "ONLINE") {
    mainRegion = "ONLINE";
  } else {
    const regionPath = getRegionPathByValue(study.region);
    [mainRegion, detailRegion] = regionPath.values;
  }

  const initialData: StudyEditFormValues = {
    id: study.id,
    creatorId: study.creatorId,
    title: study.title,
    description: study.description,
    studyCategory: study.studyCategory,
    region: study.region,
    currentParticipants: study.currentParticipants,
    maxParticipants: study.maxParticipants,
    status: study.status,
    createdAt: study.createdAt,
    updatedAt: study.updatedAt,
    mainCategory,
    subCategory,
    detailCategory,
    mainRegion,
    detailRegion: detailRegion || "",
  };

  return (
     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Study Mate
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            함께 성장하는 스터디 문화
          </p>
        </div>
        <StudyEditForm initialData={initialData} studyId={id} />

      </div>
    </div>
  )
}
