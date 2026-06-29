'use server';

import { findParticipantByStudyAndUser } from "@/entities/participant/api/ParticipantRepository";
import type { Participant } from "@/entities/participant/model/Participant";
import { ParticipantRole } from "@/entities/participant/model/ParticipantRole";
import { ParticipantStatus } from "@/entities/participant/model/ParticipantStatus";
import type { ParticipantResponse } from "@/entities/participant/model/types";
import { StudyId } from "@/entities/study/model/StudyId";
import { UserId } from "@/entities/user/model/UserId";
import { createClient } from "@/shared/api/supabase/server";
import type { ActionResponse } from "@/shared/kernel/actionType";

function toParticipantResponse(participant: Participant): ParticipantResponse {
  return {
    id: participant.id,
    userId: participant.userId,
    studyId: participant.studyId,
    status: ParticipantStatus.toString(participant.status),
    role: ParticipantRole.toString(participant.role),
    userEmail: "",
    username: "",
    createdAt: participant.createdAt.toISOString(),
    updatedAt: participant.updatedAt.toISOString(),
  };
}

/** 로그인 유저의 스터디 참여 상태 조회 (pending/accepted만, 없으면 null → UI "모집중") */
export async function getParticipantStatus(
  studyId: number
): Promise<ActionResponse<ParticipantResponse | null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return { success: false, error: { message: "인증 확인에 실패했습니다" } };
  }
  if (!user) {
    return { success: true, data: null };
  }

  const userIdVO = UserId.of(user.id);
  if (!userIdVO.ok) {
    return { success: false, error: { message: "유효하지 않은 사용자입니다." } };
  }

  const studyIdVO = StudyId.of(studyId);
  if (!studyIdVO.ok) {
    return { success: false, error: { message: "유효하지 않은 스터디입니다." } };
  }

  const participantResult = await findParticipantByStudyAndUser(
    supabase,
    studyIdVO.value,
    userIdVO.value
  );
  if (!participantResult.ok) {
    return { success: false, error: { message: "참여 상태를 조회할 수 없습니다." } };
  }

  const participant = participantResult.value;
  if (!participant) {
    return { success: true, data: null };
  }

  const { status } = participant;
  if (!ParticipantStatus.isPending(status) && !ParticipantStatus.isAccepted(status)) {
    return { success: true, data: null };
  }

  return { success: true, data: toParticipantResponse(participant) };
}
