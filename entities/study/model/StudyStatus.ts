
import { err, ok, type Result } from "@/shared/kernel/Result";

// ─────────────────────────────────────────────
// 1. 타입 정의
// ─────────────────────────────────────────────

export type StudyStatus =
  | { readonly kind: "Recruiting" }
  | { readonly kind: "Closed" }
  | { readonly kind: "Completed" };

// ─────────────────────────────────────────────
// 2. 에러
// ─────────────────────────────────────────────

export type StudyStatusError =
  | {
      readonly kind: "InvalidTransition";
      readonly from: StudyStatus["kind"];
      readonly to: StudyStatus["kind"];
    }
  | {
      readonly kind: "InvalidValue";
      readonly value: string;
    };

// ─────────────────────────────────────────────
// 3. 모듈 함수 묶음
// ─────────────────────────────────────────────

export const StudyStatus = {
  // ── 생성 ──────────────────────────────────
  recruiting: (): StudyStatus => ({ kind: "Recruiting" }),
  closed:     (): StudyStatus => ({ kind: "Closed" }),
  completed:  (): StudyStatus => ({ kind: "Completed" }),

  // ── 질의 ──────────────────────────────────
  isRecruiting: (s: StudyStatus): boolean => s.kind === "Recruiting",
  isClosed:     (s: StudyStatus): boolean => s.kind === "Closed",
  isCompleted:  (s: StudyStatus): boolean => s.kind === "Completed",

  /** 활동 중(모집중 또는 모집완료) — 아직 닫히지 않은 상태 */
  isActive: (s: StudyStatus): boolean =>
    s.kind === "Recruiting" || s.kind === "Completed",

  // ── 전이 ──────────────────────────────────

  /** Recruiting → Completed (정원 다 참) */
  // complete: (s: StudyStatus): Result<StudyStatus, StudyStatusError> => {
  //   if (s.kind !== "Recruiting") {
  //     return err({ kind: "InvalidTransition", from: s.kind, to: "Completed" });
  //   }
  //   return ok(StudyStatus.completed());
  // },

  /** Completed → Recruiting (참여자 빠져서 다시 모집) */
  // vacate: (s: StudyStatus): Result<StudyStatus, StudyStatusError> => {
  //   if (s.kind !== "Completed") {
  //     return err({ kind: "InvalidTransition", from: s.kind, to: "Recruiting" });
  //   }
  //   return ok(StudyStatus.recruiting());
  // },

  /** Recruiting/Completed → Closed (스터디 종료) */
  close: (s: StudyStatus): Result<StudyStatus, StudyStatusError> => {
    if (s.kind !== "Recruiting" && s.kind !== "Completed") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Closed" });
    }
    return ok(StudyStatus.closed());
  },

  // ── 경계 변환 (boundary) ──────────────────

  fromString: (s: string): Result<StudyStatus, StudyStatusError> => {
    switch (s) {
      case "recruiting": return ok(StudyStatus.recruiting());
      case "closed":     return ok(StudyStatus.closed());
      case "completed":  return ok(StudyStatus.completed());
      default:           return err({ kind: "InvalidValue", value: s });
    }
  },

  toString: (s: StudyStatus): string => {
    switch (s.kind) {
      case "Recruiting": return "recruiting";
      case "Closed":     return "closed";
      case "Completed":  return "completed";
    }
  },
};