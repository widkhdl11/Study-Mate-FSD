'use client'
import { CurrentUserResponse } from '@/entities/user'
import { useLogout } from '@/features/auth/logout'
import { getProfileImageUrl } from '@/shared/api/supabase/storage'
import { cn } from '@/shared/lib/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/shadcn/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu'
import Link from 'next/link'
import { useHeaderChrome } from '../model/chrome'

export default function LoginDropdown(
    {
        user,
    }: {
        user: CurrentUserResponse
    }
) {

    const logoutMutation = useLogout()
    const { transparent } = useHeaderChrome()

    return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    'flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer',
                    transparent ? 'hover:bg-white/10' : 'hover:bg-muted'
                )}>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage
                            src={getProfileImageUrl(user.avatarUrl)}
                            alt={user.username || ''}
                            width={32}
                            height={32}
                            fetchPriority='high'
                        />
                        <AvatarFallback className='bg-primary text-primary-foreground text-xs font-semibold'>
                            {user.username?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                        'hidden sm:inline text-sm font-medium',
                        transparent ? 'text-white' : 'text-foreground'
                    )}>
                        {user.username}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align='end'
                className='w-48'>
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