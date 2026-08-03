'use client'

import { getImageUrl } from '@/shared/api/supabase/storage'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from '@/shared/shadcn/ui/form'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type Control, type FieldValues, type Path } from 'react-hook-form'

type ImageUploadFieldProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    disabled?: boolean
    existingImages?: string[]
    label?: string
    description?: string
}

// 폼 필드에 이미지(File[])를 올리는 자기완결 컴포넌트.
// - 미리보기 URL state를 내부에서 소유 (부모 form을 모름)
// - 값 읽기/쓰기는 rhf field.value / field.onChange 만 사용 → 도메인 무관, 어느 폼에서나 재사용
export function ImageUploadField<T extends FieldValues>({
    control,
    name,
    existingImages,
    disabled,
    label = '이미지',
    description = '선택사항: 이미지를 업로드하면 모집글이 더 눈에 띕니다',
}: ImageUploadFieldProps<T>) {

    
    const existingPreviewUrls = useMemo(() => {
        if (existingImages?.length === 0) return []
        return existingImages?.map((image) => getImageUrl(image)) ?? []
    }, [existingImages])

    const [previewUrls, setPreviewUrls] = useState<string[]>(existingPreviewUrls)

    // 언마운트 시 남은 blob: 미리보기 URL 해제 (메모리 누수 방지).
    // 기존 이미지의 https URL은 revoke 대상이 아니므로 blob:만 골라 해제.
    // 최신 previewUrls를 ref로 참조해 언마운트 클린업이 stale 값을 보지 않게 함.
    const previewUrlsRef = useRef<string[]>(previewUrls)
    useEffect(() => {
        previewUrlsRef.current = previewUrls
    }, [previewUrls])
    useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach((url) => {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url)
            })
        }
    }, [])


    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const files: File[] = (field.value as File[]) ?? []
                
      
                
                const handleImageChange = (
                    e: React.ChangeEvent<HTMLInputElement>
                ) => {
                    const newFiles = Array.from(e.target.files ?? [])
                    if (newFiles.length === 0) return
                    setPreviewUrls((prev) => [
                        ...prev,
                        ...newFiles.map((file) => URL.createObjectURL(file)),
                    ])
                    field.onChange([...files, ...newFiles])
                }

                const removeImage = (index: number) => {
                    setPreviewUrls((prev) => {
                        if (prev[index]) URL.revokeObjectURL(prev[index])
                        return prev.filter((_, i) => i !== index)
                    })
                    field.onChange(files.filter((_, i) => i !== index))
                }

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormDescription>{description}</FormDescription>
                        <FormControl>
                            <div className='space-y-4'>
                                <label className='relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer dark:hover:bg-muted/50'>
                                    <svg
                                        className='w-10 h-10 text-muted-foreground mb-2'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                                        />
                                    </svg>
                                    <p className='text-sm font-medium text-foreground'>
                                        이미지를 클릭하거나 드래그해서
                                        업로드하세요
                                    </p>
                                    <p className='text-xs text-muted-foreground mt-1'>
                                        PNG, JPG, GIF (최대 10MB)
                                    </p>
                                    <input
                                        type='file'
                                        multiple
                                        accept='image/*'
                                        onChange={handleImageChange}
                                        className='sr-only'
                                        disabled={disabled}
                                    />
                                </label>

                                {(previewUrls.length > 0) && (
                                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                                        {previewUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                className='relative group'>
                                                {/* eslint-disable-next-line @next/next/no-img-element -- blob: 미리보기 URL은 next/image 최적화 대상이 아님 */}
                                                <img
                                                    src={url || '/placeholder.svg'}
                                                    alt={`미리보기 ${index + 1}`}
                                                    className='w-full h-24 object-cover rounded-lg'
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        removeImage(index)
                                                    }
                                                    className='absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                                                    disabled={disabled}>
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </FormControl>
                    </FormItem>
                )
            }}
        />
    )
}
