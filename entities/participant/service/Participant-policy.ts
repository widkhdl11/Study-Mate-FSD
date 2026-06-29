/**
 * ParticipantPolicy
 *
 * Participant + Study 두 Aggregate에 걸친 비즈니스 규칙을 모은다.
 * 각 Aggregate는 자기 자신만 알고, 협력 규칙은 여기서.
 *
 * 패턴:
 *   - 검증 통과 시 브랜디드 Intent(또는 변경된 Participant) 발급
 *   - Repository는 Intent만 받음 → 검증 우회 차단
 */

import { Study } from "@/entities/study/model/Study";
import type { UserId } from "@/entities/user/model/UserId";
import { err, ok, type Result } from "@/shared/kernel/Result";
import {
  Participant,
  ParticipantError,
  type DeleteParticipantIntent,
  type ParticipantInsert,
} from "../model/Participant";
import { ParticipantRole } from "../model/ParticipantRole";
// ─────────────────────────────────────────────
// 에러
// ─────────────────────────────────────────────

export type WithdrawError =
  | { readonly kind: "NotOwner" }
  | { readonly kind: "StudyNotActive" }
  | { readonly kind: "NotWithdrawable" };

// 호스트 행위(수락/거절/강퇴) 공용 에러.
// ParticipantError(자기 Aggregate 에러)는 통과로 흡수, Study 경계는 정책 자기 kind로 번역(ACL).
type HostActionError =
  | { readonly kind: "NotHost" }
  | { readonly kind: "StudyNotActive" }
  | { readonly kind: "NotInStudy" }
  | { readonly kind: "StudyNotAcceptable" }
  | ParticipantError

export type AcceptError = HostActionError;
export type RejectError = HostActionError;
export type KickError   = HostActionError;

export type ApplyError =
  | { readonly kind: "StudyNotAcceptable" }
  | { readonly kind: "SelfApply" }
  | { readonly kind: "AlreadyPending" }
  | { readonly kind: "AlreadyAccepted" }
  | { readonly kind: "CannotReapply" };
//  ← InvalidTransition 제거 (decideApply가 CannotReapply로 반환하므로 미사용)


// ─────────────────────────────────────────────
// 신청 결정 (판별 유니온)
// ─────────────────────────────────────────────



// ─────────────────────────────────────────────
// Policy
// ─────────────────────────────────────────────

export const ParticipantPolicy = {
  /**
   * 신청 처리 결정 — 신규/재신청 분기.
   */
  decideApply: (
    study: Study,
    actor: UserId,
    existing: Participant | null
  ): Result<Participant |ParticipantInsert, ApplyError> => {
    if (!Study.isAcceptable(study)) return err({ kind: "StudyNotAcceptable" });
    if (Study.isHost(study, actor)) return err({ kind: "SelfApply" });

    if (existing) {
      if (Participant.isPending(existing))  return err({ kind: "AlreadyPending" });
      if (Participant.isAccepted(existing)) return err({ kind: "AlreadyAccepted" });

      const reapplied = Participant.reapply(existing);
      if (!reapplied.ok) return err({ kind: "CannotReapply" });
      return ok(reapplied.value);
    }

    const intent = Participant.createNew({
      studyId: study.id,
      userId:  actor,
      role:    ParticipantRole.common(),
    });
    return ok(intent);
  },

  /** 호스트가 참여자 수락 */
  hostAccept: (
    study: Study,
    participant: Participant,
    actor: UserId
  ): Result<Participant, AcceptError> => {
    if (!Study.isHost(study, actor))                   return err({ kind: "NotHost" });
    if (!Study.isActive(study))                        return err({ kind: "StudyNotActive" });
    if (!Study.isAcceptable(study))                    return err({ kind: "StudyNotAcceptable" });
    if (!Participant.belongsTo(participant, study.id)) return err({ kind: "NotInStudy" });
    return Participant.accept(participant);   
  },

  /** 호스트가 참여자 거절 */
  hostReject: (
    study: Study,
    participant: Participant,
    actor: UserId
  ): Result<Participant, RejectError> => {
    if (!Study.isHost(study, actor))                   return err({ kind: "NotHost" });
    if (!Study.isActive(study))                        return err({ kind: "StudyNotActive" });
    if (!Participant.belongsTo(participant, study.id)) return err({ kind: "NotInStudy" });
    return Participant.reject(participant);  
  },

  /** 호스트가 참여자 강퇴 */
  hostKick: (
    study: Study,
    participant: Participant,
    actor: UserId
  ): Result<Participant, KickError> => {
    if (!Study.isHost(study, actor))                   return err({ kind: "NotHost" });
    if (!Study.isActive(study))                        return err({ kind: "StudyNotActive" });
    if (!Participant.belongsTo(participant, study.id)) return err({ kind: "NotInStudy" });
    return Participant.kick(participant);  
  },

  /** 본인 자진 탈퇴 / 신청 취소 → 삭제 Intent 발급 */
  selfWithdraw: (
    study: Study,
    participant: Participant,
    actor: UserId
  ): Result<DeleteParticipantIntent, WithdrawError> => {
    if (!Participant.isOwnedBy(participant, actor))   return err({ kind: "NotOwner" });
    if (!Study.isActive(study))                        return err({ kind: "StudyNotActive" });
    if (!Participant.isSelfWithdrawable(participant))  return err({ kind: "NotWithdrawable" });
    return ok({ participantId: participant.id } as DeleteParticipantIntent);
  },
};