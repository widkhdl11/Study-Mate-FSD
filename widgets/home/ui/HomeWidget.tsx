import { Suspense } from "react";
import HeroSection from "./HeroSection";
import LatestSection from "./LatestSection";


function LatestSectionSkeleton() {
    return (
        <section className='py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background'>
            <div className='max-w-7xl mx-auto space-y-8'>
                <div className='space-y-2'>
                    <div className='h-9 w-48 bg-muted animate-pulse rounded-md' />
                    <div className='h-5 w-64 bg-muted animate-pulse rounded-md' />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='rounded-xl border bg-card overflow-hidden'>
                            <div className='h-48 bg-muted animate-pulse' />
                            <div className='p-5 space-y-3'>
                                <div className='flex gap-2'>
                                    <div className='h-5 w-16 bg-muted animate-pulse rounded-full' />
                                    <div className='h-5 w-14 bg-muted animate-pulse rounded-full' />
                                </div>
                                <div className='h-6 w-3/4 bg-muted animate-pulse rounded-md' />
                                <div className='space-y-1.5'>
                                    <div className='h-4 w-full bg-muted animate-pulse rounded-md' />
                                    <div className='h-4 w-2/3 bg-muted animate-pulse rounded-md' />
                                </div>
                                <div className='flex items-center justify-between pt-2'>
                                    <div className='flex items-center gap-2'>
                                        <div className='h-6 w-6 bg-muted animate-pulse rounded-full' />
                                        <div className='h-4 w-16 bg-muted animate-pulse rounded-md' />
                                    </div>
                                    <div className='h-4 w-12 bg-muted animate-pulse rounded-md' />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='text-center pt-6'>
                    <div className='h-11 w-48 bg-muted animate-pulse rounded-md mx-auto' />
                </div>
            </div>
        </section>
    )
}
export default async function HomeWidget() {
    return (
        <div className='min-h-screen flex flex-col bg-background'>
            <main className='flex-1'>
                <HeroSection />
                <Suspense fallback={<LatestSectionSkeleton />}>
                    <LatestSection />
                </Suspense>
            </main>
        </div>
    )
}