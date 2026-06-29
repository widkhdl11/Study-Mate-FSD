'use client'
import { NotificationResponse } from '@/entities/notification'
import { ProfileResponse } from '@/entities/user/model/types'
import { useAllReadNotification, useGetNotifications, useReadNotification } from '@/hooks/useNotification'
import { formatTimeAgo } from '@/shared/lib/date'
import { Badge } from '@/shared/shadcn/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/shared/shadcn/ui/dropdown-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function NotificationDropdown (
    { user }: { user: ProfileResponse }
) {
    const [notificationOpen, setNotificationOpen] = useState(false)
    const pathname = usePathname()
    const { data: notifications } = useGetNotifications(user)
    const readNotificationMutation = useReadNotification()
    const { mutate: allReadNotification } = useAllReadNotification()
     // 페이지 이동 시 드롭다운 닫기
    useEffect(() => {
        setNotificationOpen(false)
    }, [pathname])

    const unreadCount = useMemo(()=>{
        return notifications?.filter(
            (n: NotificationResponse) =>
                !n.is_read
        ).length ?? 0
    }, [notifications])
    return (
         <DropdownMenu
            open={notificationOpen}
            onOpenChange={setNotificationOpen}>
            <DropdownMenuTrigger asChild>
                <button className='relative p-2 text-foreground hover:bg-muted rounded-lg transition-colors'>
                    🔔
                    {notifications &&
                        unreadCount > 0 && (
                            <Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs text-white'>
                                <span className='text-xs text-white'>
                                    {unreadCount}
                                </span>
                            </Badge>
                        )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align='end'
                className='w-80'>
                <div className='flex items-center justify-between px-3 py-2 border-b border-border'>
                    <span className='font-semibold text-sm text-foreground'>
                        알림
                    </span>
                    {notifications &&
                        unreadCount > 0 && (
                            <button
                                className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                                onClick={() =>
                                    allReadNotification()
                                }>
                                모두 읽음
                            </button>
                        )}
                </div>
                <div className='max-h-80 overflow-y-auto'>
                    {notifications &&
                    notifications.length > 0 ? (
                        notifications.map(
                            (notification) => (
                                <DropdownMenuItem
                                    key={
                                        notification.id
                                    }
                                    className='cursor-pointer px-3 py-3 focus:bg-muted'
                                    asChild>
                                    <Link
                                        href={
                                            notification.reference_type ===
                                            'study'
                                                ? `/studies/${notification.reference_id}`
                                                : '#'
                                        }
                                        className='flex flex-col gap-1'
                                        onClick={() => {
                                            readNotificationMutation.mutate(
                                                notification.id
                                            )
                                        }}>
                                        <div className='flex items-start gap-2'>
                                            <span className='text-base'>
                                                {notification.type ===
                                                    'participant_request' &&
                                                    '👋'}
                                                {notification.type ===
                                                    'request_accepted' &&
                                                    '✅'}
                                                {notification.type ===
                                                    'request_rejected' &&
                                                    '❌'}
                                                {notification.type ===
                                                    'participant_left' &&
                                                    '👋'}
                                                {notification.type ===
                                                    'participant_kicked' &&
                                                    '🚫'}
                                            </span>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-2'>
                                                    <span
                                                        className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {
                                                            notification.title
                                                        }
                                                    </span>
                                                    {!notification.is_read && (
                                                        <span className='w-2 h-2 rounded-full bg-destructive flex-shrink-0' />
                                                    )}
                                                </div>
                                                <p className='text-xs text-muted-foreground line-clamp-2'>
                                                    {
                                                        notification.content
                                                    }
                                                </p>
                                                <span className='text-xs text-muted-foreground'>
                                                    {formatTimeAgo(
                                                        notification.created_at
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            )
                        )
                    ) : (
                        <div className='px-3 py-8 text-center text-muted-foreground text-sm'>
                            알림이 없습니다
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}