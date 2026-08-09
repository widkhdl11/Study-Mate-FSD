'use client'

import { CurrentUserResponse } from '@/entities/user'
import { CreateStudyButton } from '@/features/study/create'
import { Button } from '@/shared/shadcn/ui/button'
import Link from 'next/link'
import SearchBox from './SearchBox'
import UserMenu from './UserMenu'

/**
 * 항상 솔리드 헤더 (Border-First).
 * 예전엔 홈의 어두운 풀블리드 히어로 위에서 투명 + 흰 크롬으로 떴다가 스크롤 시 솔리드로 전환했으나,
 * 히어로가 라이트(bg-secondary)로 재작성되면서 흰 글자가 밝은 배경에 묻혀 무의미해짐 → 통일.
 */
export default function HeaderClient({
    currentUser,
}: {
    currentUser: CurrentUserResponse | null
}) {
    return (
        <>
            <header className='fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-[69px]'>
                        <Link
                            href='/'
                            className='flex items-center gap-2 font-bold text-xl text-foreground transition-colors hover:text-accent'
                        >
                            <div className='w-8 h-8 rounded-md flex items-center justify-center text-lg font-bold leading-none bg-accent text-accent-foreground'>
                                S
                            </div>
                            Study Mate
                        </Link>

                        <nav className='hidden md:flex items-center gap-8'>
                            <Link
                                href='/posts'
                                className='font-medium text-foreground transition-colors hover:text-accent'
                            >
                                모집글
                            </Link>
                            <CreateStudyButton
                                isLoggedIn={!!currentUser}
                                className='text-foreground hover:text-accent'
                            />
                        </nav>

                        <div className='flex items-center gap-4'>
                            <SearchBox />

                            {currentUser ? (
                                <UserMenu user={currentUser} />
                            ) : (
                                <Button asChild>
                                    <Link href='/auth/login'>로그인</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* fixed 헤더 높이만큼 자리 확보 — 홈도 동일(더 이상 히어로가 헤더 뒤로 깔리지 않음) */}
            <div className='h-[69px]' />
        </>
    )
}
