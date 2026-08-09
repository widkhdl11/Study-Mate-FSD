'use client'

import { NotificationResponse } from '@/entities/notification'
import { useMyNotification } from '@/entities/notification'
import { CurrentUserResponse } from '@/entities/user'
import { useAllReadNotification } from '@/features/notification/all-read'
import { useDeleteNotification } from '@/features/notification/delete'
import { useReadNotification } from '@/features/notification/read'
import { formatTimeAgo } from '@/shared/lib/date'
import { Badge } from '@/shared/shadcn/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu'
import { XIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

function notificationEmoji(type: string) {
    switch (type) {
        case 'participant_request':
            return '👋'
        case 'request_accepted':
            return '✅'
        case 'request_rejected':
            return '❌'
        case 'participant_left':
            return '👋'
        case 'participant_kicked':
            return '🚫'
        default:
            return '🔔'
    }
}

function notificationHref(notification: NotificationResponse) {
    if (notification.referenceType === 'study') {
        return `/studies/${notification.referenceId}`
    }
    return '#'
}

export default function NotificationDropdown({ user }: { user: CurrentUserResponse }) {
    const [notificationOpen, setNotificationOpen] = useState(false)
    const { data: notifications } = useMyNotification(user)
    const readNotificationMutation = useReadNotification()
    const allReadNotificationMutation = useAllReadNotification(user.id)
    const deleteNotificationMutation = useDeleteNotification(user.id)

    const unreadCount = useMemo(() => {
        return notifications?.filter((n: NotificationResponse) => !n.isRead).length ?? 0
    }, [notifications])

    return (
        <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className='relative p-2 rounded-lg transition-colors text-foreground hover:bg-muted'
                    aria-label="알림">
                    🔔
                    {notifications && unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs text-white">
                            <span className="text-xs text-white">{unreadCount}</span>
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
                    <span className="font-semibold text-sm text-foreground shrink-0">알림</span>
                    {notifications && notifications.length > 0 && (
                        <button
                            type="button"
                            className="ml-auto shrink-0 text-xs leading-none text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                            disabled={
                                allReadNotificationMutation.isPending || unreadCount === 0
                            }
                            onClick={() => allReadNotificationMutation.mutate()}>
                            모두 읽기
                        </button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex items-start gap-1 px-2 py-2 hover:bg-muted focus-within:bg-muted">
                                <Link
                                    href={notificationHref(notification)}
                                    className="flex flex-1 min-w-0 items-start gap-2 px-1 py-1 rounded-sm"
                                    onClick={() => {
                                        setNotificationOpen(false)
                                        if (!notification.isRead) {
                                            readNotificationMutation.mutate(notification.id)
                                        }
                                    }}>
                                    <span className="text-base shrink-0">
                                        {notificationEmoji(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </span>
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.content}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    aria-label="알림 삭제"
                                    className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors disabled:opacity-50"
                                    disabled={deleteNotificationMutation.isPending}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        deleteNotificationMutation.mutate(notification.id)
                                    }}>
                                    <XIcon className="size-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                            알림이 없습니다
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
