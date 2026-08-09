import { queryPostsCount } from "@/entities/post"
import { queryRecruitingStudiesCount } from "@/entities/study"
import { queryMembersCount } from "@/entities/user"
import { createClient } from "@/shared/api/supabase/server"

function formatCount(n: number) {
    return n.toLocaleString("ko-KR")
}

// 홈 히어로 실데이터 스탯. 스탯별로 독립 폴백('—')이라 한 쿼리 실패가 나머지를 막지 않음.
export default async function HeroStats() {
    const supabase = await createClient()
    const [studies, posts, members] = await Promise.all([
        queryRecruitingStudiesCount(supabase),
        queryPostsCount(supabase),
        queryMembersCount(supabase),
    ])

    const stats = [
        { value: studies.ok ? formatCount(studies.value) : "—", label: "모집 중 스터디" },
        { value: posts.ok ? formatCount(posts.value) : "—", label: "누적 모집글" },
        { value: members.ok ? formatCount(members.value) : "—", label: "멤버" },
    ]

    return (
        <div className="grid grid-cols-3 gap-6 border-t border-border pt-6">
            {stats.map((s) => (
                <div key={s.label} className="text-center lg:text-left space-y-1">
                    <div className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
                        {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
            ))}
        </div>
    )
}

// Suspense 폴백: 카운트가 스트리밍될 때까지 히어로 페인트를 막지 않도록 스켈레톤.
export function HeroStatsSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-6 border-t border-border pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center lg:text-left space-y-1">
                    <div className="h-9 md:h-10 w-20 bg-muted rounded-md animate-pulse mx-auto lg:mx-0" />
                    <div className="h-4 w-16 bg-muted rounded-md animate-pulse mx-auto lg:mx-0" />
                </div>
            ))}
        </div>
    )
}
