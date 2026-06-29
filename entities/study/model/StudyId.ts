

import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";


export type StudyId = Brand<number, "StudyId">

// ── 2. 에러 ──
export type StudyIdError = {
  readonly kind: "NotPositiveInteger";
  readonly value: number;
}


const construct = (value: number) : Result<StudyId, StudyIdError> => {
  if (!Number.isInteger(value) || value <= 0) {
    return err({ kind: "NotPositiveInteger", value });
  }
  return ok(value as StudyId);
};



export const StudyId = {
  of: construct,
  equals: (id: StudyId, actorId: StudyId): boolean => {
    return id === actorId;
  },
  
  // URL/표시용 string으로 변환 (필요할 때만)
  toString: (id: StudyId): string => String(id),
  
  // URL 파라미터에서 받은 string을 StudyId로 변환 (boundary 함수)
  fromString: (s: string): Result<StudyId, StudyIdError> => {
    const n = Number.parseInt(s, 10);
    return construct(n);  // construct가 NaN, 음수 등 다 막아줌
  },
};