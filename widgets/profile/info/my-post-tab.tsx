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
import { Input } from '@/shared/shadcn/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/shadcn/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu'
import { TabsContent } from '@/shared/shadcn/ui/tabs'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Edit, Eye, FileText, MapPin, MoreVertical, ThumbsUp, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useState } from 'react'
import { getCategoryColor, getStatusColor } from '../lib/tabBadgeColors'

const PAGE_SIZE = 6

export default function MyPostTab({
    myPosts,
}: {
    myPosts: MyPostWithStudyView[]
}) {
    const deleteMutation = useDeletePost()
    const router = useRouter()
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null)

    const requestDelete = (post: { id: number; title: string }, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDeleteTarget({ id: post.id, title: post.title })
    }

    const confirmDelete = () => {
        if (!deleteTarget) return
        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        })
    }

    const [query, setQuery] = useState('')
    const deferredQuery = useDeferredValue(query)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [prevQuery, setPrevQuery] = useState('')

    const q = deferredQuery.trim().toLowerCase()
    const filtered = q
        ? myPosts.filter(
              (p) =>
                  p.title.toLowerCase().includes(q) ||
                  p.content?.toLowerCase().includes(q)
          )
        : myPosts
    // 검색어가 바뀌면 "더 보기" 개수 리셋 (목록 위젯과 동일한 in-render 패턴)
    if (deferredQuery !== prevQuery) {
        setPrevQuery(deferredQuery)
        setVisibleCount(PAGE_SIZE)
    }
    const visible = filtered.slice(0, visibleCount)

    const handleUpdate = (postId: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        router.push(`/posts/${postId}/edit`)
    }

    return (
        <TabsContent value='posts' className='space-y-4'>
            {!myPosts || myPosts.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title='아직 작성한 모집글이 없어요'
                    description='모집글을 올려 함께할 스터디원을 모아보세요.'
                    action={{ label: '모집글 작성하기', href: '/posts/create' }}
                />
            ) : (
                <>
                    <Input
                        placeholder='제목·내용으로 검색'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className='max-w-sm bg-background'
                    />
                    {filtered.length === 0 ? (
                        <p className='py-12 text-center text-sm text-muted-foreground'>
                            검색 결과가 없어요.
                        </p>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {visible.map((item, index) => (
                        <div key={item.id} className='relative'>
                            <Card className='group overflow-hidden hover:border-primary/50 transition-colors h-full flex flex-col p-0 gap-0'>
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
                                                    aria-label='게시글 관리 메뉴'
                                                    className='h-8 w-8 hover:bg-muted'>
                                                    <MoreVertical className='h-4 w-4' aria-hidden='true' />
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
                                                        requestDelete(item, e)
                                                    }
                                                    className='text-destructive focus:text-destructive'>
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
                    )}
                    {visibleCount < filtered.length && (
                        <div className='flex justify-center pt-2'>
                            <Button
                                variant='outline'
                                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                                더 보기 ({filtered.length - visibleCount}개 남음)
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* 삭제 확인 — 네이티브 confirm 대신 브랜드 다이얼로그 */}
            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null)
                }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>모집글을 삭제할까요?</DialogTitle>
                        <DialogDescription>
                            &lsquo;{deleteTarget?.title}&rsquo; 모집글이 삭제됩니다. 이 작업은 되돌릴 수 없어요.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteMutation.isPending}>
                            취소
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TabsContent>
    )
}
