import { findParticipantByStudyAndUser } from "@/entities/participant/api/ParticipantRepository";
import type { Participant } from "@/entities/participant/model/Participant";
import { ParticipantRole } from "@/entities/participant/model/ParticipantRole";
import { ParticipantStatus } from "@/entities/participant/model/ParticipantStatus";
import type { ParticipantResponse } from "@/entities/participant/model/types";
import { StudyId } from "@/entities/study/model/StudyId";
import { UserId } from "@/entities/user/model/UserId";
import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";

export type GetParticipantStatusError =
  | { readonly kind: "Auth"; readonly message: string }
  | { readonly kind: "InvalidInput"; readonly message: string }
  | { readonly kind: "Infra"; readonly message: string };

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
export async function queryParticipantStatus(
  supabase: SupabaseClient,
  studyId: number
): Promise<Result<ParticipantResponse | null, GetParticipantStatusError>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return err({ kind: "Auth", message: "인증 확인에 실패했습니다" });
  }
  if (!user) {
    return ok(null);
  }

  const userIdVO = UserId.of(user.id);
  if (!userIdVO.ok) {
    return err({ kind: "InvalidInput", message: "유효하지 않은 사용자입니다." });
  }

  const studyIdVO = StudyId.of(studyId);
  if (!studyIdVO.ok) {
    return err({ kind: "InvalidInput", message: "유효하지 않은 스터디입니다." });
  }

  const participantResult = await findParticipantByStudyAndUser(
    supabase,
    studyIdVO.value,
    userIdVO.value
  );
  if (!participantResult.ok) {
    return err({ kind: "Infra", message: "참여 상태를 조회할 수 없습니다." });
  }

  const participant = participantResult.value;
  if (!participant) {
    return ok(null);
  }

  const { status } = participant;
  if (!ParticipantStatus.isPending(status) && !ParticipantStatus.isAccepted(status)) {
    return ok(null);
  }

  return ok(toParticipantResponse(participant));
}
