'use server'

import { createClient } from "@/shared/api/supabase/server";
import { ActionResponse } from "@/shared/kernel/actionType";
import { CustomUserAuth } from "@/shared/lib/auth";

export async function toggleLikeAction(postId: number): Promise<ActionResponse<{ liked: boolean, newCount: number }>> {
    const supabase = await createClient();
    const { user } = await CustomUserAuth(supabase);
    // RPC 함수 호출
    const { data, error } = await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_id: user.id
    });
    
    if (error) {
        throw new Error("좋아요 처리에 실패했습니다.");
    }
    
    // data[0] = { liked: true/false, new_count: 10 }

    return { 
        success: true,
        data: {
        liked: data[0]?.liked,
        newCount: data[0]?.new_count
        }
    };
}
