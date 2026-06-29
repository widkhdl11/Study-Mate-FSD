// import { err, ok, Result } from "@/shared/kernel/Result";

// export type ParticipantStatus = 
// | { readonly kind : "Pending" }
// | { readonly kind : "Accepted" }
// | { readonly kind : "Rejected" }
// | { readonly kind : "kicked" }

// export type ParticipantStatusError =
// | { 
//   readonly kind: "InvalidTransition";
//   readonly from: ParticipantStatus["kind"];
//   readonly to: ParticipantStatus["kind"];
// }
// | { 
//   readonly kind : "InvalidValue", 
//   readonly value : string
// }
// | { 
//   readonly kind : "InvalidWithdraw",
//   readonly from: ParticipantStatus["kind"];
// }
// | { 
//   readonly kind : "InvalidStatusChange",
//   readonly from: ParticipantStatus["kind"];
//   readonly to: ParticipantStatus["kind"];
// }



// export const ParticipantStatus = {
//   // 생성
//   pending: () :ParticipantStatus => ({ kind : "Pending"}),
//   accepted: () :ParticipantStatus => ({ kind : "Accepted"}),
//   rejected: () :ParticipantStatus => ({ kind : "Rejected"}),
//   kicked: () :ParticipantStatus => ({ kind : "kicked"}),
  
//   // 질의
//   isPending: (p : ParticipantStatus) : boolean => p.kind === "Pending",
//   isAccepted: (p : ParticipantStatus) : boolean => p.kind === "Accepted",
//   isRejected: (p : ParticipantStatus) : boolean => p.kind === "Rejected",
//   isKicked: (p : ParticipantStatus) : boolean => p.kind === "kicked",
  
//   // 전이
//   accept : (p : ParticipantStatus) : Result<ParticipantStatus,ParticipantStatusError> => {
//     if ( p.kind !== "Pending" ){
//         return err({kind : "InvalidTransition", from :p.kind , to : "Accepted"})
//     }
//     return ok(ParticipantStatus.accepted())
//   },
//   // 거절
//   reject: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
//     if (s.kind !== "Pending") {
//       return err({ kind: "InvalidTransition", from: s.kind, to: "Rejected" });
//     }
//     return ok(ParticipantStatus.rejected());
//   },

//   // 강퇴
//   kick: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
//     if (s.kind !== "Accepted") {
//       return err({ kind: "InvalidTransition", from: s.kind, to: "kicked" });
//     }
//     return ok(ParticipantStatus.kicked());
//   },

//   // 탈퇴 / 자진 취소
//   // withdraw: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
//   //   if (s.kind !== "Accepted" && s.kind !== "Pending") {
//   //     return err({ kind: "InvalidWithdraw", from: s.kind });
//   //   }
//   //   return ok(ParticipantStatus.removed());
//   // },
//   assertSelfStatusChangeable: (s: ParticipantStatus, newStatus: ParticipantStatus): Result<void, ParticipantStatusError> => {

//     // 강퇴 상태 변경 가능 체크
//     if (ParticipantStatus.isKicked(newStatus)) {
//       if (ParticipantStatus.isAccepted(s) || ParticipantStatus.isPending(s)) {
//         return err({ kind: "InvalidStatusChange", from: s.kind, to: newStatus.kind });
//       }
//       return ok(undefined);
//     }

//     // 수락 상태 변경 가능 체크
//     if (ParticipantStatus.isAccepted(newStatus)) {
//       if (!ParticipantStatus.isPending(s)) {
//         return err({ kind: "InvalidStatusChange", from: s.kind, to: newStatus.kind });
//       }
//     }
    
//     // 거절 상태 변경 가능 체크
//     if (ParticipantStatus.isRejected(newStatus)) {
//       if (!ParticipantStatus.isPending(s)) {
//         return err({ kind: "InvalidStatusChange", from: s.kind, to: newStatus.kind });
//       }
//     }
//     // 탈퇴 상태 변경 가능 체크
//     return ok(undefined);
//   },
//  assertSelfWithdrawable: (s: ParticipantStatus): Result<void, ParticipantStatusError> => {

//    // 탈퇴 상태 변경 가능 체크
//     if (ParticipantStatus.isAccepted(s) || ParticipantStatus.isPending(s)) {
//       return err({ kind: "InvalidWithdraw", from: s.kind });
//     }
//     return ok(undefined);
   
//   },

//   // 신청
//   apply: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
//     if (s.kind !== "Rejected") {
//       return err({ kind: "InvalidTransition", from: s.kind, to: "Pending" });
//     }
//     return ok(ParticipantStatus.pending());
//   },
 

//   // boundary 함수
//   fromString : (s: string) :Result<ParticipantStatus,ParticipantStatusError> => {
//     switch(s) {
//       case "pending" : return ok(ParticipantStatus.pending());
//       case "accepted" : return ok(ParticipantStatus.accepted());
//       case "rejected" : return ok(ParticipantStatus.rejected());
//       case "kicked" : return ok(ParticipantStatus.kicked());
//       default : return err({kind:"InvalidValue", value : s})
//     }
//   },

//   toString: (s: ParticipantStatus) : string => {
//     switch(s.kind){
//       case "Pending" : return "pending";
//       case "Accepted" : return "accepted";
//       case "Rejected" : return "rejected";
//       case "kicked" : return "kicked";
//     }
//   }
// };

/**
 * ParticipantStatus
 *
 * 참여자 상태 VO. 자기 자신만 안다.
 * 다른 VO/Aggregate를 import 하지 않는다.
 */

import { err, ok, type Result } from "@/shared/kernel/Result";

// ─────────────────────────────────────────────
// 1. 타입
// ─────────────────────────────────────────────

export type ParticipantStatus =
  | { readonly kind: "Pending" }
  | { readonly kind: "Accepted" }
  | { readonly kind: "Rejected" }
  | { readonly kind: "Kicked" };  // 대문자로 통일

// ─────────────────────────────────────────────
// 2. 에러
// ─────────────────────────────────────────────

export type ParticipantStatusError =
  | {
      readonly kind: "InvalidTransition";
      readonly from: ParticipantStatus["kind"];
      readonly to: ParticipantStatus["kind"];
    }
  | {
      readonly kind: "InvalidValue";
      readonly value: string;
    }
  | {
      readonly kind: "NotWithdrawable";
      readonly from: ParticipantStatus["kind"];
    };

// ─────────────────────────────────────────────
// 3. 모듈
// ─────────────────────────────────────────────

export const ParticipantStatus = {
  // ── 생성 ──
  pending:  (): ParticipantStatus => ({ kind: "Pending" }),
  accepted: (): ParticipantStatus => ({ kind: "Accepted" }),
  rejected: (): ParticipantStatus => ({ kind: "Rejected" }),
  kicked:   (): ParticipantStatus => ({ kind: "Kicked" }),

  // ── 질의 ──
  isPending:  (p: ParticipantStatus): boolean => p.kind === "Pending",
  isAccepted: (p: ParticipantStatus): boolean => p.kind === "Accepted",
  isRejected: (p: ParticipantStatus): boolean => p.kind === "Rejected",
  isKicked:   (p: ParticipantStatus): boolean => p.kind === "Kicked",

  /** 활성 참여 상태 (Accepted 또는 Pending) — 탈퇴/강퇴 가능한 상태 */
  isActive: (p: ParticipantStatus): boolean =>
    p.kind === "Accepted" || p.kind === "Pending",

  // ── 전이 ──

  /** Pending → Accepted */
  accept: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
    if (s.kind !== "Pending") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Accepted" });
    }
    return ok(ParticipantStatus.accepted());
  },

  /** Pending → Rejected */
  reject: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
    if (s.kind !== "Pending") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Rejected" });
    }
    return ok(ParticipantStatus.rejected());
  },

  /** Accepted → Kicked (강퇴) */
  kick: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
    if (s.kind !== "Accepted") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Kicked" });
    }
    return ok(ParticipantStatus.kicked());
  },

  /** Rejected → Pending (재신청) */
  reapply: (s: ParticipantStatus): Result<ParticipantStatus, ParticipantStatusError> => {
    if (s.kind !== "Rejected") {
      return err({ kind: "InvalidTransition", from: s.kind, to: "Pending" });
    }
    return ok(ParticipantStatus.pending());
  },

  // ── 자기 자신에 대한 규칙 질의 ──
  // (assertSelfWithdrawable 등 다른 도메인 보던 함수는 Policy로 이동)

  /** 본인이 탈퇴 가능한 상태인가? (Accepted 또는 Pending일 때만) */
  isSelfWithdrawable: (s: ParticipantStatus): boolean =>
    s.kind === "Accepted" || s.kind === "Pending",

  // ── 경계 변환 ──

  fromString: (s: string): Result<ParticipantStatus, ParticipantStatusError> => {
    switch (s) {
      case "pending":  return ok(ParticipantStatus.pending());
      case "accepted": return ok(ParticipantStatus.accepted());
      case "rejected": return ok(ParticipantStatus.rejected());
      case "kicked":   return ok(ParticipantStatus.kicked());
      default:         return err({ kind: "InvalidValue", value: s });
    }
  },

  toString: (s: ParticipantStatus): string => {
    switch (s.kind) {
      case "Pending":  return "pending";
      case "Accepted": return "accepted";
      case "Rejected": return "rejected";
      case "Kicked":   return "kicked";
    }
  },
};