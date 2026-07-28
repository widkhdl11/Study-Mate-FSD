'use client'

import { ProfileResponse } from '@/entities/user'
import { useUpdateProfileImage } from '@/features/profile/update'
import { getProfileImageUrl } from '@/shared/api/supabase/storage'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/shadcn/ui/avatar'
import { Badge } from '@/shared/shadcn/ui/badge'
import { Button } from '@/shared/shadcn/ui/button'
import { Edit, Lock, Settings } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProfileSection({
    currentUser,
}: {
    currentUser: ProfileResponse
}) {
    const updateProfileImage = useUpdateProfileImage()
    const [profileImage, setProfileImage] = useState(
        currentUser?.avatarUrl || '/placeholder.svg'
    )

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        setProfileImage(previewUrl)
        updateProfileImage.mutate(file)
    }

    useEffect(() => {
        return () => {
            if (profileImage && profileImage.startsWith('blob:')) {
                URL.revokeObjectURL(profileImage)
            }
        }
    }, [profileImage])

    return (
        <section className='border-b border-border bg-linear-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 py-10'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:gap-8'>
                    <div className='relative shrink-0'>
                        <Avatar className='h-24 w-24 ring-4 ring-primary/20'>
                            <AvatarImage
                                src={getProfileImageUrl(currentUser?.avatarUrl)}
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
                            className='absolute bottom-0 right-0 bg-gray-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all hover:scale-110'
                            title='프로필 이미지 변경'>
                            <Settings className='w-4 h-4' />
                        </label>

                        <input
                            id='profile-image-upload'
                            type='file'
                            accept='image/*'
                            onChange={handleImageChange}
                            className='sr-only'
                        />
                    </div>

                    <div className='flex-1 mt-4 sm:mt-0'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
                            <div>
                                <h1 className='text-3xl font-bold text-foreground'>
                                    {currentUser?.username || ''}
                                </h1>
                                <p className='text-muted-foreground mt-1'>
                                    {currentUser?.email || ''}
                                </p>
                            </div>
                            <Badge className='bg-blue-600 text-white w-fit'>
                                {currentUser?.points || ''}
                            </Badge>
                        </div>

                        <p className='text-muted-foreground mb-4'>
                            {currentUser.bio}
                        </p>

                        <div className='flex flex-wrap gap-3'>
                            <Link href='/profile/edit'>
                                <Button className='bg-blue-600 hover:bg-blue-700 gap-2'>
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
