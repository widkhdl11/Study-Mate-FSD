'use client'

import { createClient } from '@/shared/api/supabase/client'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseRealtimeChatProps {
  roomName: string
  username: string
}

export interface ChatMessage {
  id: number
  chat_id: number
  content: string
  sender_id: string
  profile: {
    username: string
    avatar_url: string
  }
  created_at: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // channel은 화면에 안 쓰이고 sendMessage(핸들러)에서만 씀 → state가 아니라 ref.
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newChannel = supabase.channel(roomName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    channelRef.current = newChannel

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [roomName, username, supabase])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channelRef.current || !isConnected) return

      const message: ChatMessage = {
        id: Number(crypto.randomUUID()),
        chat_id: Number(roomName),
        content,
        sender_id: username,
        profile: {
          username: username,
          avatar_url: "",
        },
        created_at: new Date().toISOString(),
      }

      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      await channelRef.current.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })
    },
    [isConnected, username, roomName]
  )

  return { messages, sendMessage, isConnected }
}
