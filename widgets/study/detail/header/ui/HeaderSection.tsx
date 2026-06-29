'use client'
import { StudyCapacityBar, StudyCategoryBadges, StudyDetailView, StudyRegionLabel, StudyStatusBadge } from "@/entities/study";
import { getCategoryPathByValue } from "@/shared/config/study-category";
import { Button } from "@/shared/shadcn/ui/button";
import StudyOwnerActions from "@/widgets/study/detail/owner-actions/ui/StudyOwnerActions";
import { PlusCircle, Users } from "lucide-react";
import Link from "next/link";


export default function HeaderSection(
    {
      study,
      currentUserId,
    }: {
      study: StudyDetailView
      currentUserId?: string | null
    }) {
    // const categoryPath = getCategoryPath(Number(study.study_category));
    const categoryPath = getCategoryPathByValue(study.studyCategory);

    return (
         <section className="border-b border-border bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4">
                {/* 뒤로가기 */}
                <Link
                  href="/profile?tab=studies"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← 내 정보로 돌아가기
                </Link>

                {/* 스터디 제목 및 배지 */}
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">
                    {study?.title}
                  </h1>
                  <StudyStatusBadge status={study.status}/>
                </div>

                {/* 카테고리 및 위치 */}
                <div className="flex items-center gap-3">
                  <StudyCategoryBadges categoryPath={categoryPath} />
                  <StudyRegionLabel region={study.region} />
                </div>

                {/* 모임 정보 */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {study.currentParticipants}/
                    {study.maxParticipants}명
                  </span>
                </div>
              </div>

              {/* 액션 버튼 영역 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/posts/create?study_id=${study.id}`}>
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 gap-2">
                    <PlusCircle className="w-4 h-4" />
                    모집글 작성
                  </Button>
                </Link>
                {currentUserId === study.creator?.id && (
                  <StudyOwnerActions studyId={study.id} />
                )}
              </div>
            </div>

            {/* 참여 인원 진행률 */}
            <div className="mt-6 max-w-md">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted-foreground">참여 인원</span>
                <span className="font-semibold text-foreground">
                  {study.currentParticipants}/{study.maxParticipants}명
                </span>
              </div>
              <StudyCapacityBar current={study.currentParticipants} max={study.maxParticipants} />
            </div>
          </div>
        </section>
    )
}