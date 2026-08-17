import { queryAllPosts, PostWithStudyView, PostCard } from "@/entities/post"
import { createClient } from "@/shared/api/supabase/server"
import { Button } from "@/shared/shadcn/ui/button"
import { RetryButton } from "@/shared/ui/RetryButton"
import { FileQuestion } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const PREVIEW_COUNT = 6


function SectionShell({ children }: { children: React.ReactNode }) {
    return (
        <section className='bg-paper px-4 py-16 text-ink sm:px-6 md:py-20 lg:px-8'>
            <div className='max-w-7xl mx-auto space-y-8'>
                <div className='space-y-2'>
                    <h2 className='font-heading text-3xl md:text-4xl font-normal text-ink'>
                        <span className='hl-mark'>최신</span> 모집글
                    </h2>
                    <p className='text-ink-soft'>
                        최근 올라온 스터디를 둘러보세요
                    </p>
                </div>
                {children}
            </div>
        </section>
    )
}

export default async function LatestSection() {
    const supabase = await createClient()
    const postsData = await queryAllPosts(supabase)

    // 쿼리 실패: 홈 전체를 404로 만들지 않고 섹션 내부에서 은은히 안내
    if (!postsData.ok) {
        return (
            <SectionShell>
                <div className='flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-paper-line py-16 text-center'>
                    <FileQuestion className='w-10 h-10 text-ink-soft' />
                    <p className='text-ink-soft'>
                        모집글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
                    </p>
                    <RetryButton />
                </div>
            </SectionShell>
        )
    }

    const posts = postsData.value ?? []
    // 홈은 프리뷰만 — 전량 렌더 금지(스켈레톤 6개·"더 보기" CTA와 일치). 전체 목록은 /posts.
    const previewPosts = posts.slice(0, PREVIEW_COUNT)

    // 빈 상태: 첫 스터디 개설 유도 CTA
    if (posts.length === 0) {
        return (
            <SectionShell>
                <div className='flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-paper-line py-16 text-center'>
                    <Image
                        src='/empty-study-state.png'
                        alt=''
                        width={200}
                        height={200}
                        className='h-40 w-40 object-contain'
                    />
                    <div className='space-y-1'>
                        <p className='font-bold text-ink'>
                            아직 모집 중인 스터디가 없어요
                        </p>
                        <p className='text-sm text-ink-soft'>
                            첫 스터디를 만들어 동료를 모아보세요
                        </p>
                    </div>
                    <Link href='/studies/create'>
                        <Button
                            size='lg'
                            className='bg-ink text-paper hover:bg-ink/90 transition-transform active:scale-[0.96]'>
                            스터디 만들기
                        </Button>
                    </Link>
                </div>
            </SectionShell>
        )
    }

    return (
        <SectionShell>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {previewPosts.map((post: PostWithStudyView, index: number) => (
                    <Link key={post.id} href={`/posts/${post.id}`}>
                        <PostCard post={post} priority={index < 3} />
                    </Link>
                ))}
            </div>

            <div className='text-center pt-6'>
                <Link href='/posts'>
                    <Button
                        variant='outline'
                        size='lg'
                        className='border-2 border-ink text-ink hover:bg-ink/5 bg-transparent transition-transform active:scale-[0.96]'>
                        더 많은 모집글 보기 →
                    </Button>
                </Link>
            </div>
        </SectionShell>
    )
}
