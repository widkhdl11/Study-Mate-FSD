import { getImageUrl, getProfileImageUrl } from "@/shared/api/supabase/storage"
import { getRegionPath } from "@/shared/config/region"
import { getCategoryPath } from "@/shared/config/study-category"
import { studyStatusConversion } from "@/shared/lib/conversion/study"
import { ImageUrl } from "@/shared/lib/file"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Card } from "@/shared/shadcn/ui/card"
import { MapPin } from "lucide-react"
import Image from "next/image"

/**
 * 모집글 리치 카드가 실제로 소비하는 최소 구조 계약(구조적).
 * category/region은 화면에서 Number()로 강제하므로 string·number 양쪽을 받는다.
 */
export type StudyPostCardView = {
    id: number
    title: string
    content: string
    imageUrl: ImageUrl[]
    study: {
        studyCategory: string | number
        region: string | number
        status: string
        currentParticipants: number
        maxParticipants: number
    }
    author: {
        username: string
        avatarUrl: string | null
    }
}

// 플래너 월드 상태 태그 — 형광펜 코딩(모집중=민트, 마감=코랄, 그 외=잉크 약).
function statusClass(status: string): string {
    if (status === "recruiting") return "bg-hl-mint text-ink"
    if (status === "closed") return "bg-hl-coral text-ink"
    return "bg-ink/10 text-ink-soft"
}

export default function PostCard({
    post,
    priority = false,
}: {
    post: StudyPostCardView
    priority?: boolean
}) {
    const cur = post.study.currentParticipants
    const max = post.study.maxParticipants
    const pct = max > 0 ? Math.min(100, (cur / max) * 100) : 0

    return (
        <Card className='group flex h-full flex-col overflow-hidden gap-0 rounded-xl border-2 border-ink/15 bg-paper p-0 text-ink shadow-soft transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-ink/40 hover:shadow-lift'>
            {/* Thumbnail */}
            <div className='relative h-48 w-full overflow-hidden bg-paper-line'>
                <Image
                    // 실제 이미지만 스토리지 URL로. 없으면 로컬 폴백을 직접 쓴다.
                    src={post.imageUrl?.[0]?.url ? getImageUrl(post.imageUrl[0].url) : '/default-post-thumbnail.png'}
                    alt={post.title}
                    fill
                    priority={priority}
                    fetchPriority={priority ? 'high' : 'auto'}
                    sizes='(max-width: 640px) 100vw, 424px'
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
            </div>

            <div className='flex flex-1 flex-col space-y-4 p-5'>
                {/* 제목 + 내용 */}
                <div>
                    <h3 className='line-clamp-2 font-bold text-ink'>
                        {post.title}
                    </h3>
                    <p className='mt-1 line-clamp-2 text-sm text-ink-soft'>
                        {post.content}
                    </p>
                </div>

                {/* 카테고리 · 지역 · 상태 */}
                <div className='flex flex-wrap items-center gap-2 text-xs'>
                    {getCategoryPath(Number(post.study.studyCategory)).labels.map((category) => (
                        <span key={category} className='rounded-md bg-ink/5 px-2 py-0.5 font-medium text-ink'>
                            {category}
                        </span>
                    ))}
                    <span className='inline-flex items-center gap-0.5 rounded-md border border-ink/20 px-2 py-0.5 text-ink-soft'>
                        <MapPin className='h-3 w-3' />
                        {getRegionPath(Number(post.study.region)).labels.join(' ')}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 font-bold ${statusClass(post.study.status)}`}>
                        {studyStatusConversion(post.study.status)}
                    </span>
                </div>

                {/* 좌석(참여 인원) */}
                <div className='space-y-1 border-t-2 border-dashed border-paper-line pt-3'>
                    <div className='flex items-center justify-between text-xs'>
                        <span className='text-ink-soft'>남은 좌석</span>
                        <span className='font-bold tabular-nums text-ink'>
                            {cur}/{max}석
                        </span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-ink/10'>
                        <div
                            className='h-full rounded-full bg-hl-coral transition-[width] duration-300'
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>

                {/* 호스트 */}
                <div className='mt-auto flex items-center gap-2 border-t-2 border-dashed border-paper-line pt-3'>
                    <Avatar className='h-7 w-7'>
                        <AvatarImage
                            src={getProfileImageUrl(post.author.avatarUrl)}
                            alt={post.author.username}
                        />
                        <AvatarFallback className='bg-ink text-xs text-paper'>
                            {post.author.username[0] || ''}
                        </AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-medium text-ink'>
                        {post.author.username}
                    </span>
                </div>
            </div>
        </Card>
    )
}
