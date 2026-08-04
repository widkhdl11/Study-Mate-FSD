"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/shared/lib/cn"
import Image, { ImageProps } from "next/image"


// AvatarImage 컴포넌트의 props 타입 정의
type AvatarImageProps = Omit<ImageProps, 'src'> & {
  src?: string
  className?: string
}


function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}



// 기존 코드
// function AvatarImage({
//   className,
//   ...props
// }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
//   return (
//     <AvatarPrimitive.Image
//       data-slot="avatar-image"
//       className={cn("aspect-square size-full", className)}
//       {...props}
//     />
//   )
// }


// Next.js Image 사용 코드로 변경
function AvatarImage({
  className,
  src,
  alt,
  width = 96,      // 기본값 추가
  height = 96,     // 기본값 추가
  ...props
}: AvatarImageProps) {
  if (!src) return null   // src 없으면 바로 null (Fallback 뜸)

  return (
    // src를 AvatarPrimitive.Image에도 전달해야 Radix가 로딩 상태를 추적한다.
    // (자식 next/image에만 주면 Radix는 src=undefined로 보고 항상 error 처리 →
    //  이미지를 안 그리고 Fallback만 떠서 모든 아바타가 이니셜로 표시되던 버그)
    <AvatarPrimitive.Image asChild src={src}>
      <Image
        data-slot="avatar-image"
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("aspect-square size-full object-cover", className)}
        {...props}
      />
    </AvatarPrimitive.Image>
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
