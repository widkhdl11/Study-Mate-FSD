// import { err, ok, Result } from "@/shared/kernel/Result";
// import { ParticipantStatus } from "./ParticipantStatus";



// export type ParticipantRole = 
// | { readonly kind : "Host" }
// | { readonly kind : "Common" }

// export type ParticipantRoleError = 
// | { readonly kind : "InvalidValue", readonly value : string }
// // common 신청자가 아닙니다 에러
// | { readonly kind : "NotCommonUser", readonly status : ParticipantStatus["kind"] }

// export const ParticipantRole = {

//   // 생성 함수
//   host:   (): ParticipantRole => ({ kind: "Host" }),
//   common: (): ParticipantRole => ({ kind: "Common" }),

//   // 질의 함수
//   isHost:   (r: ParticipantRole): boolean => r.kind === "Host",
//   isCommon: (r: ParticipantRole): boolean => r.kind === "Common",

//   // boundary 함수
//   fromString: (s: string): Result<ParticipantRole, ParticipantRoleError> => {
//     switch (s) {
//       case "host": return ok(ParticipantRole.host());
//       case "common": return ok(ParticipantRole.common());
//       default: return err({ kind: "InvalidValue", value: s });
//     }
//   },
  
//   toString: (r: ParticipantRole): string => {
//     switch (r.kind) {
//       case "Host": return "host";
//       case "Common":  return "common";
//     }
//   },
// };

/**
 * ParticipantRole
 *
 * 참여자 역할 VO. ParticipantStatus를 import 하지 않는다.
 * (역할과 상태는 독립 개념)
 */

import { err, ok, type Result } from "@/shared/kernel/Result";

export type ParticipantRole =
  | { readonly kind: "Host" }
  | { readonly kind: "Common" };

export type ParticipantRoleError =
  | { readonly kind: "InvalidValue"; readonly value: string };
  // NotCommonUser는 ParticipantStatus를 알아야 하니 Role의 에러가 아님 → Policy 에러로

export const ParticipantRole = {
  // 생성
  host:   (): ParticipantRole => ({ kind: "Host" }),
  common: (): ParticipantRole => ({ kind: "Common" }),

  // 질의
  isHost:   (r: ParticipantRole): boolean => r.kind === "Host",
  isCommon: (r: ParticipantRole): boolean => r.kind === "Common",

  // 경계 변환
  fromString: (s: string): Result<ParticipantRole, ParticipantRoleError> => {
    switch (s) {
      case "host":   return ok(ParticipantRole.host());
      case "common": return ok(ParticipantRole.common());
      default:       return err({ kind: "InvalidValue", value: s });
    }
  },

  toString: (r: ParticipantRole): string => {
    switch (r.kind) {
      case "Host":   return "host";
      case "Common": return "common";
    }
  },
};