import type { UserIdError } from "@/entities/user/model/UserId";
import { UserId } from "@/entities/user/model/UserId";
import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";
import { Capacity, CapacityError } from "./Capacity";
import { StudyId, StudyIdError } from "./StudyId";
import { StudyStatus, StudyStatusError } from "./StudyStatus";

// ─────────────────────────────────────────────
// 1. 타입 정의
// ─────────────────────────────────────────────

export type Study = Brand<
  Readonly<{
    id: StudyId;
    creatorId: UserId;
    title: string;
    description: string;
    region: string;
    studyCategory: string;
    capacity: Capacity;
    status: StudyStatus;
    createdAt: Date;
    updatedAt: Date;
  }>,
  "Study"
>;

export type StudyInsert = Brand<
  Readonly<{
    creatorId: UserId;
    title: string;
    description: string;
    region: string;
    studyCategory: string;
    capacity: Capacity;
    status: StudyStatus;
  }>,
  "StudyInsert"
>;

export type StudyDeleteIntent = Brand<
  Readonly<{ studyId: StudyId }>,
  "StudyDeleteIntent"
>;

// ─────────────────────────────────────────────
// 2. 에러
// ─────────────────────────────────────────────

export type StudyError =
  | { readonly kind: "EmptyTitle" }
  | { readonly kind: "EmptyDescription" }
  | { readonly kind: "EmptyRegion" }
  | { readonly kind: "EmptyStudyCategory" }
  | { readonly kind: "NotHost" }
  | { readonly kind: "InvalidCapacity";  readonly cause: CapacityError };

  
export type StudyFromRowError =
  | { readonly kind: "InvalidId";        readonly cause: StudyIdError }
  | { readonly kind: "InvalidCreatorId"; readonly cause: UserIdError }
  | { readonly kind: "InvalidCapacity";  readonly cause: CapacityError }
  | { readonly kind: "InvalidStatus";    readonly cause: StudyStatusError }
  | { readonly kind: "InvalidStudy";     readonly cause: StudyError };

// ─────────────────────────────────────────────
// 3. DB Row 타입
// ─────────────────────────────────────────────

export type StudyRow = {
  id: number;
  creator_id: string;
  title: string;
  description: string;
  region: string;
  study_category: string;
  max_participants: number;
  current_participants: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type StudyInsertRow = {
  creator_id: string;
  title: string;
  description: string;
  region: string;
  study_category: string;
  max_participants: number;
  current_participants: number;
  status: string;
};

export type StudyUpdateRow = {
  title: string;
  description: string;
  region: string;
  study_category: string;
  max_participants: number;
};

// ─────────────────────────────────────────────
// 4. 파라미터 타입
// ─────────────────────────────────────────────

type StudyProps = {
  id: StudyId;
  creatorId: UserId;
  title: string;
  description: string;
  region: string;
  studyCategory: string;
  capacity: Capacity;
  status: StudyStatus;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateStudyProps = {
  title: string;
  description: string;
  region: string;
  studyCategory: string;
  maxParticipants: number;
};

type CreateStudyProps = {
  creatorId: UserId;
  title: string;
  description: string;
  region: string;
  studyCategory: string;
  maxParticipants: number;
};

// ─────────────────────────────────────────────
// 5. 스마트 생성자 (외부에 노출하지 않음)
// ─────────────────────────────────────────────

const construct = (params: StudyProps): Result<Study, StudyError> => {
  if (params.title.trim() === "")         return err({ kind: "EmptyTitle" });
  if (params.description.trim() === "")   return err({ kind: "EmptyDescription" });
  if (params.region.trim() === "")        return err({ kind: "EmptyRegion" });
  if (params.studyCategory.trim() === "") return err({ kind: "EmptyStudyCategory" });

  return ok(params as Study);
};

// 공통 검증 — createNew와 createUpdate에서 사용
const validateBasicFields = (params: {
  title: string;
  description: string;
  region: string;
  studyCategory: string;
}): Result<void, StudyError> => {
  if (params.title.trim() === "")         return err({ kind: "EmptyTitle" });
  if (params.description.trim() === "")   return err({ kind: "EmptyDescription" });
  if (params.region.trim() === "")        return err({ kind: "EmptyRegion" });
  if (params.studyCategory.trim() === "") return err({ kind: "EmptyStudyCategory" });
  return ok(undefined);
};

// ─────────────────────────────────────────────
// 6. 모듈 함수 묶음
// ─────────────────────────────────────────────

export const Study = {
  // ── 생성 ──────────────────────────────────
  create: construct,

  /** 새 스터디 생성 (DB에 insert 직전 단계) */
  createNew: (params: CreateStudyProps): Result<StudyInsert, StudyError> => {
    const fieldsResult = validateBasicFields(params);
    if (!fieldsResult.ok) return fieldsResult;

    const capacityResult = Capacity.empty(params.maxParticipants);
    if (!capacityResult.ok) return err({ kind: "InvalidCapacity", cause: capacityResult.error });

    return ok({
      creatorId:     params.creatorId,
      title:         params.title,
      description:   params.description,
      region:        params.region,
      studyCategory: params.studyCategory,
      capacity:      capacityResult.value,
      status:        StudyStatus.recruiting(),
    } as StudyInsert);
  },

  /** 기존 Study 업데이트 — 변경 가능한 필드만 받아 새 Study 반환 */
  createUpdate: (s: Study, userId: UserId, params: UpdateStudyProps): Result<Study, StudyError> => {
    if (!Study.isHost(s, userId)) return err({ kind: "NotHost" });   // 권한: 호스트만 수정

    const fieldsResult = validateBasicFields(params);
    if (!fieldsResult.ok) return fieldsResult;

    const capacityResult = Capacity.of(s.capacity.current, params.maxParticipants);
    if (!capacityResult.ok) return err({ kind: "InvalidCapacity", cause: capacityResult.error }); ;

    return ok({
      ...s,
      title:         params.title,
      description:   params.description,
      region:        params.region,
      studyCategory: params.studyCategory,
      capacity:      capacityResult.value,
    });
  },

  // ── 질의 (자기 상태만 봄) ────────────────

  isRecruiting: (s: Study): boolean => StudyStatus.isRecruiting(s.status),
  isClosed:     (s: Study): boolean => StudyStatus.isClosed(s.status),
  isCompleted:  (s: Study): boolean => StudyStatus.isCompleted(s.status),

  /** 활동 중(닫히지 않음) */
  isActive: (s: Study): boolean => StudyStatus.isActive(s.status),

  /** 모집 가능 상태 — 모집중이고 정원 여유 있음 */
  isAcceptable: (s: Study): boolean =>
    StudyStatus.isRecruiting(s.status) && !Capacity.isFull(s.capacity),

  /** 호스트 여부 확인 */
  isHost: (s: Study, userId: UserId): boolean =>
    UserId.equals(s.creatorId, userId),

  /** 스터디 삭제 가능 여부 체크 */
  deleteStudy: (s: Study, userId: UserId): Result<StudyDeleteIntent, StudyError> => {
    // 본인만 삭제 가능
    if (!UserId.isSelf(s.creatorId, userId)) return err({ kind: "NotHost" });
    return ok({ studyId: s.id } as StudyDeleteIntent);
  },

  
  // ── 전이 (StudyStatus에 위임 + Study 객체 갱신) ──

  /** 모집완료로 전이 (정원 다 찼을 때) */
  // complete: (s: Study): Result<Study, StudyStatusError> => {
  //   const next = StudyStatus.complete(s.status);
  //   if (!next.ok) return next;
  //   return ok({ ...s, status: next.value, updatedAt: new Date() });
  // },

  /** 모집중으로 되돌리기 (한 명 빠졌을 때) */
  // vacate: (s: Study): Result<Study, StudyStatusError> => {
  //   const next = StudyStatus.vacate(s.status);
  //   if (!next.ok) return next;
  //   return ok({ ...s, status: next.value, updatedAt: new Date() });
  // },

  /** 스터디 종료 */
  close: (s: Study): Result<Study, StudyStatusError> => {
    const next = StudyStatus.close(s.status);
    if (!next.ok) return next;
    return ok({ ...s, status: next.value, updatedAt: new Date() });
  },

  // ── 변환 (boundary) ──────────────────────

  fromRow: (row: StudyRow): Result<Study, StudyFromRowError> => {
    const idResult = StudyId.of(row.id);
    if (!idResult.ok) return err({ kind: "InvalidId", cause: idResult.error });

    const creatorIdResult = UserId.of(row.creator_id);
    if (!creatorIdResult.ok) return err({ kind: "InvalidCreatorId", cause: creatorIdResult.error });

    const capacityResult = Capacity.of(row.current_participants, row.max_participants);
    if (!capacityResult.ok) return err({ kind: "InvalidCapacity", cause: capacityResult.error });

    const statusResult = StudyStatus.fromString(row.status);
    if (!statusResult.ok) return err({ kind: "InvalidStatus", cause: statusResult.error });

    const studyResult = construct({
      id:            idResult.value,
      creatorId:     creatorIdResult.value,
      title:         row.title,
      description:   row.description,
      region:        row.region,
      studyCategory: row.study_category,
      capacity:      capacityResult.value,
      status:        statusResult.value,
      createdAt:     new Date(row.created_at),
      updatedAt:     new Date(row.updated_at),
    });
    if (!studyResult.ok) return err({ kind: "InvalidStudy", cause: studyResult.error });

    return studyResult;
  },

  toRow: (s: Study): StudyRow => ({
    id:             s.id,
    creator_id:     s.creatorId,
    title:          s.title,
    description:    s.description,
    region:         s.region,
    study_category: s.studyCategory,
    ...Capacity.toColumns(s.capacity),
    status:         StudyStatus.toString(s.status),
    created_at:     s.createdAt.toISOString(),
    updated_at:     s.updatedAt.toISOString(),
  }),

  toInsertRow: (s: StudyInsert): StudyInsertRow => ({
    creator_id:     s.creatorId,
    title:          s.title,
    description:    s.description,
    region:         s.region,
    study_category: s.studyCategory,
    ...Capacity.toColumns(s.capacity),
    status:         StudyStatus.toString(s.status),
  }),

  toUpdateRow: (s: Study): StudyUpdateRow => ({
    title:            s.title,
    description:      s.description,
    region:           s.region,
    study_category:   s.studyCategory,
    max_participants: s.capacity.max,
  }),
};