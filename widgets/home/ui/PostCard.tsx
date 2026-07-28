'use client'

import { PostWithStudyView } from '@/entities/post'
import { getImageUrl, getProfileImageUrl } from '@/shared/api/supabase/storage'
import { getRegionPath } from '@/shared/config/region'
import { getCategoryPath } from '@/shared/config/study-category'
import { studyStatusConversion } from '@/shared/lib/conversion/study'
import { formatTimeAgo } from '@/shared/lib/date'
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

        const getStatusColor = (status: string) => {
        switch (status) {
            case 'recruiting':
                return 'bg-success text-white'
            case 'closed':
                return 'bg-danger text-white'
            case 'pending':
                return 'bg-warning text-foreground'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            프론트엔드:
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            백엔드: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            AI: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            모바일: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            디자인: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        }
        return (
            colors[category] ||
            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        )
    }
    return (
        <Card className='overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer hover:border-accent/50'>
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
                {/* Post Title */}
                <div>
                    <h3 className='font-semibold text-foreground line-clamp-2 hover:text-accent transition-colors'>
                        {post.title}
                    </h3>
                    <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                        {post.content}
                    </p>
                </div>

                {/* Study Info Section */}
                <div className='space-y-3 border-t border-border pt-3'>
                    {/* Study Title */}
                    <div>
                        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                            스터디
                        </p>
                        <p className='font-medium text-foreground text-sm'>
                            {post.study.title}
                        </p>
                    </div>

                    {/* Category & Location */}
                    <div className='flex flex-wrap gap-2'>
                        {getCategoryPath(Number(post.study.studyCategory)).labels.map((category) => (
                            <Badge
                                key={category}
                                className={`${getCategoryColor(category)} border-0`}>
                                {category}
                            </Badge>
                        ))}
                        <Badge variant='outline' className='text-xs'>
                            {getRegionPath(Number(post.study.region)).labels.map((region) => (
                                <span key={region}>{region}</span>
                            ))}
                        </Badge>
                    </div>

                    {/* Participants Progress */}
                    <div className='space-y-1'>
                        <div className='flex justify-between items-center text-xs'>
                            <span className='text-muted-foreground'>
                                참여 인원
                            </span>
                            <span className='font-semibold text-foreground'>
                                {post.study.currentParticipants}/
                                {post.study.maxParticipants}
                            </span>
                        </div>
                        <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                            <div
                                className='h-full bg-accent rounded-full transition-all duration-300'
                                style={{
                                    width: `${(post.study.currentParticipants / post.study.maxParticipants) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Meeting Date & Status */}
                    <div className='flex justify-between items-center'>
                        <span className='text-xs text-muted-foreground'>
                            {post.study.createdAt}
                        </span>
                        <Badge
                            className={`${getStatusColor(post.study.status)} border-0 text-xs`}>
                            {studyStatusConversion(post.study.status) }
                        </Badge>
                    </div>
                </div>

                {/* Author Info */}
                <div className='flex items-center gap-2 border-t border-border pt-3'>
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

                {/* Engagement & Time */}
                <div className='flex justify-between items-center text-xs text-muted-foreground'>
                    <div className='flex gap-3'>
                        <span>👍 {post.likesCount}</span>
                        <span>👁 {post.viewsCount}</span>
                    </div>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
            </div>
        </Card>
    )
}
