import { queryCurrentUser } from '@/entities/user'
import { CreateStudyButton } from '@/features/study/create'
import { createClient } from '@/shared/api/supabase/server'
import { Button } from '@/shared/shadcn/ui/button'
import Link from 'next/link'
import SearchBox from './SearchBox'
import UserMenu from './UserMenu'

export const Header = async () => {
    const supabase = await createClient();
    const currentUserResult = await queryCurrentUser(supabase);
    const currentUser = currentUserResult.ok ? currentUserResult.value : null;

    return (
        <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    <Link
                        href='/'
                        className='flex items-center gap-2 font-bold text-xl text-foreground hover:text-accent transition-colors'>
                        <div className='w-8 h-8 rounded-md bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold'>
                            📚
                        </div>
                        Study Mate
                    </Link>

                    <nav className='hidden md:flex items-center gap-8'>
                        <Link
                            href='/posts'
                            className='text-foreground hover:text-accent transition-colors font-medium'>
                            모집글
                        </Link>
                        <CreateStudyButton isLoggedIn={!!currentUser} />
                    </nav>

                    <div className='flex items-center gap-4'>
                        <SearchBox/>

                        {currentUser ? (
                            <UserMenu user={currentUser} />
                        ) : (
                            <Button asChild>
                                <Link href='/auth/login'>로그인</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
