'use client'

import { Button } from "@/shared/shadcn/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"


export default function SearchBox() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        if (pathname === '/posts') {
            setSearchInput(searchParams.get('search') ?? '')
        }
    }, [pathname, searchParams])

   

    const runSearch = () => {
        const search = searchInput.trim()
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
                    type='search'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
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
