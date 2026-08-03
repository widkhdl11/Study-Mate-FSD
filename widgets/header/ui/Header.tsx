import { queryCurrentUser } from '@/entities/user'
import { createClient } from '@/shared/api/supabase/server'
import HeaderClient from './HeaderClient'

export const Header = async () => {
    const supabase = await createClient();
    const currentUserResult = await queryCurrentUser(supabase);
    const currentUser = currentUserResult.ok ? currentUserResult.value : null;

    return <HeaderClient currentUser={currentUser} />
}

export default Header
