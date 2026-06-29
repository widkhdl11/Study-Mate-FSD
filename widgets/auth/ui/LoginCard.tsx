'use client'

import LoginForm from '@/features/auth/login/ui/LoginForm'
import { Card } from '@/shared/shadcn/ui/card'
import Link from 'next/link'

export default function LoginCard() {
    

    return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4'>
            <div className='w-full max-w-md'>
                {/* 로고 및 제목 */}
                <div className='mb-8 text-center'>
                    <div className='mb-4 flex items-center justify-center'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600'>
                            <span className='text-lg font-bold text-white'>
                                S
                            </span>
                        </div>
                    </div>
                    <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
                        Study Mate
                    </h1>
                    <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
                        함께 성장하는 스터디 문화
                    </p>
                </div>

                {/* 로그인 폼 카드 */}
                <Card className='p-6'>
                    <h2 className='mb-6 text-xl font-semibold text-slate-900 dark:text-white'>
                        로그인
                    </h2>

                    <LoginForm />
                </Card>

                {/* 회원가입 링크 */}
                <div className='mt-6 text-center'>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>
                        아직 회원이 아니신가요?{' '}
                        <Link
                            href='/auth/signup'
                            className='font-semibold text-blue-600 hover:text-blue-700'>
                            회원가입하기
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
