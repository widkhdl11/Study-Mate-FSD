'use client'

import { useRouter } from 'next/navigation'

export default function CreateStudyButton({ isLoggedIn }: { isLoggedIn: boolean }) {
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
            className='text-foreground hover:text-accent transition-colors font-medium'>
            스터디 만들기
        </button>
    )
}
