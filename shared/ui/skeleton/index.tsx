export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-muted animate-pulse rounded ${className}`} />
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 페이지 제목 */}
      <Skeleton className="h-8 w-48" />
      
      {/* 설명 텍스트 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* 카드들 */}
      <div className="grid gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

// ─── Header ───

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Posts 목록 ───

export function PostsListSkeleton() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-card p-5 space-y-5">
                <Skeleton className="h-6 w-20" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-5 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

// ─── Post 상세 ───

export function PostDetailMainSkeleton() {
  return (
    <div className="lg:col-span-2 space-y-4">
      <Skeleton className="h-9 w-3/4" />
      <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function PostDetailSidebarSkeleton() {
  return (
    <div className="lg:col-span-1">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

// ─── Study 상세 ───

export function StudyDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
        <div className="p-6 border rounded-lg space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat ───

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-end gap-2 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className={`h-12 rounded-xl ${i % 2 === 0 ? "w-48" : "w-64"}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

// ─── Form (Create / Edit 공통) ───

export function FormSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-lg mx-auto" />
          <Skeleton className="h-8 w-36 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div className="p-6 md:p-8 border rounded-xl space-y-6">
          <Skeleton className="h-7 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

// 스피너/스켈레톤
export function StudySelectSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
    </div>
  );
}


export function TabSectionSkeleton() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-md" />
          ))}
        </div>
        <div className="p-6 border rounded-lg space-y-4">
          <Skeleton className="h-7 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
