'use client'

import { CurrentUserResponse } from '@/entities/user'
import dynamic from 'next/dynamic'
import LoginDropdown from './LoginDropdown'

const NotificationDropdown = dynamic(
    () => import('./NotificationDropdown'),
    { ssr: false }
)

export default function UserMenu({ user }: { user: CurrentUserResponse }) {
    return (
        <>
            <NotificationDropdown user={user}/>
            <LoginDropdown user={user} />
        </>
    )
}
