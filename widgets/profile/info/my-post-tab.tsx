'use client'

import { MyPostWithStudyView } from '@/entities/post'
import { useDeletePost } from '@/features/post/delete'
import { getImageUrl } from '@/shared/api/supabase/storage'
import { getRegionPath } from '@/shared/config/region'
import { getCategoryPath } from '@/shared/config/study-category'
import { studyStatusConversion } from '@/shared/lib/conversion/study'
import { formatTimeAgo } from '@/shared/lib/date'
import { Badge } from '@/shared/shadcn/ui/badge'
import { Button } from '@/shared/shadcn/ui/button'
import { Card } from '@/shared/shadcn/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu'
import { TabsContent } from '@/shared/shadcn/ui/tabs'
import { Edit, Eye, MapPin, MoreVertical, ThumbsUp, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MyPostTab({
    myPosts,
    getStatusColor,
    getCategoryColor,
}: {
    myPosts: MyPostWithStudyView[]
    getStatusColor: (status: string) => string
    getCategoryColor: (category: string) => string
}) {
    const deleteMutation = useDeletePost()
    const router = useRouter()

    const handleDelete = (postId: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!window.confirm('정말 삭제하시겠습니까?')) return

        deleteMutation.mutate(postId)
    }

    const handleUpdate = (postId: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        router.push(`/posts/${postId}/edit`)
    }

    return (
        <TabsContent value='posts' className='space-y-4'>
            {myPosts && myPosts?.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {myPosts.map((item, index) => (
                        <div key={item.id} className='relative'>
                            <Card className='group overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-0 gap-0'>
                                <Link href={`/posts/${item.id}`}>
                                    <div className='relative w-full h-40 bg-muted overflow-hidden cursor-pointer'>
                                        <Image
                                            fill
                                            priority={index === 0}
                                            fetchPriority={index === 0 ? "high" : "auto"}
                                            sizes="(max-width: 640px) 100vw, 424px"
                                            src={
                                                item.imageUrl?.[0]?.url ? getImageUrl(item.imageUrl?.[0]?.url) : '/default-post-thumbnail.jpg'
                                            }
                                            alt={item.title}
                                            className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                                        />
                                        <div className='absolute top-3 right-3'>
                                            <Badge
                                                className={getStatusColor(
                                                    item.study.status
                                                )}>
                                                {studyStatusConversion(
                                                    item.study.status
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>

                                <div className='p-4 flex-1 flex flex-col gap-3 relative'>
                                    {/* 우측 상단 ... 버튼 */}
                                    <div className='absolute top-2 right-2 z-10'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8 hover:bg-muted'>
                                                    <MoreVertical className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align='end'
                                                className='w-40'>
                                                <DropdownMenuItem
                                                    onClick={(e) =>
                                                        handleUpdate(item.id, e)
                                                    }>
                                                    <Edit className='mr-2 h-4 w-4' />
                                                    수정
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) =>
                                                        handleDelete(item.id, e)
                                                    }
                                                    className='text-red-600 focus:text-red-600'>
                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                    삭제
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <Link href={`/posts/${item.id}`}>
                                        <div className='cursor-pointer'>
                                            <div className='flex items-center gap-2 mb-2'>
                                                {getCategoryPath(
                                                    Number(
                                                        item.study
                                                            .studyCategory
                                                    )
                                                ).labels.map((category) => (
                                                    <Badge
                                                        key={category}
                                                        variant='outline'
                                                        className={`text-xs font-normal ${getCategoryColor(
                                                            category
                                                        )}`}>
                                                        {category}
                                                    </Badge>
                                                ))}

                                                <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                                    <MapPin className='w-3 h-3' />{' '}
                                                    {getRegionPath(
                                                        Number(
                                                            item.study.region
                                                        )
                                                    ).labels.join(' ')}
                                                </span>
                                            </div>
                                            <h3 className='font-bold text-foreground line-clamp-1 hover:text-primary transition-colors'>
                                                {item.title}
                                            </h3>
                                            <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                                                {item.content}
                                            </p>
                                        </div>
                                    </Link>

                                    <div className='flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border'>
                                        <span>
                                            {formatTimeAgo(new Date(
                                                item.createdAt
                                            ).toISOString())}
                                        </span>
                                        <div className='flex items-center gap-2'>
                                            <span className='flex items-center gap-1'>
                                                <ThumbsUp className='w-3 h-3' />{' '}
                                                {item.likesCount}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <Eye className='w-3 h-3' />{' '}
                                                {item.viewsCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className='p-12 text-center'>
                    <p className='text-muted-foreground'>
                        작성한 모집글이 없습니다.
                    </p>
                </Card>
            )}
        </TabsContent>
    )
}
