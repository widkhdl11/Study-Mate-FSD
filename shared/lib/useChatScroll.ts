'use client'
import { useCallback, useRef } from 'react'

// 컨테이너를 맨 아래로 스크롤 (도메인 무관 범용 UI 훅)
export function useChatScroll() {
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  return { containerRef, scrollToBottom }
}
