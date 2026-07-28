'use server';

import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";

// 조회수 +1 (rpc). 중복 방지는 호출측(useTrackPostView)의 세션 스토어가 담당.
export async function increaseViewCount(postId: number): Promise<ActionResponse> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_post_views', {
    post_id: postId
  });

  if (error) {
    throw new Error(error.message);
  }
  return { success: true };
}
