import type { User } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

// 사용자 인증 확인
export async function CustomUserAuth(
    supabase: SupabaseClient,
    redirectTo = '/auth/login'
) {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) {
        throw new Error('인증 확인에 실패했습니다')
    }

    if (!user) {
        redirect(redirectTo)
    }

    return { user }
}

export async function tryAuth(
  supabase: SupabaseClient
): Promise<
  | { success: true; user: User }
  | { success: false; error: { message: string } }
> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      success: false, 
      error: { message: '로그인 후 이용 가능합니다' } 
    };
  }
  if (error) {
    return {
      success: false,
      error: { message: '인증 확인에 실패했습니다' }
    };
  }
  return { success: true, user };
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw new Error('사용자 정보를 찾을 수 없습니다');
  return data;
}