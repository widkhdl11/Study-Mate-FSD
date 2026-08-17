import { Suspense } from "react";
import ActivitySummary from "./ActivitySummary";
import CategorySection from "./CategorySection";
import HeroSection, { HeroSectionSkeleton } from "./HeroSection";
import LatestSection from "./LatestSection";


function LatestSectionSkeleton() {
    return (
        <section className='bg-paper px-4 py-16 sm:px-6 md:py-20 lg:px-8'>
            <div className='max-w-7xl mx-auto space-y-8'>
                <div className='space-y-2'>
                    <div className='h-9 w-48 bg-paper-line animate-pulse rounded-md' />
                    <div className='h-5 w-64 bg-paper-line animate-pulse rounded-md' />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='rounded-xl border-2 border-ink/15 bg-paper overflow-hidden'>
                            <div className='h-48 bg-paper-line animate-pulse' />
                            <div className='p-5 space-y-3'>
                                <div className='flex gap-2'>
                                    <div className='h-5 w-16 bg-paper-line animate-pulse rounded-md' />
                                    <div className='h-5 w-14 bg-paper-line animate-pulse rounded-md' />
                                </div>
                                <div className='h-6 w-3/4 bg-paper-line animate-pulse rounded-md' />
                                <div className='space-y-1.5'>
                                    <div className='h-4 w-full bg-paper-line animate-pulse rounded-md' />
                                    <div className='h-4 w-2/3 bg-paper-line animate-pulse rounded-md' />
                                </div>
                                <div className='flex items-center justify-between pt-2'>
                                    <div className='flex items-center gap-2'>
                                        <div className='h-6 w-6 bg-paper-line animate-pulse rounded-full' />
                                        <div className='h-4 w-16 bg-paper-line animate-pulse rounded-md' />
                                    </div>
                                    <div className='h-4 w-12 bg-paper-line animate-pulse rounded-md' />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='text-center pt-6'>
                    <div className='h-11 w-48 bg-paper-line animate-pulse rounded-md mx-auto' />
                </div>
            </div>
        </section>
    )
}
export default async function HomeWidget() {
    return (
        <div className='min-h-screen flex flex-col bg-paper'>
            <main className='flex-1'>
                {/* 개인화 인사말은 auth 왕복이 필요 — Suspense로 히어로만 스트리밍해 나머지 홈 페인트를 막지 않는다 */}
                <Suspense fallback={<HeroSectionSkeleton />}>
                    <HeroSection />
                </Suspense>
                {/* 로그인 유저 활동 요약(비로그인·무활동이면 null). auth 왕복이 홈 페인트를 막지 않도록 스트리밍 */}
                <Suspense fallback={null}>
                    <ActivitySummary />
                </Suspense>
                <CategorySection />
                <Suspense fallback={<LatestSectionSkeleton />}>
                    <LatestSection />
                </Suspense>
            </main>
        </div>
    )
}