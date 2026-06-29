/**
 * Participant Aggregate
 *
 * 자기 자신만 안다.
 * - Study/StudyStatus를 import 하지 않는다 (Policy로 이동)
 * - 자기 상태(ParticipantStatus, ParticipantRole)만 다룬다
 */

import { StudyId, type StudyIdError } from "@/entities/study/model/StudyId";
import { UserId, type UserIdError } from "@/entities/user/model/UserId";
import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";
import { ParticipantId, type ParticipantIdError } from "./ParticipantId";
import { ParticipantRole, type ParticipantRoleError } from "./ParticipantRole";
import { ParticipantStatus, type ParticipantStatusError } from "./ParticipantStatus";

// ─────────────────────────────────────────────
// 1. 타입
// ─────────────────────────────────────────────

export type Participant = Brand<
  Readonly<{
    id: ParticipantId;
    studyId: StudyId;
    userId: UserId;
    role: ParticipantRole;
    status: ParticipantStatus;
    createdAt: Date;
    updatedAt: Date;
  }>,
  "Participant"
>;

export type ParticipantInsert = Brand<
  Readonly<{
    studyId: StudyId;
    userId: UserId;
    role: ParticipantRole;
    status: ParticipantStatus;
  }>,
  "ParticipantInsert"
>;

/** 검증 통과한 후에만 발급되는 "삭제 도장" */
export type DeleteParticipantIntent = Brand<
  Readonly<{ participantId: ParticipantId }>,
  "DeleteParticipantIntent"
>;

// ─────────────────────────────────────────────
// 2. 에러
// ─────────────────────────────────────────────

export type ParticipantError =
  | { readonly kind: "HostMustBeAccepted"; readonly status: ParticipantStatus["kind"] }
  | { readonly kind: "NotCommonRole"; readonly role: ParticipantRole["kind"] }
  // | { readonly kind: "InvalidTransition"; readonly cause: ParticipantStatusError };
  | ParticipantStatusError;

export type ParticipantFromRowError =
  | { readonly kind: "InvalidId";          readonly cause: ParticipantIdError }
  | { readonly kind: "InvalidStudyId";     readonly cause: StudyIdError }
  | { readonly kind: "InvalidUserId";      readonly cause: UserIdError }
  | { readonly kind: "InvalidRole";        readonly cause: ParticipantRoleError }
  | { readonly kind: "InvalidStatus";      readonly cause: ParticipantStatusError }
  | { readonly kind: "InvalidParticipant"; readonly cause: ParticipantError };

// ─────────────────────────────────────────────
// 3. DB Row
// ─────────────────────────────────────────────

export type ParticipantRow = {
  id: number;
  study_id: number;
  user_id: string;
  username: string;
  avatar_url: string;
  user_email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ParticipantUpdateRow = {
  id: number;
  study_id: number;
  user_id: string;
  role: string;
  status: string;
  updated_at: string;
};

export type ParticipantInsertRow = {
  study_id: number;
  user_id: string;
  role: string;
  status: string;
};

// ─────────────────────────────────────────────
// 4. 파라미터
// ─────────────────────────────────────────────

type ParticipantProps = {
  id: ParticipantId;
  studyId: StudyId;
  userId: UserId;
  role: ParticipantRole;
  status: ParticipantStatus;
  createdAt: Date;
  updatedAt: Date;
};

type CreateParticipantProps = {
  studyId: StudyId;
  userId: UserId;
  role: ParticipantRole;
};

// ─────────────────────────────────────────────
// 5. 스마트 생성자
// ─────────────────────────────────────────────

const construct = (params: ParticipantProps): Result<Participant, ParticipantError> => {
  // 불변: Host는 항상 Accepted 상태
  if (ParticipantRole.isHost(params.role) && !ParticipantStatus.isAccepted(params.status)) {
    return err({ kind: "HostMustBeAccepted", status: params.status.kind });
  }
  return ok(params as Participant);
};

// ─────────────────────────────────────────────
// 6. 모듈
// ─────────────────────────────────────────────

export const Participant = {
  create: construct,

  // ── 질의 (자기 상태만) ────────────────────

  isPending:  (p: Participant): boolean => ParticipantStatus.isPending(p.status),
  isAccepted: (p: Participant): boolean => ParticipantStatus.isAccepted(p.status),
  isRejected: (p: Participant): boolean => ParticipantStatus.isRejected(p.status),
  isKicked:   (p: Participant): boolean => ParticipantStatus.isKicked(p.status),

  isHost:   (p: Participant): boolean => ParticipantRole.isHost(p.role),
  isCommon: (p: Participant): boolean => ParticipantRole.isCommon(p.role),

  /** 본인이 탈퇴 가능한 상태인가? */
  isSelfWithdrawable: (p: Participant): boolean =>
    ParticipantStatus.isSelfWithdrawable(p.status),

  /** 본인 여부 확인 */
  isOwnedBy: (p: Participant, userId: UserId): boolean =>
    UserId.equals(p.userId, userId),

  /** 특정 스터디 소속 여부 */
  belongsTo: (p: Participant, studyId: StudyId): boolean =>
    StudyId.equals(p.studyId, studyId),

  // ── 행위 (ParticipantStatus 전이 위임) ────

  /** 수락 — Common 역할만, Pending 상태에서만 */
  accept: (p: Participant): Result<Participant, ParticipantError> => {
    if (!ParticipantRole.isCommon(p.role)) {
      return err({ kind: "NotCommonRole", role: p.role.kind });
    }
    const next = ParticipantStatus.accept(p.status);
    if (!next.ok) return next;
    return ok({ ...p, status: next.value, updatedAt: new Date() } as Participant);
  },

  /** 거절 */
  reject: (p: Participant): Result<Participant, ParticipantError> => {
    const next = ParticipantStatus.reject(p.status);
    if (!next.ok) return next;
    return ok({ ...p, status: next.value, updatedAt: new Date() } as Participant);
  },

  /** 강퇴 */
  kick: (p: Participant): Result<Participant, ParticipantError> => {
    const next = ParticipantStatus.kick(p.status);
    if (!next.ok) return next;
    return ok({ ...p, status: next.value, updatedAt: new Date() } as Participant);
  },

  /** 재신청 — Rejected → Pending */
  reapply: (p: Participant): Result<Participant, ParticipantError> => {
    const next = ParticipantStatus.reapply(p.status);
    if (!next.ok) return next;
    return ok({ ...p, status: next.value, updatedAt: new Date() } as Participant);
  },

  // ── 생성 ──────────────────────────────────

  /** 새 참여자 생성 (DB insert 직전 단계) */
  createNew: (params: CreateParticipantProps): ParticipantInsert => {
    const status = ParticipantRole.isHost(params.role)
      ? ParticipantStatus.accepted()
      : ParticipantStatus.pending();

    return {
      studyId: params.studyId,
      userId:  params.userId,
      role:    params.role,
      status,
    } as ParticipantInsert;
  },

  // ── 변환 (boundary) ──────────────────────

  fromRow: (row: ParticipantRow): Result<Participant, ParticipantFromRowError> => {
    const idResult = ParticipantId.of(row.id);
    if (!idResult.ok) return err({ kind: "InvalidId", cause: idResult.error });

    const studyIdResult = StudyId.of(row.study_id);
    if (!studyIdResult.ok) return err({ kind: "InvalidStudyId", cause: studyIdResult.error });

    const userIdResult = UserId.of(row.user_id);
    if (!userIdResult.ok) return err({ kind: "InvalidUserId", cause: userIdResult.error });

    const roleResult = ParticipantRole.fromString(row.role);
    if (!roleResult.ok) return err({ kind: "InvalidRole", cause: roleResult.error });

    const statusResult = ParticipantStatus.fromString(row.status);
    if (!statusResult.ok) return err({ kind: "InvalidStatus", cause: statusResult.error });

    const participantResult = construct({
      id:        idResult.value,
      studyId:   studyIdResult.value,
      userId:    userIdResult.value,
      role:      roleResult.value,
      status:    statusResult.value,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
    if (!participantResult.ok) {
      return err({ kind: "InvalidParticipant", cause: participantResult.error });
    }
    return participantResult;
  },

  toRow: (p: Participant): ParticipantUpdateRow => ({
    id:         p.id,
    study_id:   p.studyId,
    user_id:    p.userId,
    role:       ParticipantRole.toString(p.role),
    status:     ParticipantStatus.toString(p.status),
    updated_at: p.updatedAt.toISOString(),
  }),

  toInsertRow: (p: ParticipantInsert): ParticipantInsertRow => ({
    study_id: p.studyId,
    user_id:  p.userId,
    role:     ParticipantRole.toString(p.role),
    status:   ParticipantStatus.toString(p.status),
  }),
};