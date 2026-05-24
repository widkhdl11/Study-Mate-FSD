/** 
 * 1. 유니온 타입 정의 
 * 2. 스마트 생성자
 * 3. 모듈 함수 묶음
 * - isStudyStatus: 스터디 상태 판별
 * - isRecruiting: 모집 중 상태 판별
 * - isCompleted: 모집 완료 상태 판별
 * - isClosed: 마감 상태 판별
 */

import { err, ok, Result } from "@/shared/kernel/Result";

export type StudyStatus =
  | { readonly kind: "Recruiting" }
  | { readonly kind: "Closed" }
  | { readonly kind: "Completed" };



export type StudyStatusError = {
  readonly kind: "InvalidTransition";
  readonly from: StudyStatus["kind"];
  readonly to: StudyStatus["kind"];
}
| { readonly kind: "NotString"; readonly value: unknown; }
|{
    readonly kind: "InvalidStatus";
    readonly value: unknown;
}



// ── 함수 모음 ──
export const StudyStatus = {
  // ✅ 1) 생성: 새 상태 만들기
  recruiting: (): StudyStatus => ({ kind: "Recruiting" }),
  closed:     (): StudyStatus => ({ kind: "Closed" }),
  completed:  (): StudyStatus => ({ kind: "Completed" }),
  // ✅ 2) 질의: 상태 확인
  isRecruiting: (s: StudyStatus): boolean => s.kind === "Recruiting",
  isClosed:     (s: StudyStatus): boolean => s.kind === "Closed",
  isCompleted:  (s: StudyStatus): boolean => s.kind === "Completed",
  // 🔜 3) 전이: 상태 변경 (지금 만들 것)

  // 모집 완료로 변경 할 때
  complete: (s: StudyStatus): Result<StudyStatus, StudyStatusError> => {
    if (s.kind !== "Recruiting") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Completed" });
    }
    return ok(StudyStatus.completed());
  },

  // 모집 중으로 변경 할 때
  vacate: (s: StudyStatus): Result<StudyStatus, StudyStatusError> => {
    if (s.kind !== "Completed") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Recruiting" });
    }
    return ok(StudyStatus.recruiting());
  },

  // 마감으로 변경 할 때
  close: (s: StudyStatus): Result<StudyStatus, StudyStatusError> => {
    if (s.kind !== "Recruiting" && s.kind !== "Completed") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Closed" });
    }
    return ok(StudyStatus.closed());
  },
};