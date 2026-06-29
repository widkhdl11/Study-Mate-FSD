import { SupabaseClient } from "@supabase/supabase-js";

export async function verifyHostAndGetStudy(
  supabase: SupabaseClient,
  participantId: number,
  userId: string
): Promise<{ 
  studyId: number; 
  study: { 
    creator_id: string;
    max_participants: number;
    current_participants: number;
    status: string;
  } 
}> {
  const { data: participantInfo, error: participantError } = await supabase
    .from('participants')
    .select('study_id')
    .eq('id', participantId)
    .eq('status', 'pending')
    .single();

  if (participantError || !participantInfo) {
    throw new Error('참가 요청을 찾을 수 없습니다');
  }

  // 권한 + 정원 정보를 *한 번에* 조회
  const { data: study } = await supabase
    .from('studies')
    .select('creator_id, max_participants, current_participants, status')
    .eq('id', participantInfo.study_id)
    .single();

  if (!study) throw new Error('스터디 정보를 찾을 수 없습니다');

  if (study.creator_id !== userId) {
    throw new Error('권한이 없습니다');
  }

  return { studyId: participantInfo.study_id, study };
}