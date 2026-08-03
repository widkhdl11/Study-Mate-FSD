'use client'

import { CurrentUserResponse } from '@/entities/user'
import { CreateStudyButton } from '@/features/study/create'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/shadcn/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HeaderChromeContext } from '../model/chrome'
import SearchBox from './SearchBox'
import UserMenu from './UserMenu'

/**
 * 케빈스룸 디자인 언어: 홈 히어로 위에서는 투명(흰 크롬) → 스크롤 시 흰 배경으로 전환.
 * 홈이 아닌 페이지는 항상 솔리드이며, fixed 헤더가 콘텐츠를 가리지 않도록 스페이서로 자리 확보.
 */
export default function HeaderClient({
    currentUser,
}: {
    currentUser: CurrentUserResponse | null
}) {
    const pathname = usePathname()
    const isHome = pathname === '/'
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        if (!isHome) return
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll() // 새로고침 시 현재 스크롤 위치 반영
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [isHome])

    const transparent = isHome && !scrolled

    return (
        <HeaderChromeContext.Provider value={{ transparent }}>
            <header
                className={cn(
                    'fixed top-0 z-50 w-full transition-colors duration-300',
                    transparent
                        ? 'bg-transparent'
                        : 'border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
                )}
            >
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-[69px]'>
                        <Link
                            href='/'
                            className={cn(
                                'flex items-center gap-2 font-bold text-xl transition-colors',
                                transparent
                                    ? 'text-white hover:text-white/80'
                                    : 'text-foreground hover:text-accent'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors',
                                    transparent
                                        ? 'bg-white/20 text-white'
                                        : 'bg-accent text-accent-foreground'
                                )}
                            >
                                📚
                            </div>
                            Study Mate
                        </Link>

                        <nav className='hidden md:flex items-center gap-8'>
                            <Link
                                href='/posts'
                                className={cn(
                                    'transition-colors font-medium',
                                    transparent
                                        ? 'text-white/90 hover:text-white'
                                        : 'text-foreground hover:text-accent'
                                )}
                            >
                                모집글
                            </Link>
                            <CreateStudyButton
                                isLoggedIn={!!currentUser}
                                className={cn(
                                    transparent
                                        ? 'text-white/90 hover:text-white'
                                        : 'text-foreground hover:text-accent'
                                )}
                            />
                        </nav>

                        <div className='flex items-center gap-4'>
                            <SearchBox />

                            {currentUser ? (
                                <UserMenu user={currentUser} />
                            ) : (
                                <Button
                                    asChild
                                    className={cn(
                                        transparent &&
                                            'bg-white text-primary hover:bg-white/90'
                                    )}
                                >
                                    <Link href='/auth/login'>로그인</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* 홈이 아닐 때만 fixed 헤더 높이만큼 자리 확보 (홈은 히어로가 뒤로 깔림) */}
            {!isHome && <div className='h-[69px]' />}
        </HeaderChromeContext.Provider>
    )
}
