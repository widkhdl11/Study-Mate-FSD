'use client'

import { PostWithStudyView } from '@/entities/post'
import { getImageUrl, getProfileImageUrl } from '@/shared/api/supabase/storage'
import { getRegionPath } from '@/shared/config/region'
import { getCategoryPath } from '@/shared/config/study-category'
import { getStudyStatusColor, studyStatusConversion } from '@/shared/lib/conversion/study'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/shadcn/ui/avatar'
import { Badge } from '@/shared/shadcn/ui/badge'
import { Card } from '@/shared/shadcn/ui/card'
import Image from 'next/image'

export default function PostCard({
    post,
    priority = false,
}: {
    post: PostWithStudyView
    priority?: boolean
}) {
    return (
        <Card className='overflow-hidden transition-colors duration-300 h-full flex flex-col cursor-pointer hover:border-accent/50'>
            {/* Thumbnail Image */}
            <div className='relative w-full h-48 bg-muted overflow-hidden'>
                <Image
                    src={getImageUrl(
                        post.imageUrl?.[0]?.url ||
                            '/default-post-thumbnail.jpg'
                    )}
                    alt={post.title}
                    fill
                    priority={priority}
                    fetchPriority={priority ? "high" : "auto"}   
                    sizes="(max-width: 640px) 100vw, 424px"
                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                />
            </div>

            <div className='p-5 flex-1 flex flex-col space-y-4'>
                {/* Title + brief content */}
                <div>
                    <h3 className='font-semibold text-foreground line-clamp-2 hover:text-accent transition-colors'>
                        {post.title}
                    </h3>
                    <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                        {post.content}
                    </p>
                </div>

                {/* 핵심: 카테고리 · 지역 · 상태 */}
                <div className='flex flex-wrap items-center gap-2'>
                    {getCategoryPath(Number(post.study.studyCategory)).labels.map((category) => (
                        <Badge
                            key={category}
                            className='bg-muted text-muted-foreground border-0'>
                            {category}
                        </Badge>
                    ))}
                    <Badge variant='outline' className='text-xs'>
                        {getRegionPath(Number(post.study.region)).labels.join(' ')}
                    </Badge>
                    <Badge
                        className={`${getStudyStatusColor(post.study.status)} border-0 text-xs`}>
                        {studyStatusConversion(post.study.status)}
                    </Badge>
                </div>

                {/* 핵심: 참여 인원 */}
                <div className='space-y-1 border-t border-border pt-3'>
                    <div className='flex justify-between items-center text-xs'>
                        <span className='text-muted-foreground'>참여 인원</span>
                        <span className='font-semibold text-foreground tabular-nums'>
                            {post.study.currentParticipants}/{post.study.maxParticipants}
                        </span>
                    </div>
                    <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                        <div
                            className='h-full bg-accent rounded-full transition-[width] duration-300'
                            style={{
                                width: `${
                                    post.study.maxParticipants > 0
                                        ? Math.min(100, (post.study.currentParticipants / post.study.maxParticipants) * 100)
                                        : 0
                                }%`,
                            }}
                        />
                    </div>
                </div>

                {/* 호스트 */}
                <div className='flex items-center gap-2 border-t border-border pt-3 mt-auto'>
                    <Avatar className='h-7 w-7'>
                        <AvatarImage
                            src={getProfileImageUrl(post.author.avatarUrl)}
                            alt={post.author.username}
                        />
                        <AvatarFallback className='text-xs bg-primary text-primary-foreground'>
                            {post.author.username[0] || ''}
                        </AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-medium text-foreground'>
                        {post.author.username}
                    </span>
                </div>
            </div>
        </Card>
    )
}
