'use client'

import { ProfileResponse } from '@/entities/user'
import { useResetProfileImage, useUpdateProfileImage } from '@/features/profile/update'
import { getProfileImageUrl } from '@/shared/api/supabase/storage'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/shadcn/ui/avatar'
import { Button } from '@/shared/shadcn/ui/button'
import { Camera, Edit, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProfileSection({
    currentUser,
}: {
    currentUser: ProfileResponse
}) {
    const updateProfileImage = useUpdateProfileImage()
    const resetProfileImage = useResetProfileImage()
    const isUploading = updateProfileImage.isPending
    const isResetting = resetProfileImage.isPending
    const busy = isUploading || isResetting
    // 낙관적 프리뷰(blob URL 또는 기본 이미지 경로). null이면 서버 아바타를 보여준다.
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // 커스텀 이미지가 있을 때만 "기본 이미지로" 초기화를 노출한다.
    const hasCustomImage = previewUrl
        ? previewUrl !== '/default-profile.png'
        : !!currentUser?.avatarUrl

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const nextPreview = URL.createObjectURL(file)
        setPreviewUrl(nextPreview)
        updateProfileImage.mutate(file, {
            // 성공/실패 토스트는 훅이 담당. 여기선 실패 시 낙관적 프리뷰만 롤백한다.
            onError: () => {
                URL.revokeObjectURL(nextPreview)
                setPreviewUrl(null)
            },
        })
        e.target.value = '' // 같은 파일 재선택 허용
    }

    const handleReset = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
        resetProfileImage.mutate(undefined, {
            onSuccess: (res) => {
                // 서버 prop은 새로고침 전까진 안 바뀌므로 기본 이미지를 즉시 보여준다.
                if (res.success) setPreviewUrl('/default-profile.png')
            },
        })
    }

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    return (
        <section className='border-b-2 border-ink/10 bg-paper py-10'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:gap-8'>
                    <div className='shrink-0 flex flex-col items-center'>
                        {/* 아바타+카메라만 감싸는 relative — 카메라(absolute)가 아바타 박스에만 앵커되도록
                            (아래 "기본 이미지로" 버튼을 같은 relative에 두면 bottom-0이 버튼 위로 겹친다) */}
                        <div className='relative'>
                            <Avatar className='h-24 w-24 ring-2 ring-ink/15'>
                                <AvatarImage
                                    src={previewUrl ?? getProfileImageUrl(currentUser?.avatarUrl)}
                                    alt={currentUser.username || ''}
                                    width={96}
                                    height={96}
                                    fetchPriority='high'
                                />
                                <AvatarFallback className='bg-ink text-paper text-2xl font-bold'>
                                    {currentUser.username?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <label
                                htmlFor='profile-image-upload'
                                aria-disabled={busy}
                                className={`absolute bottom-0 right-0 bg-ink text-paper rounded-full p-2 shadow-soft transition-all ${
                                    busy
                                        ? 'opacity-70 pointer-events-none'
                                        : 'cursor-pointer hover:bg-ink/90 hover:scale-110'
                                }`}
                                title='프로필 이미지 변경'>
                                {isUploading ? (
                                    <Loader2 className='w-4 h-4 animate-spin' aria-hidden='true' />
                                ) : (
                                    <Camera className='w-4 h-4' aria-hidden='true' />
                                )}
                                <span className='sr-only'>
                                    {isUploading ? '이미지 업로드 중' : '프로필 이미지 변경'}
                                </span>
                            </label>

                            <input
                                id='profile-image-upload'
                                type='file'
                                accept='image/*'
                                aria-label='프로필 이미지 변경'
                                onChange={handleImageChange}
                                disabled={busy}
                                className='sr-only'
                            />
                        </div>

                        {hasCustomImage && (
                            <button
                                type='button'
                                onClick={handleReset}
                                disabled={busy}
                                className='mt-3 text-xs text-ink-soft hover:text-ink disabled:opacity-50 transition-colors'>
                                {isResetting ? '되돌리는 중...' : '기본 이미지로'}
                            </button>
                        )}
                    </div>

                    <div className='flex-1 mt-4 sm:mt-0'>
                        <div className='mb-4'>
                            <h1 className='font-heading text-3xl font-normal text-ink'>
                                {currentUser?.username || ''}
                            </h1>
                            <p className='text-ink-soft mt-1'>
                                {currentUser?.email || ''}
                            </p>
                        </div>

                        <p className='text-ink-soft mb-4'>
                            {currentUser.bio}
                        </p>

                        <div className='flex flex-wrap gap-3'>
                            <Link href='/profile/edit'>
                                <Button className='bg-ink text-paper hover:bg-ink/90 active:scale-[0.97] gap-2'>
                                    <Edit className='w-4 h-4' />
                                    프로필 수정
                                </Button>
                            </Link>
                            <Link href='/profile/password'>
                                <Button
                                    variant='outline'
                                    className='gap-2 border-2 border-ink/20 bg-transparent text-ink hover:bg-ink/5'>
                                    <Lock className='w-4 h-4' />
                                    비밀번호 변경
                                </Button>
                            </Link>
                           
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
