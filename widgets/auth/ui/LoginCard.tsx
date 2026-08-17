'use client'

import { LoginForm } from '@/features/auth/login'
import { Card } from '@/shared/shadcn/ui/card'
import Link from 'next/link'

export default function LoginCard() {
    
    return (
        <div className='flex min-h-screen items-center justify-center bg-paper px-4'>
            <div className='w-full max-w-md'>
                {/* 로고 및 제목 */}
                <div className='mb-8 text-center'>
                    <div className='mb-4 flex items-center justify-center'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-ink'>
                            <span className='text-lg font-bold text-paper'>
                                S
                            </span>
                        </div>
                    </div>
                    <h1 className='font-heading text-3xl font-normal text-ink'>
                        Study Mate
                    </h1>
                    <p className='mt-2 text-sm text-ink-soft'>
                        함께 성장하는 스터디 문화
                    </p>
                </div>

                {/* 로그인 폼 카드 */}
                <Card className='bg-paper border-2 border-ink/15 shadow-soft p-6'>
                    <h2 className='mb-6 font-heading text-xl font-normal text-ink'>
                        로그인
                    </h2>

                    <LoginForm />
                </Card>

                {/* 회원가입 링크 */}
                <div className='mt-6 text-center'>
                    <p className='text-sm text-ink-soft'>
                        아직 회원이 아니신가요?{' '}
                        <Link
                            href='/auth/signup'
                            className='font-semibold text-ink hover:text-ink/60'>
                            회원가입하기
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
