'use client'
import { CurrentUserResponse } from '@/entities/user'
import { useLogout } from '@/features/auth/logout'
import { getProfileImageUrl } from '@/shared/api/supabase/storage'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/shadcn/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu'
import Link from 'next/link'

export default function LoginDropdown(
    {
        user,
    }: {
        user: CurrentUserResponse
    }
) {

    const logoutMutation = useLogout()

    return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer hover:bg-ink/5'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage
                            src={getProfileImageUrl(user.avatarUrl)}
                            alt={user.username || ''}
                            width={32}
                            height={32}
                            fetchPriority='high'
                        />
                        <AvatarFallback className='bg-ink text-paper text-xs font-semibold'>
                            {user.username?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <span className='hidden sm:inline text-sm font-medium text-ink'>
                        {user.username}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align='end'
                className='w-48 bg-paper border-2 border-ink/15 rounded-xl shadow-soft'>
                <DropdownMenuItem asChild className='cursor-pointer'>
                    <Link
                        href='/profile'
                        className='w-full'
                        >
                        프로필
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='cursor-pointer'>
                    <Link
                        href='/profile?tab=posts'
                        className='w-full'
                     >
                        내 게시글
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='cursor-pointer'>
                    <Link
                        href='/profile?tab=studies'
                        className='w-full'
                       >
                        내 스터디
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='cursor-pointer'>
                    <Link
                        href='/profile?tab=chats'
                        className='w-full'
                        >
                        내 채팅
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    disabled={logoutMutation.isPending}
                    onSelect={() => {
                        if (!logoutMutation.isPending)
                            logoutMutation.mutate()
                    }}>
                    로그아웃
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}