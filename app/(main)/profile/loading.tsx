import { Skeleton } from "@/shared/ui/skeleton"
import { Card } from "@/shared/shadcn/ui/card"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">

      <main className="flex-1">
        {/* 프로필 헤더 스켈레톤 */}
        <section className="border-b border-border bg-gradient-to-br from-primary/5 to-muted/40 py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8">
              {/* 아바타 스켈레톤 */}
              <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />

              <div className="flex-1 mt-4 sm:mt-0">
                {/* 이름, 이메일, 배지 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <Skeleton className="h-9 w-32 mb-2" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* 소개글 */}
                <Skeleton className="h-5 w-3/4 mb-4" />

                {/* 통계 카드 */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>

                {/* 버튼들 */}
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 탭 컨텐츠 스켈레톤 */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* 탭 리스트 */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-md" />
              ))}
            </div>

            {/* 탭 컨텐츠 - 카드 리스트 */}
            <div className="space-y-6">
              <Card className="p-6">
                <Skeleton className="h-7 w-32 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <Skeleton className="h-7 w-32 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}
