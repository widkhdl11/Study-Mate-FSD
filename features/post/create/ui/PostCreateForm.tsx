'use client'

import { StudySelectSkeleton } from '@/shared/ui/skeleton'
import { CreatePostCommand, createPostSchema } from '@/entities/post'

import { StudyResponse, StudySelect } from '@/entities/study'
import { useCreatePost } from '../model/useCreatePost'
import { zodResolverFirstError } from '@/shared/lib/validation'
import { Button } from '@/shared/shadcn/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/shadcn/ui/form'
import { Input } from '@/shared/shadcn/ui/input'
import { Textarea } from '@/shared/shadcn/ui/textarea'
import { ImageUploadField } from '@/shared/ui/ImageUploadField'
import Link from 'next/link'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'

export default function PostCreateForm({ studiesPromise }: { studiesPromise: Promise<StudyResponse[]> }) {
    const form = useForm<CreatePostCommand>({
        resolver: zodResolverFirstError(createPostSchema),
        defaultValues: {
            title: '',
            studyId: 0,
            content: '',
            images: [] as File[],
        },
    })
    const { mutate: createPost, isPending: isLoading } = useCreatePost(
        (filed, message) => {
            form.setError(filed as keyof CreatePostCommand, {
                type: 'server',
                message,
            })
        }
    )
    async function onSubmit(values: CreatePostCommand) {
        createPost(values)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'>
                {/* 게시글 제목 */}
                <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>게시글 제목</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder='게시글 제목을 입력해주세요'
                                    disabled={isLoading}
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* 스터디 선택 */}
                <FormField
                    control={form.control}
                    name='studyId'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>스터디 선택 *</FormLabel>
                            <FormDescription>
                                모집글을 작성할 스터디를 선택해주세요
                            </FormDescription>
                            <Suspense fallback={<StudySelectSkeleton />}>
                                <StudySelect
                                    studiesPromise={studiesPromise}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </Suspense>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 내용 */}
                <FormField
                    control={form.control}
                    name='content'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>내용 *</FormLabel>
                            <FormDescription>
                                모집글의 상세한 내용을 입력해주세요 (최소 10자)
                            </FormDescription>
                            <FormControl>
                                <Textarea
                                    placeholder='스터디에 대한 상세한 설명을 입력하세요'
                                    disabled={isLoading}
                                    rows={6}
                                    className='resize-none'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 이미지 업로드 */}
                <ImageUploadField
                    control={form.control}
                    name='images'
                    disabled={isLoading}
                />

                <div className='flex gap-3 pt-4'>
                    <Button
                        type='submit'
                        className='flex-1 bg-primary hover:bg-primary/90 text-primary-foreground'
                        disabled={isLoading}>
                        {isLoading ? '작성 중...' : '모집글 작성'}
                    </Button>
                    <Link href='/' className='flex-1'>
                        <Button
                            type='button'
                            variant='outline'
                            className='w-full bg-transparent'
                            disabled={isLoading}>
                            취소
                        </Button>
                    </Link>
                </div>
            </form>
        </Form>
    )
}
