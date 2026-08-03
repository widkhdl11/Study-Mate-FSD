'use client'

import { LoginForm } from '@/features/auth/login'
import { Card } from '@/shared/shadcn/ui/card'
import Link from 'next/link'

export default function LoginCard() {
    
    return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/30 to-background px-4'>
            <div className='w-full max-w-md'>
                {/* 로고 및 제목 */}
                <div className='mb-8 text-center'>
                    <div className='mb-4 flex items-center justify-center'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary'>
                            <span className='text-lg font-bold text-white'>
                                S
                            </span>
                        </div>
                    </div>
                    <h1 className='text-3xl font-bold text-foreground'>
                        Study Mate
                    </h1>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        함께 성장하는 스터디 문화
                    </p>
                </div>

                {/* 로그인 폼 카드 */}
                <Card className='p-6'>
                    <h2 className='mb-6 text-xl font-semibold text-foreground'>
                        로그인
                    </h2>

                    <LoginForm />
                </Card>

                {/* 회원가입 링크 */}
                <div className='mt-6 text-center'>
                    <p className='text-sm text-muted-foreground'>
                        아직 회원이 아니신가요?{' '}
                        <Link
                            href='/auth/signup'
                            className='font-semibold text-primary hover:text-primary/80'>
                            회원가입하기
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
