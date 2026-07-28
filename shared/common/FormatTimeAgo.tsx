'use client'

import { formatDate } from '@/shared/lib/date'
import { useEffect, useState } from 'react'

interface TimeAgoProps {
  date: string
  className?: string
}

export default function TimeAgo({ date, className }: TimeAgoProps) {
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setText(formatDate(date))
    update()
    const interval = setInterval(update, 60 * 1000)
    return () => clearInterval(interval)
  }, [date])

  if (text === null) {
    return <span className={className}>...</span>
  }
  return <span className={className}>{text}</span>
}