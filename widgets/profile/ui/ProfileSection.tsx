'use client'

import { ProfileResponse } from '@/entities/user'
import { useUpdateProfileImage } from '@/features/profile/update'
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
    const isUploading = updateProfileImage.isPending
    // 낙관적 프리뷰(blob URL). null이면 서버 아바타를 보여준다.
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    return (
        <section className='border-b border-border bg-muted/30 py-10'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:gap-8'>
                    <div className='relative shrink-0'>
                        <Avatar className='h-24 w-24 ring-4 ring-primary/20'>
                            <AvatarImage
                                src={previewUrl ?? getProfileImageUrl(currentUser?.avatarUrl)}
                                alt={currentUser.username || ''}
                                width={96}
                                height={96}
                                fetchPriority='high'
                            />
                            <AvatarFallback className='bg-primary text-primary-foreground text-2xl font-bold'>
                                {currentUser.username?.[0]}
                            </AvatarFallback>
                        </Avatar>

                        <label
                            htmlFor='profile-image-upload'
                            aria-disabled={isUploading}
                            className={`absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-sm transition-all ${
                                isUploading
                                    ? 'opacity-70 pointer-events-none'
                                    : 'cursor-pointer hover:bg-primary/90 hover:scale-110'
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
                            disabled={isUploading}
                            className='sr-only'
                        />
                    </div>

                    <div className='flex-1 mt-4 sm:mt-0'>
                        <div className='mb-4'>
                            <h1 className='text-3xl font-bold text-foreground'>
                                {currentUser?.username || ''}
                            </h1>
                            <p className='text-muted-foreground mt-1'>
                                {currentUser?.email || ''}
                            </p>
                        </div>

                        <p className='text-muted-foreground mb-4'>
                            {currentUser.bio}
                        </p>

                        <div className='flex flex-wrap gap-3'>
                            <Link href='/profile/edit'>
                                <Button className='bg-primary hover:bg-primary/90 gap-2'>
                                    <Edit className='w-4 h-4' />
                                    프로필 수정
                                </Button>
                            </Link>
                            <Link href='/profile/password'>
                                <Button
                                    variant='outline'
                                    className='gap-2 bg-transparent'>
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
