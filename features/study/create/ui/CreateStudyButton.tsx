'use client'

import { cn } from '@/shared/lib/cn'
import { useRouter } from 'next/navigation'

export default function CreateStudyButton({
    isLoggedIn,
    className,
}: {
    isLoggedIn: boolean
    className?: string
}) {
    const router = useRouter()

    const handleClick = () => {
        if (!isLoggedIn) {
            router.push('/auth/login')
            return
        }
        router.push('/studies/create')
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                'text-foreground hover:text-accent transition-colors font-medium',
                className
            )}>
            스터디 만들기
        </button>
    )
}
