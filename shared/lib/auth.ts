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

    // 비로그인 요청의 getUser()는 user:null 과 함께 AuthSessionMissingError를 반환하므로,
    // !user(로그인 필요) 리다이렉트를 error throw보다 먼저 검사한다.
    // 순서가 반대면 미들웨어가 막지 않는 경로에서 로그인 유도 대신 서버 렌더가 크래시한다.
    if (!user) {
        redirect(redirectTo)
    }

    if (error) {
        throw new Error('인증 확인에 실패했습니다')
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