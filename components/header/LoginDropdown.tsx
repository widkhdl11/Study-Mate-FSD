'use client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/hooks/useAuth'
import { getProfileImageUrl } from '@/lib/supabase/storage'
import { ProfileResponse } from '@/types/profileType'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export default function LoginDropdown(
    {
        user,
    }: {    
        user: ProfileResponse
    }

) {

    const logoutMutation = useLogout()

    return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage
                            src={getProfileImageUrl(user.avatar_url)}
                            alt={user.username || ''}
                            width={32}
                            height={32}
                            fetchPriority='high'
                        />
                        <AvatarFallback className='bg-primary text-primary-foreground text-xs font-semibold'>
                            {user.username?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <span className='hidden sm:inline text-sm font-medium text-foreground'>
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