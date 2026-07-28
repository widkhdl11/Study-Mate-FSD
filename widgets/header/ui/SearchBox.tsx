'use client'

import { Button } from "@/shared/shadcn/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useRef } from "react"


export default function SearchBox() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const inputRef = useRef<HTMLInputElement>(null)

    // /posts일 때만 URL 검색어를 반영(그 외엔 빈칸). key/defaultValue로 URL이 바뀌면
    // input이 새로 만들어지며(remount) 값이 리셋됨 → effect로 state 복사할 필요 없음.
    const urlSearch = pathname === '/posts' ? (searchParams.get('search') ?? '') : ''

    const runSearch = () => {
        const search = (inputRef.current?.value ?? '').trim()
        if (search) {
            router.push(`/posts?search=${encodeURIComponent(search)}`)
        } else {
            router.push('/posts')
        }
    }
    return (
            <div className='hidden lg:flex items-center gap-1 bg-muted rounded-lg px-2 py-1.5 w-72'>
                <span className='text-muted-foreground pl-1 shrink-0'>
                    🔍
                </span>
                <input
                    key={urlSearch}
                    ref={inputRef}
                    type='search'
                    defaultValue={urlSearch}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            runSearch()
                        }
                    }}
                    placeholder='스터디·모집글 검색...'
                    className='bg-muted text-foreground placeholder-muted-foreground outline-none flex-1 min-w-0 text-sm'
                    aria-label='검색어'
                />
                <Button
                    type='button'
                    size='sm'
                    variant='secondary'
                    className='h-8 shrink-0'
                    onClick={runSearch}>
                    검색
                </Button>
            </div>
    );
}
