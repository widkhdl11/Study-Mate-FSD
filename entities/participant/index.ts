/**
 * entities/participant — Public API (cross-slice 진입점)
 *
 * 외부 슬라이스는 *이 파일만* import 한다.
 * 쓰기 시나리오(수락/거절/강퇴/탈퇴)는 ParticipantPolicy(완전 연산)를 통해야 하고,
 * Participant aggregate의 전이(accept/reject/kick…)는 policy가 내부에서 쓰는 부품이다.
 * 내부 부품은 노출 X:
 *   - construct, Participant.fromRow/toRow/toInsertRow (객체 포함)
 *   - ParticipantRow/ParticipantUpdateRow/ParticipantInsertRow/ParticipantFromRowError
 *   - ParticipantRole, ParticipantStatus (내부 VO)
 */

// ── 도메인 (aggregate + VO) ──
export { Participant } from "./model/Participant";
export type {
  DeleteParticipantIntent,
  ParticipantError, ParticipantInsert
} from "./model/Participant";
export { ParticipantId } from "./model/ParticipantId";
export type { ParticipantIdError } from "./model/ParticipantId";

// ── 정책 (cross-aggregate, use-case 진입) ──
export { ParticipantPolicy } from "./service/Participant-policy";
export type {
  AcceptError, ApplyError, KickError, RejectError, WithdrawError
} from "./service/Participant-policy";

// ── 쓰기 (Repository / command) ──
export {
  deleteParticipant, findParticipantById,
  findParticipantByStudyAndUser,
  findParticipantsByStudyId, insertParticipant, updateParticipant, upsertParticipant
} from "./api/ParticipantRepository";
export type { ParticipantRepositoryError } from "./api/ParticipantRepository";

// ── 읽기 (Query) ──
export { queryParticipantStatus } from "./api/query/participantStatus/queryParticipantStatus";
export { useParticipantStatus } from "./api/query/participantStatus/useParticipantStatus";
export { queryMyParticipations } from "./api/query/myParticipations/queryMyParticipations";
export type { MyParticipationView } from "./api/query/myParticipations/queryMyParticipations";

// ── UI (표현) ──
export { default as MemberRow } from "./ui/MembersRow";

// ── 공개 타입 ──
export type { ParticipantResponse, ParticipantWithStudyResponse } from "./model/types";
